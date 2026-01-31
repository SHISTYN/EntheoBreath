
import React, { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react';
import { BreathState, BreathingPattern, BreathingPhase } from './types';
import { DEFAULT_PATTERNS, URL_SLUGS, REVERSE_SLUGS } from './constants';
import { getBreathingAnalysis } from './services/geminiService';
import AppBackground from './components/AppBackground';
import SplashScreen from './components/SplashScreen';
import { Header } from './components/layout/Header';
import { useUserProgress } from './hooks/useUserProgress';
import { useGamification } from './hooks/useGamification';
import { AchievementPopup } from './components/gamification';
import { useAudioEngine } from './context/AudioContext';
import { useAuth } from './hooks/useAuth';
import { useAnalytics } from './hooks/useAnalytics';
import { Maximize2, Minimize2, History, RotateCcw, Play, Pause, Timer, Hourglass, SlidersHorizontal } from 'lucide-react';
import { LiquidButton } from './components/ui/LiquidButton';

// --- ROBUST LAZY LOADING HELPER ---
const lazyWithRetry = (componentImport: () => Promise<any>) =>
    lazy(async () => {
        const pageHasAlreadyBeenForceRefreshed = JSON.parse(
            window.sessionStorage.getItem('entheo-retry-refresh') || 'false'
        );

        try {
            const component = await componentImport();
            window.sessionStorage.setItem('entheo-retry-refresh', 'false');
            return component;
        } catch (error: any) {
            console.error("Lazy load error:", error);
            if (
                !pageHasAlreadyBeenForceRefreshed &&
                (error.message?.includes("Failed to fetch") || error.message?.includes("Importing a module"))
            ) {
                window.sessionStorage.setItem('entheo-retry-refresh', 'true');
                window.location.reload();
                return { default: () => <div className="h-full flex items-center justify-center text-sm opacity-50 animate-pulse">Обновление версии...</div> };
            }
            throw error;
        }
    });

// --- LAZY IMPORTS (OPTIMIZED) ---
// Core views kept eager for LCP
import LibraryView from './components/LibraryView';

// Lazy load specific implementations and heavy modals
const Controls = lazyWithRetry(() => import('./components/Controls'));
const TimerVisual = lazyWithRetry(() => import('./components/TimerVisual'));
const AnulomaVilomaInterface = lazyWithRetry(() => import('./components/AnulomaVilomaInterface'));
const BoxTimerVisual = lazyWithRetry(() => import('./components/BoxTimerVisual'));
const WimHofInterface = lazyWithRetry(() => import('./components/WimHofInterface'));
const TimerSidebar = lazyWithRetry(() => import('./components/TimerSidebar'));
const AnalysisModal = lazyWithRetry(() => import('./components/AnalysisModal'));
// Replace MobileFaq with InstallGuide
// Lazy load PrivacyPolicy
const PrivacyPolicy = lazyWithRetry(() => import('./components/legal/PrivacyPolicy').then(module => ({ default: module.PrivacyPolicy })));
const NotificationRequest = lazyWithRetry(() => import('./components/retention/NotificationRequest').then(module => ({ default: module.NotificationRequest })));
const PaywallModal = lazyWithRetry(() => import('./components/paywall/PaywallModal').then(module => ({ default: module.PaywallModal })));
const InstallGuide = lazyWithRetry(() => import('./components/pwa/InstallGuide').then(module => ({ default: module.InstallGuide })));

import { notificationService } from './services/notificationService';
import { usePro } from './hooks/usePro';



// --- TYPES ---
type ThemeMode = 'dark' | 'light';
type ExecutionMode = 'timer' | 'stopwatch';
type ViewState = 'library' | 'timer';

const LoadingFallback = () => (
    <div className="w-full h-full flex items-center justify-center min-h-[280px]">
        <div className="w-6 h-6 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
    </div>
);

const App: React.FC = () => {
    const { favorites, toggleFavorite, saveSession, history } = useUserProgress();
    const { xp, level, streak, xpProgress, newAchievement, clearNewAchievement, recordSession } = useGamification();
    const { setTimerActive } = useAudioEngine();
    const { user, loading: authLoading } = useAuth();
    const { track } = useAnalytics();

    // --- State ---
    const [activePattern, setActivePattern] = useState<BreathingPattern>(DEFAULT_PATTERNS[0]);
    const [rounds, setRounds] = useState<number>(0);
    const [view, setView] = useState<ViewState>('library');
    const [infoTab, setInfoTab] = useState<'about' | 'guide'>('about');
    const [isLoadingApp, setIsLoadingApp] = useState(true);
    const [executionMode, setExecutionMode] = useState<ExecutionMode>('timer');
    const [theme, setTheme] = useState<ThemeMode>('dark');

    // Analytics: Track Page Views
    useEffect(() => {
        track('page_view', { page: view });
    }, [view, track]);


    // ZEN MODE STATE (Hides Sidebar)
    const [isZenMode, setZenMode] = useState(false);

    // Stable handler for Zen Mode
    const handleStartZen = useCallback(() => setZenMode(true), []);

    // Timer State
    const [timerState, setTimerState] = useState<BreathState>({
        currentPhase: BreathingPhase.Ready,
        secondsRemaining: 3,
        totalSecondsElapsed: 0,
        currentRound: 1,
        currentBreath: 1,
        isActive: false,
        isPaused: false,
        sessionResults: []
    });

    // Sync Timer Active state to Audio Engine (for Playback Mode)
    useEffect(() => {
        setTimerActive(timerState.isActive && !timerState.isPaused);
    }, [timerState.isActive, timerState.isPaused, setTimerActive]);

    // Analysis State
    const [isAnalysisOpen, setAnalysisOpen] = useState(false);
    const [analysisContent, setAnalysisContent] = useState("");
    const [isAnalyzing, setAnalyzing] = useState(false);

    // Modal State
    const [showMobileFaq, setShowMobileFaq] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    // Pro Features
    const { isPro } = usePro();
    const [showPaywall, setShowPaywall] = useState(false);

    // Initial Checks (Notifications + Visit Count)
    useEffect(() => {
        // Track visits
        const visits = parseInt(localStorage.getItem('entheo_visit_count') || '0') + 1;
        localStorage.setItem('entheo_visit_count', visits.toString());

        // Check Notification Permission (delay to not overwhelm)
        const timer = setTimeout(() => {
            if (notificationService.shouldAskForPermission()) {
                setShowNotifications(true);
            } else {
                // If already granted, run logic check
                // We assume 'streak' logic (today session) is passed later, but for now we pass a raw check
                // Actually, let's get 'hasFinishedSession' from local storage for a rough check, 
                // or rely on gamification hook. But hook is cleaner.
                // For MVP, we pass false to force reminder if permitted.
                // Wait, useGamification hook provides streak?
                // Ideally this should be inside a useEffect dependent on gamification data.
                // But typically notifications are background. Here we just trigger on load.
                notificationService.checkReminders(false); // TODO: Pass real 'todaySession' status
            }
        }, 5000); // 5 sec delay on load

        return () => clearTimeout(timer);
    }, []);

    // Audio & Refs
    const {
        soundMode, setSoundMode, playSoundEffect, initializeAudio, playCountdownTick, playPhaseSound, isReady
    } = useAudioEngine();

    const requestRef = useRef<number | undefined>(undefined);
    const previousTimeRef = useRef<number | undefined>(undefined);
    const wakeLockRef = useRef<any>(null);
    const lastSecondRef = useRef<number>(-1);

    const checkAudioContext = useCallback(async () => {
        if (!isReady) await initializeAudio();
    }, [isReady, initializeAudio]);

    // Ensure AudioContext is running on first user interaction
    useEffect(() => {
        const unlock = () => { checkAudioContext(); };
        window.addEventListener('click', unlock);
        window.addEventListener('touchstart', unlock);
        return () => {
            window.removeEventListener('click', unlock);
            window.removeEventListener('touchstart', unlock);
        };
    }, [checkAudioContext]);

    // --- SWIPE GESTURE STATE ---
    const touchStartRef = useRef<{ x: number, y: number } | null>(null);

    // --- AUTO-PAUSE LOGIC (REMOVED BACKGROUND PAUSE) ---
    useEffect(() => {
        // Only pause if returning to library, NOT if switching tabs
        if (view === 'library') {
            setTimerState(prev => {
                if (prev.isActive) {
                    return { ...prev, isActive: false, isPaused: true, currentPhase: BreathingPhase.Ready };
                }
                return prev;
            });
        }
    }, [view]);

    // --- INIT LOGIC ---
    useEffect(() => {
        try {
            const path = window.location.pathname.replace(/^\/|\/$/g, '').toLowerCase();
            if (path && path !== '' && !path.includes('.')) {
                const patternId = REVERSE_SLUGS[path] || path;
                const found = DEFAULT_PATTERNS.find(p => p.id === patternId);
                if (found) {
                    setActivePattern(found);
                    setView('timer');
                    if (found.mode === 'manual') {
                        setInfoTab('guide');
                        setExecutionMode('stopwatch');
                    } else {
                        setInfoTab('about');
                        setExecutionMode('timer');
                    }
                    setRounds(found.mode === 'wim-hof' ? 3 : 12);
                }
            }
        } catch (e) { console.warn("URL path error:", e); }
    }, []);

    useEffect(() => {
        try {
            if (window.location.protocol === 'blob:') return;
            if (view === 'timer' && activePattern) {
                const slug = URL_SLUGS[activePattern.id] || activePattern.id;
                const newPath = `/${slug}`;
                if (window.location.pathname !== newPath) {
                    window.history.replaceState({}, '', newPath);
                }
            } else if (view === 'library') {
                if (window.location.pathname !== '/') {
                    window.history.replaceState({}, '', '/');
                }
            }
        } catch (err) { console.debug("URL update skipped"); }
    }, [activePattern, view]);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoadingApp(false), 2500);
        return () => clearTimeout(timer);
    }, []);





    useEffect(() => {
        if (theme === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, [theme]);

    const toggleTheme = useCallback(() => setTheme(prev => prev === 'dark' ? 'light' : 'dark'), []);

    const handleShare = useCallback(async () => {
        if (navigator.share) {
            try { await navigator.share({ title: 'EntheoBreath', url: window.location.href }); } catch (error) { }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("Ссылка скопирована!");
        }
    }, []);

    useEffect(() => {
        const requestWakeLock = async () => {
            if ('wakeLock' in navigator && document.visibilityState === 'visible') {
                try { wakeLockRef.current = await (navigator as any).wakeLock.request('screen'); } catch (err) { }
            }
        };
        const releaseWakeLock = async () => {
            if (wakeLockRef.current) {
                try { await wakeLockRef.current.release(); wakeLockRef.current = null; } catch (err) { }
            }
        };
        if (timerState.isActive && !timerState.isPaused) requestWakeLock();
        else releaseWakeLock();

        document.addEventListener('visibilitychange', async () => {
            if (wakeLockRef.current !== null && document.visibilityState === 'visible') await requestWakeLock();
        });
        return () => { releaseWakeLock(); };
    }, [timerState.isActive, timerState.isPaused]);

    // --- SWIPE ---
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (!touchStartRef.current) return;

        const touchEnd = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
        const diffX = touchEnd.x - touchStartRef.current.x;
        const diffY = touchEnd.y - touchStartRef.current.y;

        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 100) {
            if (diffX > 0) {
                setView('library');
            }
        }
        touchStartRef.current = null;
    };

    // --- TIMER ENGINE ---
    const advancePhase = useCallback(() => {
        setTimerState(prev => {
            let nextPhase = prev.currentPhase;
            let nextDuration = 0;
            let nextRound = prev.currentRound;
            let nextBreath = prev.currentBreath;
            let shouldPause = false;

            if (executionMode === 'stopwatch' || activePattern.mode === 'wim-hof') return prev;

            switch (prev.currentPhase) {
                case BreathingPhase.Ready:
                    nextPhase = BreathingPhase.Inhale;
                    nextDuration = activePattern.inhale;
                    break;
                case BreathingPhase.Inhale:
                    if (activePattern.holdIn > 0) {
                        nextPhase = BreathingPhase.HoldIn;
                        nextDuration = activePattern.holdIn;
                    } else {
                        nextPhase = BreathingPhase.Exhale;
                        nextDuration = activePattern.exhale;
                    }
                    break;
                case BreathingPhase.HoldIn:
                    nextPhase = BreathingPhase.Exhale;
                    nextDuration = activePattern.exhale;
                    break;
                case BreathingPhase.Exhale:
                    if (activePattern.holdOut > 0) {
                        nextPhase = BreathingPhase.HoldOut;
                        nextDuration = activePattern.holdOut;
                    } else {
                        if (rounds > 0 && prev.currentRound >= rounds) nextPhase = BreathingPhase.Done;
                        else {
                            nextRound = prev.currentRound + 1;
                            nextPhase = BreathingPhase.Inhale;
                            nextDuration = activePattern.inhale;
                        }
                    }
                    break;
                case BreathingPhase.HoldOut:
                    if (rounds > 0 && prev.currentRound >= rounds) nextPhase = BreathingPhase.Done;
                    else {
                        nextRound = prev.currentRound + 1;
                        nextPhase = BreathingPhase.Inhale;
                        nextDuration = activePattern.inhale;
                    }
                    break;
                default: return prev;
            }

            if (nextPhase !== prev.currentPhase) {
                playPhaseSound(nextPhase);
            }

            if (nextPhase === BreathingPhase.Done) {
                saveSession({
                    patternId: activePattern.id,
                    patternName: activePattern.name,
                    durationSeconds: prev.totalSecondsElapsed,
                    roundsCompleted: prev.currentRound
                });
                recordSession(activePattern.id, prev.totalSecondsElapsed);
                return { ...prev, currentPhase: nextPhase, isActive: false, isPaused: false, secondsRemaining: 0 };
            }

            return {
                ...prev,
                currentPhase: nextPhase,
                secondsRemaining: nextDuration,
                currentRound: nextRound,
                currentBreath: nextBreath,
                isActive: !shouldPause,
                isPaused: shouldPause
            };
        });
    }, [activePattern, rounds, executionMode, playPhaseSound, saveSession]);

    const tick = useCallback((time: number) => {
        if (previousTimeRef.current !== undefined) {
            const deltaTime = (time - previousTimeRef.current) / 1000;
            setTimerState(prev => {
                if (!prev.isActive || prev.isPaused || prev.currentPhase === BreathingPhase.Done) return prev;

                if (executionMode === 'timer' && prev.secondsRemaining > 0 && prev.secondsRemaining <= 3.1) {
                    const currentSec = Math.ceil(prev.secondsRemaining);
                    if (currentSec !== lastSecondRef.current) {
                        if (currentSec > 0 && currentSec <= 3) {
                            playCountdownTick(currentSec);
                        }
                        lastSecondRef.current = currentSec;
                    }
                } else {
                    lastSecondRef.current = -1;
                }

                if (executionMode === 'stopwatch') return { ...prev, totalSecondsElapsed: prev.totalSecondsElapsed + deltaTime, secondsRemaining: prev.secondsRemaining + deltaTime };
                const newTimeLeft = prev.secondsRemaining - deltaTime;
                return { ...prev, secondsRemaining: newTimeLeft, totalSecondsElapsed: prev.totalSecondsElapsed + deltaTime };
            });
        }
        previousTimeRef.current = time;
        requestRef.current = requestAnimationFrame(tick);
    }, [executionMode, activePattern.mode, playCountdownTick]);

    useEffect(() => {
        if (timerState.isActive && !timerState.isPaused) requestRef.current = requestAnimationFrame(tick);
        else {
            previousTimeRef.current = undefined;
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        }
        return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); }
    }, [timerState.isActive, timerState.isPaused, tick]);

    useEffect(() => {
        if (executionMode !== 'stopwatch' && activePattern.mode !== 'wim-hof' && timerState.isActive && !timerState.isPaused && timerState.secondsRemaining <= 0.05 && timerState.currentPhase !== BreathingPhase.Done) {
            advancePhase();
        }
    }, [timerState.secondsRemaining, timerState.isActive, timerState.isPaused, timerState.currentPhase, advancePhase, executionMode, activePattern.mode]);

    const toggleTimer = () => {
        checkAudioContext();
        if (timerState.currentPhase === BreathingPhase.Done) {
            resetTimer();
            setTimeout(() => {
                setTimerState(prev => ({ ...prev, isActive: true, isPaused: false }));
                setZenMode(true);
            }, 100);
        } else {
            if (!timerState.isActive && timerState.currentPhase === BreathingPhase.Ready) {
                setTimerState(prev => ({ ...prev, isActive: true, isPaused: false }));
                setZenMode(true);
            } else {
                setTimerState(prev => ({ ...prev, isPaused: !prev.isPaused }));
            }
        }
    };

    const resetTimer = useCallback(() => {
        setTimerState({
            currentPhase: BreathingPhase.Ready,
            secondsRemaining: executionMode === 'stopwatch' ? 0 : 3,
            totalSecondsElapsed: 0,
            currentRound: 1,
            currentBreath: 1,
            isActive: false,
            isPaused: false,
            sessionResults: []
        });
    }, [executionMode]);

    const handlePatternChange = useCallback((newPattern: BreathingPattern) => {
        setActivePattern(newPattern);
        resetTimer();
    }, [resetTimer]);

    const handleDeepAnalysis = useCallback(async () => {
        const cacheKey = `entheo_analysis_${activePattern.id}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            setAnalysisContent(cached);
            setAnalysisOpen(true);
            setAnalyzing(false);
            return;
        }
        setAnalysisOpen(true);
        setAnalyzing(true);
        const text = await getBreathingAnalysis(activePattern.name, `${activePattern.inhale}-${activePattern.holdIn}-${activePattern.exhale}-${activePattern.holdOut}`);
        localStorage.setItem(cacheKey, text);
        setAnalysisContent(text);
        setAnalyzing(false);
    }, [activePattern]);

    const selectPattern = (p: BreathingPattern) => {
        setActivePattern(p);
        setView('timer');
        if (p.mode === 'manual') {
            setInfoTab('guide');
            setExecutionMode('stopwatch');
        } else {
            setInfoTab('about');
            setExecutionMode('timer');
        }
        setRounds(p.mode === 'wim-hof' ? 3 : 12);
        resetTimer();
        setZenMode(false);
    };

    const getPhaseDuration = () => {
        switch (timerState.currentPhase) {
            case BreathingPhase.Inhale: return activePattern.inhale;
            case BreathingPhase.HoldIn: return activePattern.holdIn;
            case BreathingPhase.Exhale: return activePattern.exhale;
            case BreathingPhase.HoldOut: return activePattern.holdOut;
            default: return 3;
        }
    };

    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };
    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        return new Intl.DateTimeFormat('ru-RU', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
    };

    const isWimHof = activePattern.mode === 'wim-hof';
    const isAnulomaOrNadi = activePattern.id === 'anuloma-viloma-base' || activePattern.id === 'nadi-shodhana';
    const isManual = activePattern.mode === 'manual';
    const isHolotropic = activePattern.id === 'holotropic';
    const currentPatternHistory = history.filter(h => h.patternId === activePattern.id).slice(0, 10);

    const isSetupControlsVisible = !timerState.isActive || timerState.isPaused;
    const showPlayIcon = !timerState.isActive || timerState.isPaused || timerState.currentPhase === BreathingPhase.Done;

    const calculateRemainingTime = () => {
        if (rounds === 0) return -1;
        const cycleDuration = activePattern.inhale + activePattern.holdIn + activePattern.exhale + activePattern.holdOut;
        const totalDuration = cycleDuration * rounds;
        const remaining = Math.max(0, totalDuration - timerState.totalSecondsElapsed);
        return remaining;
    };

    // --- THEME SYNC (Fix for Black Strip in Light Mode) ---
    useEffect(() => {
        const bg = theme === 'dark' ? '#000000' : '#F5F5F7';
        document.body.style.backgroundColor = bg;
        document.documentElement.style.backgroundColor = bg;

        // Update PWA Theme Color
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', bg);
        }
    }, [theme]);

    const remainingSeconds = calculateRemainingTime();

    if (showPrivacy) {
        return (
            <Suspense fallback={<LoadingFallback />}>
                <PrivacyPolicy onBack={() => setShowPrivacy(false)} />
            </Suspense>
        );
    }

    return (
        <div className="w-full flex flex-col h-full font-sans bg-black text-zinc-900 dark:text-gray-100 transition-colors duration-500 overflow-hidden relative overscroll-none">

            <SplashScreen isLoading={isLoadingApp} />
            <AppBackground theme={theme} />

            <Suspense fallback={null}>
                <InstallGuide isOpen={showMobileFaq} onClose={() => setShowMobileFaq(false)} />
                <NotificationRequest isOpen={showNotifications} onClose={() => setShowNotifications(false)} onGranted={() => setShowNotifications(false)} />
                <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
                <AnalysisModal isOpen={isAnalysisOpen} onClose={() => setAnalysisOpen(false)} title={`AI Анализ: ${activePattern.name}`} content={analysisContent} isLoading={isAnalyzing} />
                <AchievementPopup achievement={newAchievement} onClose={clearNewAchievement} />
            </Suspense>

            {/* HEADER */}
            <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-in-out transform ${view === 'timer' ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
                <Header
                    view={view}
                    setView={setView}
                    theme={theme}
                    toggleTheme={toggleTheme}
                    soundMode={soundMode}
                    changeSoundMode={setSoundMode}
                    handleShare={handleShare}
                    setShowMobileFaq={setShowMobileFaq}
                    userLevel={level}
                    userStreak={streak}
                    xpProgress={xpProgress}
                    isPro={isPro}
                />
            </div>

            <main className="flex-1 flex flex-col w-full relative z-10 overflow-hidden h-full pt-safe" role="main" aria-label="Дыхательная практика">

                {view === 'library' && (
                    <div className="flex-1 overflow-y-auto custom-scrollbar alive-scroll pt-24 pb-40 overscroll-y-none">
                        <Suspense fallback={<LoadingFallback />}>
                            <LibraryView
                                selectPattern={selectPattern}
                                favorites={favorites}
                                toggleFavorite={toggleFavorite}
                                isPro={isPro}
                                onShowPaywall={() => setShowPaywall(true)}
                            />
                        </Suspense>
                    </div>
                )}

                {view === 'timer' && (
                    <div
                        className="w-full h-full flex flex-col lg:flex-row relative"
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                    >

                        {/* 1. SIDEBAR */}
                        <div
                            className={`
                        lg:relative absolute inset-0 lg:inset-auto z-30 lg:z-10
                        transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)]
                        overflow-hidden
                        ${isZenMode ? 'w-0 opacity-0 pointer-events-none translate-x-[-100%] lg:translate-x-0' : 'w-full lg:w-[420px] opacity-100 translate-x-0'}
                    `}
                        >
                            <div className="w-full h-full lg:w-[420px] overflow-hidden">
                                <Suspense fallback={<div className="p-10 text-center opacity-50">Загрузка...</div>}>
                                    <TimerSidebar
                                        activePattern={activePattern}
                                        setView={setView}
                                        infoTab={infoTab}
                                        setInfoTab={setInfoTab}
                                        handleDeepAnalysis={handleDeepAnalysis}
                                        isAnalyzing={isAnalyzing}
                                        onStart={handleStartZen}
                                    />
                                </Suspense>
                            </div>
                        </div>

                        {/* 2. CENTER STAGE */}
                        <div className="flex-1 h-full flex flex-col relative z-10 overflow-hidden">

                            <div className={`absolute inset-0 transition-opacity duration-1000 z-0 pointer-events-none opacity-30`} style={{ background: 'radial-gradient(circle at center, rgba(34, 211, 238, 0.15) 0%, rgba(0,0,0,0) 70%)' }}></div>

                            {isZenMode && (
                                <div className="lg:hidden absolute top-4 left-4 z-50">
                                    <LiquidButton
                                        onClick={() => setZenMode(false)}
                                        variant="glass"
                                        size="icon"
                                        className="rounded-full"
                                    >
                                        <SlidersHorizontal size={18} />
                                    </LiquidButton>
                                </div>
                            )}

                            <div className="flex-1 w-full flex flex-col p-4 relative z-10 overflow-y-auto custom-scrollbar overscroll-y-none pb-32">

                                {/* A. TOP HUD (Floating Island) - Sticky */}
                                {!isWimHof && (
                                    <div className={`
                                sticky top-0 z-40 mb-2 pt-4 pb-2 shrink-0 self-center bg-gradient-to-b from-black via-black/80 to-transparent
                                transition-all duration-500 ease-out
                            `}>
                                        <div className="flex items-center gap-0 bg-black/60 backdrop-blur-3xl rounded-full border border-white/10 shadow-[0_0_20px_-5px_rgba(0,0,0,0.5)] overflow-hidden">
                                            <div className="flex items-center gap-2 px-5 py-2.5 border-r border-white/10">
                                                <Timer size={12} className="text-zinc-500" />
                                                <span className="text-sm font-mono font-bold text-zinc-300">
                                                    {formatDuration(timerState.totalSecondsElapsed)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 px-5 py-2.5">
                                                <Hourglass
                                                    size={12}
                                                    className={`text-cyan-500 transition-transform duration-1000 ease-in-out ${remainingSeconds === -1 ? 'rotate-90' : 'rotate-0'}`}
                                                />
                                                {remainingSeconds !== -1 && (
                                                    <span className="text-sm font-mono font-bold text-cyan-400">
                                                        {formatDuration(remainingSeconds)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* B. VISUALIZER */}
                                <div className="flex-1 w-full flex items-center justify-center min-h-[320px] mb-4 shrink-0">
                                    <Suspense fallback={<LoadingFallback />}>
                                        {isHolotropic ? (
                                            <div className="w-[300px] h-[300px] flex flex-col items-center justify-center relative overflow-hidden rounded-full border border-white/5">
                                                <div className="absolute inset-0 bg-purple-500/10 blur-[80px] animate-pulse-slow"></div>
                                                <div className="relative z-10 text-center space-y-4">
                                                    <div className="text-6xl animate-pulse">♾️</div>
                                                    <h3 className="text-xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">ТРАНСЦЕНДЕНЦИЯ</h3>
                                                </div>
                                            </div>
                                        ) : isWimHof ? (
                                            <WimHofInterface
                                                pattern={activePattern}
                                                onExit={() => setView('library')}
                                                isZenMode={isZenMode}
                                                onToggleZen={() => setZenMode(!isZenMode)}
                                            />
                                        ) : isAnulomaOrNadi ? (
                                            <div className="transform scale-100 lg:scale-125 origin-center transition-transform duration-700">
                                                <AnulomaVilomaInterface
                                                    phase={timerState.currentPhase}
                                                    timeLeft={timerState.secondsRemaining}
                                                    totalTime={getPhaseDuration()}
                                                    currentRound={timerState.currentRound}
                                                    totalRounds={rounds}
                                                    isActive={timerState.isActive && !timerState.isPaused}
                                                />
                                            </div>
                                        ) : activePattern.id === 'box-breathing' && executionMode !== 'stopwatch' ? (
                                            <BoxTimerVisual
                                                phase={timerState.currentPhase}
                                                timeLeft={timerState.secondsRemaining}
                                                totalTimeForPhase={4}
                                                currentRound={timerState.currentRound}
                                                totalRounds={rounds}
                                                label={timerState.currentPhase}
                                            />
                                        ) : (
                                            <TimerVisual
                                                phase={timerState.currentPhase}
                                                timeLeft={executionMode === 'stopwatch' ? timerState.totalSecondsElapsed : timerState.secondsRemaining}
                                                totalTimeForPhase={timerState.secondsRemaining}
                                                label={timerState.currentPhase}
                                                currentRound={timerState.currentRound}
                                                totalRounds={rounds}
                                                currentBreath={timerState.currentBreath}
                                                totalBreaths={activePattern.breathCount}
                                                mode={executionMode === 'stopwatch' ? 'stopwatch' : activePattern.mode}
                                                theme={theme}
                                                isActive={timerState.isActive && !timerState.isPaused}
                                            />
                                        )}
                                    </Suspense>
                                </div>

                            </div>

                            {/* C. BOTTOM STACK - AIR UI (FLOATING OVERLAY) - EX MOVED OUTSIDE SCROLLABLE */}
                            <div className="w-full shrink-0 flex flex-col items-center gap-6 lg:gap-8 pb-4 lg:pb-8 transition-all duration-300 z-50 pointer-events-none pb-safe mt-auto">
                                {/* Wrapper to restore pointer events for buttons */}
                                <div className="w-full max-w-md lg:max-w-2xl px-4 flex flex-col gap-4 pointer-events-auto">

                                    {/* 1. DOCK (FLOATING BUTTONS) */}
                                    {/* Removed container background for "Air" feel */}
                                    {!isWimHof && (
                                        <div className="flex justify-center transition-all duration-300 relative z-20 gap-6 items-center">
                                            {/* RESET */}
                                            <LiquidButton
                                                variant="glass"
                                                className="w-14 h-14 !p-0 !rounded-full border-white/10 text-zinc-400 hover:text-white"
                                                onClick={resetTimer}
                                                title="Сброс"
                                                aria-label="Сбросить таймер"
                                            >
                                                <RotateCcw size={20} aria-hidden="true" />
                                            </LiquidButton>

                                            {/* MAIN ACTION - GLOWING ISLAND */}
                                            <LiquidButton
                                                variant="primary"
                                                className="w-24 h-16 !p-0 !rounded-3xl bg-white text-black shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-5px_rgba(255,255,255,0.5)] border-2 border-white/50"
                                                onClick={toggleTimer}
                                                aria-label={showPlayIcon ? "Начать дыхательную практику" : "Пауза"}
                                            >
                                                {showPlayIcon ? <Play size={28} fill="black" className="ml-1" aria-hidden="true" /> : <Pause size={28} fill="black" aria-hidden="true" />}
                                            </LiquidButton>

                                            {/* ZEN MODE */}
                                            <LiquidButton
                                                variant="glass"
                                                className="w-14 h-14 !p-0 !rounded-full border-white/10 text-zinc-400 hover:text-white"
                                                onClick={() => setZenMode(!isZenMode)}
                                                title={isZenMode ? "Показать меню" : "Дзен режим"}
                                                aria-label={isZenMode ? "Показать меню настроек" : "Включить дзен режим"}
                                            >
                                                {isZenMode ? <Minimize2 size={20} aria-hidden="true" /> : <Maximize2 size={20} aria-hidden="true" />}
                                            </LiquidButton>
                                        </div>
                                    )}

                                    {/* 2. CONTROLS (SLIDE IN/OUT) */}
                                    <div className={`transition-all duration-500 ease-in-out w-full overflow-hidden ${isSetupControlsVisible ? 'opacity-100 max-h-[600px]' : 'opacity-0 max-h-0'}`}>
                                        {!isWimHof && !isHolotropic && (
                                            <div className="flex flex-col gap-6 pt-2">
                                                {!isManual && executionMode === 'timer' && (
                                                    <Suspense fallback={null}>
                                                        <Controls
                                                            pattern={{ ...activePattern, mode: activePattern.mode }}
                                                            onChange={handlePatternChange}
                                                            rounds={rounds}
                                                            onRoundsChange={setRounds}
                                                            readOnly={false}
                                                        />
                                                    </Suspense>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* 3. HISTORY - скрываем во время активной практики */}
                                    {currentPatternHistory.length > 0 && isSetupControlsVisible && (
                                        <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 mt-2 backdrop-blur-md shadow-lg">
                                            <div className="flex items-center justify-between mb-2 border-b border-white/10 pb-1">
                                                <div className="flex items-center gap-2 text-zinc-400"><History size={12} /><span className="text-[9px] font-bold uppercase tracking-widest">История</span></div>
                                            </div>
                                            <div className="space-y-1.5 max-h-[100px] overflow-y-auto custom-scrollbar">
                                                {currentPatternHistory.map((item) => (
                                                    <div key={item.id} className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                                                        <span className="text-xs font-bold text-zinc-200">{formatDate(item.date)}</span>
                                                        <span className="text-xs font-mono font-bold text-cyan-400">{formatDuration(item.durationSeconds)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </main>
        </div>
    );
};

export default App;
