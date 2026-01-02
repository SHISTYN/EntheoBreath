
import React, { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react';
import { BreathState, BreathingPattern, BreathingPhase } from './types';
import { DEFAULT_PATTERNS, URL_SLUGS, REVERSE_SLUGS } from './constants';
import { getBreathingAnalysis } from './services/geminiService';
import AppBackground from './components/AppBackground';
import SplashScreen from './components/SplashScreen';
import { Header } from './components/layout/Header';
import { useAudioSystem } from './hooks/useAudioSystem';
import { useUserProgress } from './hooks/useUserProgress';
import { useAudioEngine } from './context/AudioContext';
import { Maximize2, Minimize2, History, RotateCcw, Play, Pause, Timer, Hourglass, SlidersHorizontal } from 'lucide-react'; 

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

// --- LAZY IMPORTS ---
const Controls = lazyWithRetry(() => import('./components/Controls'));
const TimerVisual = lazyWithRetry(() => import('./components/TimerVisual'));
const AnulomaVilomaInterface = lazyWithRetry(() => import('./components/AnulomaVilomaInterface')); 
const BoxTimerVisual = lazyWithRetry(() => import('./components/BoxTimerVisual'));
const WimHofInterface = lazyWithRetry(() => import('./components/WimHofInterface'));
const AnalysisModal = lazyWithRetry(() => import('./components/AnalysisModal'));
const LibraryView = lazyWithRetry(() => import('./components/LibraryView'));
const TimerSidebar = lazyWithRetry(() => import('./components/TimerSidebar'));
const MobileFaq = lazyWithRetry(() => import('./components/MobileFaq'));

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
  const { setTimerActive } = useAudioEngine();

  // --- State ---
  const [activePattern, setActivePattern] = useState<BreathingPattern>(DEFAULT_PATTERNS[0]);
  const [rounds, setRounds] = useState<number>(0); 
  const [view, setView] = useState<ViewState>('library');
  // UPDATED: Removed 'safety' from state type
  const [infoTab, setInfoTab] = useState<'about' | 'guide'>('about'); 
  const [isLoadingApp, setIsLoadingApp] = useState(true);
  const [executionMode, setExecutionMode] = useState<ExecutionMode>('timer');
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  // ZEN MODE STATE (Hides Sidebar)
  const [isZenMode, setZenMode] = useState(false);

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
    // Only active if running AND not paused
    setTimerActive(timerState.isActive && !timerState.isPaused);
  }, [timerState.isActive, timerState.isPaused, setTimerActive]);

  // Analysis State
  const [isAnalysisOpen, setAnalysisOpen] = useState(false);
  const [analysisContent, setAnalysisContent] = useState("");
  const [isAnalyzing, setAnalyzing] = useState(false);
  
  // Modal State
  const [showMobileFaq, setShowMobileFaq] = useState(false);

  // Audio & Refs
  const { soundMode, changeSoundMode, playSoundEffect, initAudio, playCountdownTick } = useAudioSystem();
  const requestRef = useRef<number | undefined>(undefined);
  const previousTimeRef = useRef<number | undefined>(undefined);
  const wakeLockRef = useRef<any>(null);
  const lastSecondRef = useRef<number>(-1);

  // --- SWIPE GESTURE STATE ---
  const touchStartRef = useRef<{x: number, y: number} | null>(null);

  // --- CRITICAL: AUTO-PAUSE ON VIEW CHANGE OR BACKGROUNDING ---
  useEffect(() => {
      if (view === 'library') {
          setTimerState(prev => {
              if (prev.isActive) {
                  return { ...prev, isActive: false, isPaused: true, currentPhase: BreathingPhase.Ready };
              }
              return prev;
          });
      }
  }, [view]);

  useEffect(() => {
      const handleVisibilityChange = () => {
          if (document.hidden) {
              setTimerState(prev => {
                  if (prev.isActive && !prev.isPaused) {
                      return { ...prev, isPaused: true };
                  }
                  return prev;
              });
          }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // --- INIT LOGIC (PATH PARSING) ---
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

  // --- URL UPDATING (PATH) ---
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
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    setDeferredPrompt(null);
  };

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const handleShare = async () => {
      if (navigator.share) {
          try { await navigator.share({ title: 'EntheoBreath', url: window.location.href }); } catch (error) {}
      } else {
          navigator.clipboard.writeText(window.location.href);
          alert("Ссылка скопирована!");
      }
  };

  // --- WAKE LOCK ---
  useEffect(() => {
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator && document.visibilityState === 'visible') {
        try { wakeLockRef.current = await (navigator as any).wakeLock.request('screen'); } catch (err) {}
      }
    };
    const releaseWakeLock = async () => {
      if (wakeLockRef.current) {
        try { await wakeLockRef.current.release(); wakeLockRef.current = null; } catch (err) {}
      }
    };
    if (timerState.isActive && !timerState.isPaused) requestWakeLock();
    else releaseWakeLock();
    
    document.addEventListener('visibilitychange', async () => {
        if (wakeLockRef.current !== null && document.visibilityState === 'visible') await requestWakeLock();
    });
    return () => { releaseWakeLock(); };
  }, [timerState.isActive, timerState.isPaused]);

  // --- SWIPE HANDLERS ---
  const handleTouchStart = (e: React.TouchEvent) => {
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
      if (!touchStartRef.current) return;
      
      const touchEnd = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
      const diffX = touchEnd.x - touchStartRef.current.x;
      const diffY = touchEnd.y - touchStartRef.current.y;

      // Logic: Horizontal swipe > 100px, minimal vertical movement
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 100) {
          if (diffX > 0) {
              // Swipe Right -> Go Back to Library
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

      if (nextPhase !== prev.currentPhase) playSoundEffect(soundMode);
      
      if (nextPhase === BreathingPhase.Done) {
          saveSession({
              patternId: activePattern.id,
              patternName: activePattern.name,
              durationSeconds: prev.totalSecondsElapsed,
              roundsCompleted: prev.currentRound
          });
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
  }, [activePattern, rounds, soundMode, executionMode, playSoundEffect, saveSession]);

  const tick = useCallback((time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = (time - previousTimeRef.current) / 1000;
      setTimerState(prev => {
        if (!prev.isActive || prev.isPaused || prev.currentPhase === BreathingPhase.Done) return prev;
        
        // --- COUNTDOWN LOGIC ---
        // Play tick at 3, 2, 1
        if (executionMode === 'timer' && prev.secondsRemaining > 0 && prev.secondsRemaining <= 3.1) {
            const currentSec = Math.ceil(prev.secondsRemaining);
            if (currentSec !== lastSecondRef.current) {
                // Play for 3, 2, 1 (but not 0)
                if (currentSec > 0 && currentSec <= 3) {
                    playCountdownTick();
                }
                lastSecondRef.current = currentSec;
            }
        } else {
            // Reset ref if we are not in countdown zone
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
    initAudio(); 
    if (timerState.currentPhase === BreathingPhase.Done) {
        resetTimer();
        setTimeout(() => {
            setTimerState(prev => ({ ...prev, isActive: true, isPaused: false }));
            setZenMode(true);
        }, 100);
    } else {
        if (!timerState.isActive && timerState.currentPhase === BreathingPhase.Ready) {
            // First Start
            setTimerState(prev => ({ ...prev, isActive: true, isPaused: false }));
            setZenMode(true);
        } else {
            // Pause/Resume
            setTimerState(prev => ({ ...prev, isPaused: !prev.isPaused }));
        }
    }
  };

  const resetTimer = () => {
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
  };

  // --- CRITICAL FIX 1: HANDLE PATTERN CHANGE WITH RESET ---
  const handlePatternChange = (newPattern: BreathingPattern) => {
      setActivePattern(newPattern);
      resetTimer(); // Always reset rounds and time when controls change
  };

  const handleDeepAnalysis = async () => {
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
  };

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
      if (window.innerWidth < 1024) {
          setZenMode(true); // Default to Zen on mobile start to show timer immediately
      } else {
          setZenMode(false);
      }
  };

  const getPhaseDuration = () => {
    switch(timerState.currentPhase) {
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

  // VISIBILITY LOGIC
  const isSetupControlsVisible = !timerState.isActive || timerState.isPaused;
  const isBigPlayButtonVisible = !timerState.isActive && timerState.currentPhase === BreathingPhase.Ready;
  
  // BUTTON ICON LOGIC
  const showPlayIcon = !timerState.isActive || timerState.isPaused || timerState.currentPhase === BreathingPhase.Done;

  // --- TIME CALCULATIONS FOR HUD ---
  const calculateRemainingTime = () => {
      if (rounds === 0) return -1; // Infinite
      const cycleDuration = activePattern.inhale + activePattern.holdIn + activePattern.exhale + activePattern.holdOut;
      const totalDuration = cycleDuration * rounds;
      const remaining = Math.max(0, totalDuration - timerState.totalSecondsElapsed);
      return remaining;
  };

  const remainingSeconds = calculateRemainingTime();

  return (
    <div className="w-full flex flex-col h-[100dvh] font-sans bg-zinc-50 dark:bg-[#000000] text-zinc-900 dark:text-gray-100 transition-colors duration-500 overflow-hidden relative">
      
      <SplashScreen isLoading={isLoadingApp} />
      <AppBackground theme={theme} />

      <Suspense fallback={null}>
        <MobileFaq isOpen={showMobileFaq} onClose={() => setShowMobileFaq(false)} />
        <AnalysisModal isOpen={isAnalysisOpen} onClose={() => setAnalysisOpen(false)} title={`AI Анализ: ${activePattern.name}`} content={analysisContent} isLoading={isAnalyzing} />
      </Suspense>

      {/* HEADER */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-in-out transform ${view === 'timer' ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
        <Header view={view} setView={setView} theme={theme} toggleTheme={toggleTheme} deferredPrompt={deferredPrompt} handleInstallClick={handleInstallClick} soundMode={soundMode} changeSoundMode={changeSoundMode} handleShare={handleShare} setShowMobileFaq={setShowMobileFaq} />
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col w-full relative z-10 overflow-hidden h-full pt-safe">
        
        {/* --- LIBRARY VIEW --- */}
        {view === 'library' && (
            <div className="flex-1 overflow-y-auto custom-scrollbar alive-scroll pt-24 pb-safe">
                <Suspense fallback={<LoadingFallback />}>
                    <LibraryView selectPattern={selectPattern} favorites={favorites} toggleFavorite={toggleFavorite} />
                </Suspense>
            </div>
        )}

        {/* --- TIMER VIEW --- */}
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
                            {/* FIX: PASSED onStart TO TOGGLE ZEN MODE ON MOBILE */}
                            <TimerSidebar 
                                activePattern={activePattern}
                                setView={setView}
                                infoTab={infoTab}
                                setInfoTab={setInfoTab}
                                handleDeepAnalysis={handleDeepAnalysis}
                                isAnalyzing={isAnalyzing}
                                onStart={() => setZenMode(true)}
                            />
                        </Suspense>
                    </div>
                </div>

                {/* 2. CENTER STAGE */}
                <div className="flex-1 h-full flex flex-col relative z-10 overflow-hidden">
                    
                    {/* Background Gradient */}
                    <div className={`absolute inset-0 transition-opacity duration-1000 z-0 pointer-events-none opacity-30`} style={{ background: 'radial-gradient(circle at center, rgba(34, 211, 238, 0.15) 0%, rgba(0,0,0,0) 70%)' }}></div>
                    
                    {/* GLOBAL MOBILE SETTINGS BUTTON (Top-Left) */}
                    {isZenMode && (
                        <div className="lg:hidden absolute top-4 left-4 z-50">
                            <button 
                                onClick={() => setZenMode(false)}
                                className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all shadow-lg active:scale-90"
                            >
                                <SlidersHorizontal size={18} />
                            </button>
                        </div>
                    )}

                    {/* Content Wrapper - SCROLLABLE (FLEX COL) */}
                    {/* CRITICAL FIX: Changed items-center to items-stretch (or remove items-) to fix landscape scroll clipping */}
                    <div className="flex-1 w-full flex flex-col p-4 relative z-10 overflow-y-auto custom-scrollbar">

                        {/* A. TOP HUD (ELAPSED | REMAINING) */}
                        {/* REMOVED FOR WIM HOF MODE to prevent clutter */}
                        {!isWimHof && (
                            <div className={`
                                relative z-30 mb-2 mt-4 shrink-0 self-center
                                transition-all duration-500 ease-out
                            `}>
                                <div className="flex items-center gap-0 bg-black/60 backdrop-blur-3xl rounded-full border border-white/10 shadow-lg overflow-hidden">
                                    
                                    {/* Elapsed Time */}
                                    <div className="flex items-center gap-2 px-5 py-2.5 border-r border-white/10">
                                        <Timer size={12} className="text-zinc-500" />
                                        <span className="text-sm font-mono font-bold text-zinc-300">
                                            {formatDuration(timerState.totalSecondsElapsed)}
                                        </span>
                                    </div>

                                    {/* Remaining Time */}
                                    <div className="flex items-center gap-2 px-5 py-2.5">
                                        <Hourglass size={12} className="text-cyan-500" />
                                        <span className="text-sm font-mono font-bold text-cyan-400">
                                            {remainingSeconds === -1 ? '∞' : formatDuration(remainingSeconds)}
                                        </span>
                                    </div>

                                </div>
                            </div>
                        )}

                        {/* B. VISUALIZER (TOP/CENTER) */}
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

                        {/* C. BOTTOM STACK - SCROLLABLE */}
                        {/* UPDATE: Increased max-w for Desktop to allow 3-column inputs */}
                        <div className="w-full max-w-md lg:max-w-2xl flex flex-col gap-6 mt-4 mb-safe shrink-0 pb-8 transition-all duration-300 self-center">
                            
                            {/* 1. DOCK (FIXED POSITION RELATIVE TO VISUALIZER) */}
                            {/* HIDE DOCK IF WIM HOF MODE IS ACTIVE */}
                            {!isWimHof && (
                                <div className="flex justify-center transition-all duration-300 relative z-20">
                                    <div className="flex items-center gap-6 p-3 bg-black/90 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl ring-1 ring-white/5">
                                        <button onClick={resetTimer} className="w-14 h-14 flex items-center justify-center text-zinc-500 hover:text-white transition-colors" title="Сброс"><RotateCcw size={24} /></button>
                                        
                                        {/* MAIN ACTION BUTTON */}
                                        <button 
                                            onClick={toggleTimer} 
                                            className="w-24 h-16 rounded-2xl flex items-center justify-center text-black bg-white shadow-lg transition-transform active:scale-95"
                                        >
                                            {showPlayIcon ? <Play size={28} fill="black" className="ml-1" /> : <Pause size={28} fill="black" />}
                                        </button>

                                        <button onClick={() => setZenMode(!isZenMode)} className="w-14 h-14 flex items-center justify-center text-zinc-500 hover:text-white transition-colors" title={isZenMode ? "Показать меню" : "Дзен режим"}>{isZenMode ? <Minimize2 size={24} /> : <Maximize2 size={24} />}</button>
                                    </div>
                                </div>
                            )}

                            {/* 2. CONTROLS (SLIDE IN/OUT BELOW DOCK) */}
                            <div className={`transition-all duration-500 ease-in-out w-full overflow-hidden ${isSetupControlsVisible ? 'opacity-100 max-h-[600px]' : 'opacity-0 max-h-0'}`}>
                                {!isWimHof && !isHolotropic && (
                                    <div className="flex flex-col gap-6 pt-2">
                                        {!isManual && executionMode === 'timer' && (
                                            <Suspense fallback={null}>
                                                {/* FIX 2: Pass handlePatternChange wrapper to reset timer on updates */}
                                                <Controls 
                                                    pattern={{...activePattern, mode: activePattern.mode}} 
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

                            {/* 3. HISTORY - ALWAYS BOTTOM */}
                            {currentPatternHistory.length > 0 && (
                                <div className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/5 rounded-3xl p-5 mt-2">
                                    <div className="flex items-center justify-between mb-3 border-b border-zinc-200 dark:border-white/5 pb-2">
                                        <div className="flex items-center gap-2 text-zinc-500 dark:text-gray-400"><History size={14} /><span className="text-[10px] font-bold uppercase tracking-widest">История</span></div>
                                    </div>
                                    <div className="space-y-2 max-h-[160px] overflow-y-auto custom-scrollbar">
                                        {currentPatternHistory.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between p-2 rounded-xl bg-white/50 dark:bg-white/5">
                                                <span className="text-xs font-bold text-zinc-800 dark:text-gray-200">{formatDate(item.date)}</span>
                                                <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">{formatDuration(item.durationSeconds)}</span>
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
