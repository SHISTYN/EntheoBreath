import React, { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react';
import { BreathState, BreathingPattern, BreathingPhase } from './types';
import { DEFAULT_PATTERNS } from './constants';
import { getBreathingAnalysis } from './services/geminiService';
import AppBackground from './components/AppBackground';
import SplashScreen from './components/SplashScreen';
import { Header } from './components/layout/Header';
import { useAudioSystem } from './hooks/useAudioSystem';
import { useUserProgress } from './hooks/useUserProgress';

// --- LAZY IMPORTS (Code Splitting) ---
const Controls = lazy(() => import('./components/Controls'));
const TimerVisual = lazy(() => import('./components/TimerVisual'));
const AnulomaVilomaInterface = lazy(() => import('./components/AnulomaVilomaInterface')); 
const WimHofInterface = lazy(() => import('./components/WimHofInterface'));
const AnalysisModal = lazy(() => import('./components/AnalysisModal'));
const LibraryView = lazy(() => import('./components/LibraryView'));
const TimerSidebar = lazy(() => import('./components/TimerSidebar'));
const MobileFaq = lazy(() => import('./components/MobileFaq'));

// --- TYPES ---
type ThemeMode = 'dark' | 'light';
type ExecutionMode = 'timer' | 'stopwatch';
type ViewState = 'library' | 'timer';

// Minimal Loader for Suspense
const LoadingFallback = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
  </div>
);

const App: React.FC = () => {
  // --- USER PROGRESS HOOK ---
  const { favorites, toggleFavorite } = useUserProgress();

  // --- State ---
  const [activePattern, setActivePattern] = useState<BreathingPattern>(DEFAULT_PATTERNS[0]);
  const [rounds, setRounds] = useState<number>(0); 
  const [view, setView] = useState<ViewState>('library');
  const [infoTab, setInfoTab] = useState<'about' | 'guide' | 'safety'>('about'); 
  const [isLoadingApp, setIsLoadingApp] = useState(true);
  const [executionMode, setExecutionMode] = useState<ExecutionMode>('timer');
  const [manualStopwatchOpen, setManualStopwatchOpen] = useState(false); 
  
  // Theme State
  const [theme, setTheme] = useState<ThemeMode>('dark');

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

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

  // Analysis State
  const [isAnalysisOpen, setAnalysisOpen] = useState(false);
  const [analysisContent, setAnalysisContent] = useState("");
  const [isAnalyzing, setAnalyzing] = useState(false);
  
  // Modal State
  const [showMobileFaq, setShowMobileFaq] = useState(false);
  const [showResults, setShowResults] = useState(false); 

  // Audio State Hook
  const { soundMode, changeSoundMode, playSoundEffect, initAudio } = useAudioSystem();

  // Refs for Animation Frame
  const requestRef = useRef<number | undefined>(undefined);
  const previousTimeRef = useRef<number | undefined>(undefined);
  
  // Ref for Wake Lock
  const wakeLockRef = useRef<any>(null);

  // --- SPLASH SCREEN EFFECT ---
  useEffect(() => {
    const timer = setTimeout(() => {
        setIsLoadingApp(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // --- PWA INSTALL LISTENER ---
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
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  // --- THEME LOGIC ---
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleShare = async () => {
      if (navigator.share) {
          try {
              await navigator.share({
                  title: 'EntheoBreath',
                  text: 'Дыхание, Измененные Состояния Сознания и AI-анализ.',
                  url: window.location.href,
              });
          } catch (error) {
              console.log('Error sharing', error);
          }
      } else {
          navigator.clipboard.writeText(window.location.href);
          alert("Ссылка скопирована в буфер обмена!");
      }
  };

  // --- WAKE LOCK LOGIC ---
  useEffect(() => {
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator && document.visibilityState === 'visible') {
        try {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        } catch (err: any) {
          console.warn(`Wake Lock request failed: ${err.name}, ${err.message}`);
        }
      }
    };

    const releaseWakeLock = async () => {
      if (wakeLockRef.current) {
        try {
          await wakeLockRef.current.release();
          wakeLockRef.current = null;
        } catch (err: any) {
          console.warn(`Wake Lock release failed: ${err.name}, ${err.message}`);
        }
      }
    };

    if (timerState.isActive && !timerState.isPaused) {
        requestWakeLock();
    } else {
        releaseWakeLock();
    }

    const handleVisibilityChange = async () => {
        if (wakeLockRef.current !== null && document.visibilityState === 'visible') {
            await requestWakeLock();
        }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
        releaseWakeLock();
        document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [timerState.isActive, timerState.isPaused]);


  // --- TIMER LOGIC (Fix: Correct Calculations) ---
  const calculateTotalDuration = (p: BreathingPattern, r: number) => {
      if (p.mode === 'wim-hof' || p.mode === 'stopwatch' || p.mode === 'manual') return 0;
      const cycleDuration = p.inhale + p.holdIn + p.exhale + p.holdOut;
      return cycleDuration * r;
  };

  const formatDuration = (seconds: number) => {
      if (seconds <= 0) return "0м 0с";
      const m = Math.floor(seconds / 60);
      const s = Math.floor(seconds % 60);
      return `${m}м ${s.toString().padStart(2, '0')}с`;
  };

  const totalSessionDuration = calculateTotalDuration(activePattern, rounds);
  // Calculate remaining time based on elapsed time vs total expected time
  const timeRemaining = Math.max(0, totalSessionDuration - timerState.totalSecondsElapsed);

  const advancePhase = useCallback(() => {
    setTimerState(prev => {
      let nextPhase = prev.currentPhase;
      let nextDuration = 0;
      let nextRound = prev.currentRound;
      let nextBreath = prev.currentBreath;
      let currentSessionResults = [...prev.sessionResults];
      let shouldPause = false;

      if (executionMode === 'stopwatch') {
          return prev;
      }

      if (activePattern.mode === 'wim-hof') {
          return prev; 
      } else {
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
                if (rounds > 0 && prev.currentRound >= rounds) {
                   nextPhase = BreathingPhase.Done;
                } else {
                   nextRound = prev.currentRound + 1;
                   nextPhase = BreathingPhase.Inhale;
                   nextDuration = activePattern.inhale;
                }
              }
              break;
            case BreathingPhase.HoldOut:
               if (rounds > 0 && prev.currentRound >= rounds) {
                 nextPhase = BreathingPhase.Done;
               } else {
                 nextRound = prev.currentRound + 1;
                 nextPhase = BreathingPhase.Inhale;
                 nextDuration = activePattern.inhale;
               }
               break;
            default: return prev;
          }
      }

      if (nextPhase !== prev.currentPhase) {
          playSoundEffect(soundMode);
      }
      
      if (nextPhase === BreathingPhase.Done) {
         return { ...prev, currentPhase: nextPhase, isActive: false, secondsRemaining: 0 };
      }

      return { 
          ...prev, 
          currentPhase: nextPhase, 
          secondsRemaining: nextDuration, 
          currentRound: nextRound,
          currentBreath: nextBreath,
          sessionResults: currentSessionResults,
          isActive: !shouldPause, // Pause if flagged
          isPaused: shouldPause
      };
    });
  }, [activePattern, rounds, soundMode, executionMode, playSoundEffect]);

  const tick = useCallback((time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = (time - previousTimeRef.current) / 1000;
      setTimerState(prev => {
        if (!prev.isActive || prev.isPaused || prev.currentPhase === BreathingPhase.Done) return prev;
        
        // STOPWATCH MODES
        if (executionMode === 'stopwatch') {
             return { ...prev, totalSecondsElapsed: prev.totalSecondsElapsed + deltaTime, secondsRemaining: prev.secondsRemaining + deltaTime };
        }

        // COUNTDOWN MODES
        const newTimeLeft = prev.secondsRemaining - deltaTime;
        if (newTimeLeft <= 0) return { ...prev, secondsRemaining: newTimeLeft, totalSecondsElapsed: prev.totalSecondsElapsed + deltaTime };
        return { ...prev, secondsRemaining: newTimeLeft, totalSecondsElapsed: prev.totalSecondsElapsed + deltaTime };
      });
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(tick);
  }, [executionMode, activePattern.mode]);

  useEffect(() => {
    if (timerState.isActive && !timerState.isPaused) {
      requestRef.current = requestAnimationFrame(tick);
    } else {
      previousTimeRef.current = undefined;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); }
  }, [timerState.isActive, timerState.isPaused, tick]);

  useEffect(() => {
     // Auto-advance logic for COUNTDOWN phases only
     const isStopwatch = executionMode === 'stopwatch';

     if (!isStopwatch && activePattern.mode !== 'wim-hof' && timerState.isActive && !timerState.isPaused && timerState.secondsRemaining <= 0.05 && timerState.currentPhase !== BreathingPhase.Done) {
         advancePhase();
     }
  }, [timerState.secondsRemaining, timerState.isActive, timerState.isPaused, timerState.currentPhase, advancePhase, executionMode, activePattern.mode]);


  const toggleTimer = () => {
    initAudio(); 
    if (timerState.currentPhase === BreathingPhase.Done) {
        resetTimer();
        setTimeout(() => setTimerState(prev => ({ ...prev, isActive: true })), 100);
    } else {
        setTimerState(prev => ({ ...prev, isActive: !prev.isActive, isPaused: prev.isActive }));
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
    setShowResults(false);
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
      
      // SCROLL TO TOP FIX
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

      // LOGIC: If Manual (Text Heavy), auto-select 'guide' tab and prepare UI
      if (p.mode === 'manual') {
          setInfoTab('guide');
          setExecutionMode('stopwatch'); // Default to stopwatch in background just in case
          setManualStopwatchOpen(false); // Ensure overlay is closed initially
      } else {
          setInfoTab('about');
          setExecutionMode('timer'); 
      }
      
      setRounds(p.mode === 'wim-hof' ? 3 : 12); 
      resetTimer();
  };

  const handleModeSwitch = (mode: ExecutionMode) => {
      setExecutionMode(mode);
      setTimerState(prev => ({
          ...prev,
          isActive: false,
          isPaused: false,
          currentPhase: BreathingPhase.Ready,
          secondsRemaining: mode === 'stopwatch' ? 0 : 3,
          totalSecondsElapsed: 0,
          sessionResults: []
      }));
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-purple-500/30 overflow-x-hidden relative text-zinc-900 dark:text-gray-100 transition-colors duration-500 bg-slate-50 dark:bg-[#050505]">
      
      {/* LOADING SCREEN (SPLASH) */}
      <SplashScreen isLoading={isLoadingApp} />

      {/* --- PREMIUM ANIMATED BACKGROUND --- */}
      <AppBackground theme={theme} />

      {/* Modals */}
      <Suspense fallback={null}>
        <MobileFaq isOpen={showMobileFaq} onClose={() => setShowMobileFaq(false)} />
      </Suspense>

      {/* RESULTS MODAL (Legacy, only if logic falls back) */}
      {showResults && activePattern.mode !== 'wim-hof' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-fade-in">
             <div className="bg-[#121212] p-8 rounded-3xl max-w-md w-full border border-white/10 shadow-2xl relative z-50 text-center">
                <h3 className="text-3xl font-display font-bold mb-2 text-white">Результаты</h3>
                <p className="text-gray-400 text-sm mb-8 uppercase tracking-widest">Сессия Вима Хофа</p>
                
                <div className="space-y-4 mb-8">
                    {timerState.sessionResults.map((time, idx) => (
                        <div key={idx} className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                            <span className="text-gray-400 font-bold uppercase text-xs tracking-wider">Раунд {idx + 1}</span>
                            <span className="text-2xl font-mono font-bold text-cyan-400">{formatDuration(time)}</span>
                        </div>
                    ))}
                </div>

                <button onClick={resetTimer} className="w-full py-4 bg-white text-black font-bold rounded-xl hover:scale-[1.02] transition-transform shadow-glow-cyan uppercase tracking-widest text-sm">
                    Завершить
                </button>
             </div>
        </div>
      )}
      
      <Suspense fallback={null}>
        <AnalysisModal 
           isOpen={isAnalysisOpen} 
           onClose={() => setAnalysisOpen(false)} 
           title={`AI Анализ: ${activePattern.name}`} 
           content={analysisContent}
           isLoading={isAnalyzing}
        />
      </Suspense>

      {/* --- HEADER (Replaces Navbar) --- */}
      <Header 
        view={view}
        setView={setView}
        theme={theme}
        toggleTheme={toggleTheme}
        deferredPrompt={deferredPrompt}
        handleInstallClick={handleInstallClick}
        setShowPhilosophy={() => {}} // No-op as handled internally
        soundMode={soundMode}
        changeSoundMode={changeSoundMode}
        handleShare={handleShare}
        setShowMobileFaq={setShowMobileFaq}
      />

      {/* Main Content */}
      <main className="w-full mx-auto flex-grow flex flex-col relative z-10 pt-28 md:pt-32">
        
        {view === 'library' && (
            <Suspense fallback={<LoadingFallback />}>
                <LibraryView 
                    selectPattern={selectPattern} 
                    favorites={favorites} 
                    toggleFavorite={toggleFavorite} 
                />
            </Suspense>
        )}

        {view === 'timer' && (
            <div className="flex-grow flex flex-col lg:flex-row min-h-[100dvh] lg:h-[calc(100vh-8rem)] lg:overflow-hidden relative">
                
                {manualStopwatchOpen && (
                    <div className="absolute inset-0 z-50 bg-[#050505] flex flex-col animate-fade-in">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h3 className="text-xl font-bold font-display text-white">Секундомер</h3>
                            <button onClick={() => setManualStopwatchOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="flex-grow flex flex-col items-center justify-center p-8">
                             <div className="scale-125 mb-10">
                                <Suspense fallback={null}>
                                    <TimerVisual 
                                        phase={timerState.currentPhase} 
                                        timeLeft={timerState.totalSecondsElapsed}
                                        totalTimeForPhase={3}
                                        label={"Секундомер"}
                                        mode={'stopwatch'}
                                        theme={theme}
                                    />
                                </Suspense>
                             </div>
                             <button 
                                onClick={toggleTimer}
                                className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl transition-all active:scale-95 shadow-[0_0_60px_rgba(255,255,255,0.1)] ${
                                    timerState.isActive && !timerState.isPaused
                                    ? 'bg-[#121212] text-rose-500 border border-rose-500/20'
                                    : 'bg-white text-black'
                                }`}
                            >
                                <i className={`fas fa-${timerState.isActive && !timerState.isPaused ? 'pause' : 'play ml-1'}`}></i>
                            </button>
                            <button onClick={resetTimer} className="mt-8 text-gray-500 text-sm font-bold uppercase tracking-widest hover:text-white">
                                Сброс
                            </button>
                        </div>
                    </div>
                )}

                {/* Left Panel (Sidebar) - REORDERED: Order-2 on mobile, Order-1 on Desktop */}
                <div className="contents lg:block order-2 lg:order-1">
                    <Suspense fallback={<div className="w-full lg:w-[480px] bg-white/5 animate-pulse"></div>}>
                        <TimerSidebar 
                            activePattern={activePattern}
                            setView={setView}
                            infoTab={infoTab}
                            setInfoTab={setInfoTab}
                            handleDeepAnalysis={handleDeepAnalysis}
                            isAnalyzing={isAnalyzing}
                        />
                    </Suspense>
                </div>

                {/* RIGHT PANEL - REORDERED: Order-1 on mobile, Order-2 on Desktop */}
                {activePattern.mode === 'wim-hof' ? (
                   // MOBILE LAYOUT FIX: Changed overflow-hidden to overflow-y-auto on mobile to allow scrolling through long setup content
                   <div className="flex-1 flex flex-col h-[100dvh] lg:h-full relative overflow-y-auto lg:overflow-hidden bg-[#0B0E11] z-30 order-1 lg:order-2">
                       <Suspense fallback={<LoadingFallback />}>
                           <WimHofInterface 
                               pattern={activePattern} 
                               onExit={() => setView('library')} 
                           />
                       </Suspense>
                   </div>
                ) : activePattern.mode !== 'manual' && (
                    <div className="flex-1 flex flex-col min-h-[100dvh] lg:min-h-0 lg:h-full relative overflow-y-auto lg:overflow-hidden order-1 lg:order-2 custom-scrollbar">
                    
                        <div 
                            className={`absolute inset-0 transition-opacity duration-1000 z-0 pointer-events-none ${timerState.isActive ? 'opacity-30' : 'opacity-0'}`}
                            style={{
                                background: 'radial-gradient(circle at center, rgba(34, 211, 238, 0.15) 0%, rgba(0,0,0,0) 70%)'
                            }}
                        ></div>

                        <div className="flex flex-col min-h-full lg:h-full justify-between z-10 py-6">
                            
                            <div className="flex flex-col items-center gap-6 flex-shrink-0">
                                <div className="flex items-center justify-center p-1.5 bg-gray-200 dark:bg-white/5 rounded-full backdrop-blur-md border border-zinc-200 dark:border-white/10 scale-90 lg:scale-100">
                                    <button 
                                        onClick={() => handleModeSwitch('timer')}
                                        className={`px-6 lg:px-8 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${executionMode === 'timer' ? 'bg-white dark:bg-black text-black dark:text-white shadow-lg' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'}`}
                                    >
                                        Таймер
                                    </button>
                                    <button 
                                        onClick={() => handleModeSwitch('stopwatch')}
                                        className={`px-6 lg:px-8 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${executionMode === 'stopwatch' ? 'bg-white dark:bg-black text-black dark:text-white shadow-lg' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'}`}
                                    >
                                        Секундомер
                                    </button>
                                </div>

                                {executionMode === 'timer' && (
                                    <div className="flex items-center justify-center gap-4 relative z-20">
                                        {timerState.isActive && rounds > 0 ? (
                                            <div className="px-5 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-zen-accent text-sm font-mono font-bold shadow-glow-cyan animate-pulse-slow">
                                                Осталось: {formatDuration(timeRemaining)}
                                            </div>
                                        ) : (
                                            <div className="px-5 py-2 rounded-full bg-gray-100/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 text-sm font-mono font-bold backdrop-blur-sm">
                                                {rounds > 0 ? `Общее время: ~${formatDuration(totalSessionDuration)}` : '∞'}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 flex items-center justify-center w-full px-4">
                                <Suspense fallback={<LoadingFallback />}>
                                    {/* CONDITIONAL RENDERING FOR ANULOMA VILOMA */}
                                    {activePattern.id === 'anuloma-viloma-base' && executionMode !== 'stopwatch' ? (
                                        <AnulomaVilomaInterface
                                            phase={timerState.currentPhase}
                                            timeLeft={timerState.secondsRemaining}
                                            totalTime={
                                                timerState.currentPhase === BreathingPhase.Inhale ? activePattern.inhale :
                                                timerState.currentPhase === BreathingPhase.HoldIn ? activePattern.holdIn :
                                                timerState.currentPhase === BreathingPhase.Exhale ? activePattern.exhale :
                                                timerState.currentPhase === BreathingPhase.HoldOut ? activePattern.holdOut : 3
                                            }
                                            currentRound={timerState.currentRound}
                                            onPatternUpdate={(updates) => setActivePattern(prev => ({...prev, ...updates}))}
                                            activePattern={activePattern}
                                        />
                                    ) : (
                                        <TimerVisual 
                                            phase={timerState.currentPhase} 
                                            timeLeft={executionMode === 'stopwatch' ? timerState.totalSecondsElapsed : timerState.secondsRemaining}
                                            totalTimeForPhase={
                                                timerState.currentPhase === BreathingPhase.Inhale ? activePattern.inhale :
                                                timerState.currentPhase === BreathingPhase.HoldIn ? activePattern.holdIn :
                                                timerState.currentPhase === BreathingPhase.Exhale ? activePattern.exhale :
                                                timerState.currentPhase === BreathingPhase.HoldOut ? activePattern.holdOut :
                                                3 
                                            }
                                            label={timerState.currentPhase}
                                            patternId={activePattern.id}
                                            currentRound={timerState.currentRound}
                                            currentBreath={timerState.currentBreath}
                                            totalBreaths={activePattern.breathCount}
                                            mode={executionMode === 'stopwatch' ? 'stopwatch' : activePattern.mode}
                                            theme={theme}
                                        />
                                    )}
                                </Suspense>
                            </div>

                            <div className="flex flex-col items-center gap-6 flex-shrink-0 w-full max-w-3xl mx-auto px-4 lg:px-8">
                                <div className="flex items-center gap-8">
                                    <button 
                                        onClick={resetTimer}
                                        className="w-12 h-12 rounded-full bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-gray-200 dark:border-white/5 flex items-center justify-center text-gray-400 hover:text-black dark:hover:text-white transition-all backdrop-blur-md active:scale-90"
                                    >
                                        <i className="fas fa-redo"></i>
                                    </button>

                                    <button 
                                        onClick={toggleTimer}
                                        className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-all active:scale-95 ${
                                            timerState.isActive && !timerState.isPaused
                                            ? 'bg-white dark:bg-[#121212] text-rose-500 border border-rose-200 dark:border-rose-500/20 shadow-[0_0_60px_rgba(244,63,94,0.4)] hover:shadow-rose-500/50 hover:scale-105'
                                            : 'bg-zinc-900 dark:bg-white text-white dark:text-black hover:opacity-90 shadow-[0_0_60px_rgba(0,0,0,0.1)] dark:shadow-[0_0_60px_rgba(255,255,255,0.2)] hover:scale-105'
                                        }`}
                                    >
                                        <i className={`fas fa-${timerState.isActive && !timerState.isPaused ? 'pause' : 'play ml-1'}`}></i>
                                    </button>

                                    {executionMode === 'timer' && (
                                        <div className="w-12 h-12 flex flex-col items-center justify-center bg-white/50 dark:bg-white/5 rounded-full border border-gray-200 dark:border-white/5 backdrop-blur-md">
                                            <span className="text-lg font-mono font-bold text-gray-900 dark:text-white">{timerState.currentRound}</span>
                                            <span className="text-[8px] text-gray-400 uppercase tracking-wider">Раунд</span>
                                        </div>
                                    )}
                                    {executionMode === 'stopwatch' && <div className="w-12 h-12"></div>}
                                </div>

                                <div className={`w-full transition-all duration-700 ${timerState.isActive && !timerState.isPaused ? 'opacity-20 blur-sm pointer-events-none grayscale' : 'opacity-100'}`}>
                                    <Suspense fallback={null}>
                                        <Controls 
                                            pattern={{...activePattern, mode: executionMode === 'stopwatch' ? 'stopwatch' : activePattern.mode}} 
                                            onChange={setActivePattern} 
                                            rounds={rounds} 
                                            onRoundsChange={setRounds}
                                            readOnly={timerState.isActive && !timerState.isPaused}
                                        />
                                    </Suspense>
                                </div>
                            </div>
                            
                            <div className="lg:hidden p-6 text-center text-gray-500/50 mt-4 pb-12">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="text-[10px] font-bold tracking-[0.1em] opacity-50">
                                        СОЗДАНО С 
                                        <a href="https://t.me/+D78P1fpaduBlOTc6" target="_blank" rel="noopener noreferrer" className="inline-block mx-1 align-middle cursor-default">
                                            <span className="text-rose-500 animate-pulse text-sm">❤️</span>
                                        </a> 
                                        — <a href="https://t.me/nikolaiovchinnikov" target="_blank" rel="noopener noreferrer" className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 transition-colors border-b border-transparent hover:border-cyan-500">НИКОЛАЙ ОВЧИННИКОВ</a>
                                    </div>
                                    <a href="https://t.me/nikolaiovchinnikov" target="_blank" rel="noopener noreferrer" className="text-[8px] uppercase font-bold tracking-[0.2em] text-gray-400 hover:text-cyan-500 transition-colors border border-gray-200 dark:border-white/5 px-3 py-1.5 rounded-full">
                                        <i className="fab fa-telegram mr-2"></i>
                                        Обратная связь
                                    </a>
                                </div>
                            </div>

                        </div>
                    </div>
                )}

                {activePattern.mode === 'manual' && (
                    <button 
                        onClick={() => setManualStopwatchOpen(true)}
                        className="fixed bottom-8 right-8 z-40 bg-white dark:bg-zen-accent text-black font-bold p-4 rounded-full shadow-glow-cyan animate-pulse-slow hover:scale-110 transition-all active:scale-95"
                    >
                         <i className="fas fa-stopwatch text-xl"></i>
                    </button>
                )}
            </div>
        )}
      </main>
    </div>
  );
};

export default App;