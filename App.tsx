import React, { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react';
import { BreathState, BreathingPattern, BreathingPhase } from './types';
import { DEFAULT_PATTERNS } from './constants';
import { getBreathingAnalysis } from './services/geminiService';
import AppBackground from './components/AppBackground';
import SplashScreen from './components/SplashScreen';
import { Header } from './components/layout/Header';
import { useAudioSystem } from './hooks/useAudioSystem';
import { useUserProgress } from './hooks/useUserProgress';

// --- ROBUST LAZY LOADING HELPER ---
// Automatically reloads the page once if a chunk fails to load (e.g. after a new deployment)
const lazyWithRetry = (componentImport: () => Promise<any>) =>
  lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem('entheo-retry-refresh') || 'false'
    );

    try {
      const component = await componentImport();
      // If successful, reset the flag so next error can trigger refresh
      window.sessionStorage.setItem('entheo-retry-refresh', 'false');
      return component;
    } catch (error: any) {
      console.error("Lazy load error:", error);
      // Check for fetch/chunk errors
      if (
          !pageHasAlreadyBeenForceRefreshed && 
          (error.message?.includes("Failed to fetch") || error.message?.includes("Importing a module"))
      ) {
         window.sessionStorage.setItem('entheo-retry-refresh', 'true');
         window.location.reload();
         // Return a temporary placeholder while reloading
         return { default: () => <div className="h-full flex items-center justify-center text-sm opacity-50 animate-pulse">Обновление версии...</div> };
      }
      throw error; // Propagate to ErrorBoundary if we already tried refreshing
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

// FIXED: Increased height to match Anuloma Viloma to prevent layout jump on load
const LoadingFallback = () => (
  <div className="w-full h-full flex items-center justify-center min-h-[450px]">
    <div className="w-6 h-6 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
  </div>
);

const App: React.FC = () => {
  const { favorites, toggleFavorite } = useUserProgress();

  // --- State ---
  const [activePattern, setActivePattern] = useState<BreathingPattern>(DEFAULT_PATTERNS[0]);
  const [rounds, setRounds] = useState<number>(0); 
  const [view, setView] = useState<ViewState>('library');
  const [infoTab, setInfoTab] = useState<'about' | 'guide' | 'safety'>('about'); 
  const [isLoadingApp, setIsLoadingApp] = useState(true);
  const [executionMode, setExecutionMode] = useState<ExecutionMode>('timer');
  const [theme, setTheme] = useState<ThemeMode>('dark');
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

  // Audio & Refs
  const { soundMode, changeSoundMode, playSoundEffect, initAudio } = useAudioSystem();
  const requestRef = useRef<number | undefined>(undefined);
  const previousTimeRef = useRef<number | undefined>(undefined);
  const wakeLockRef = useRef<any>(null);

  // --- INIT LOGIC ---
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const patternId = params.get('pattern');
      if (patternId) {
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
    } catch (e) { console.warn("URL params error:", e); }
  }, []);

  useEffect(() => {
      try {
          if (window.location.protocol === 'blob:') return;
          const url = new URL(window.location.href);
          if (view === 'timer' && activePattern) url.searchParams.set('pattern', activePattern.id);
          else if (view === 'library') url.searchParams.delete('pattern');
          window.history.replaceState({}, '', url.toString());
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
      if (nextPhase === BreathingPhase.Done) return { ...prev, currentPhase: nextPhase, isActive: false, secondsRemaining: 0 };

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
  }, [activePattern, rounds, soundMode, executionMode, playSoundEffect]);

  const tick = useCallback((time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = (time - previousTimeRef.current) / 1000;
      setTimerState(prev => {
        if (!prev.isActive || prev.isPaused || prev.currentPhase === BreathingPhase.Done) return prev;
        if (executionMode === 'stopwatch') return { ...prev, totalSecondsElapsed: prev.totalSecondsElapsed + deltaTime, secondsRemaining: prev.secondsRemaining + deltaTime };
        const newTimeLeft = prev.secondsRemaining - deltaTime;
        return { ...prev, secondsRemaining: newTimeLeft, totalSecondsElapsed: prev.totalSecondsElapsed + deltaTime };
      });
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(tick);
  }, [executionMode, activePattern.mode]);

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

  // Helper to get total time for current phase
  const getPhaseDuration = () => {
    switch(timerState.currentPhase) {
        case BreathingPhase.Inhale: return activePattern.inhale;
        case BreathingPhase.HoldIn: return activePattern.holdIn;
        case BreathingPhase.Exhale: return activePattern.exhale;
        case BreathingPhase.HoldOut: return activePattern.holdOut;
        default: return 3; // Ready/Done default
    }
  };

  const isWimHof = activePattern.mode === 'wim-hof';
  const isAnuloma = activePattern.id === 'anuloma-viloma-base';
  const isManual = activePattern.mode === 'manual';
  const isHolotropic = activePattern.id === 'holotropic';

  // --- RENDER ---
  return (
    // OPTIMIZATION: h-full + overflow-hidden on body ensures we control scroll areas
    <div className="w-full flex flex-col h-full font-sans bg-slate-50 dark:bg-[#000000] text-zinc-900 dark:text-gray-100 transition-colors duration-500 overflow-hidden">
      
      <SplashScreen isLoading={isLoadingApp} />
      <AppBackground theme={theme} />

      <Suspense fallback={null}>
        <MobileFaq isOpen={showMobileFaq} onClose={() => setShowMobileFaq(false)} />
        <AnalysisModal isOpen={isAnalysisOpen} onClose={() => setAnalysisOpen(false)} title={`AI Анализ: ${activePattern.name}`} content={analysisContent} isLoading={isAnalyzing} />
      </Suspense>

      {/* FIXED HEADER */}
      <div className="flex-none z-50">
        <Header view={view} setView={setView} theme={theme} toggleTheme={toggleTheme} deferredPrompt={deferredPrompt} handleInstallClick={handleInstallClick} soundMode={soundMode} changeSoundMode={changeSoundMode} handleShare={handleShare} setShowMobileFaq={setShowMobileFaq} />
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col w-full relative z-10 overflow-hidden min-h-0">
        
        {/* --- LIBRARY VIEW --- */}
        {view === 'library' && (
            <div className="flex-1 overflow-y-auto custom-scrollbar alive-scroll pt-20 pb-safe">
                <Suspense fallback={<LoadingFallback />}>
                    <LibraryView selectPattern={selectPattern} favorites={favorites} toggleFavorite={toggleFavorite} />
                </Suspense>
            </div>
        )}

        {/* --- TIMER VIEW (UNIFIED SCROLL) --- */}
        {view === 'timer' && (
            // ONE SCROLL CONTAINER FOR EVERYTHING
            <div className="flex-1 overflow-y-auto custom-scrollbar alive-scroll relative z-10">
                
                {/* FLEX WRAPPER: Mobile = Column (Visualizer Top, Info Bottom), Desktop = Row (Info Left, Visualizer Right) */}
                {/* REDUCED pt-32 to pt-24 for less gap at top */}
                <div className="min-h-[calc(100%+1px)] flex flex-col lg:flex-row pt-24 lg:pt-24 pb-safe">

                    {/* 1. VISUALIZER & CONTROLS SECTION */}
                    {/* On Desktop: Order 2 (Right Side), Sticky to keep it visible while reading text */}
                    <div className="lg:order-2 flex-1 flex flex-col items-center relative z-20 lg:h-fit lg:sticky lg:top-24 mb-6 lg:mb-0">
                        
                        {/* Background Gradient for Visualizer Area */}
                        <div className={`absolute inset-0 -mx-4 lg:mx-0 transition-opacity duration-1000 z-0 pointer-events-none rounded-3xl ${timerState.isActive ? 'opacity-30' : 'opacity-0'}`} style={{ background: 'radial-gradient(circle at center, rgba(34, 211, 238, 0.15) 0%, rgba(0,0,0,0) 70%)' }}></div>
                        
                        {/* Mode Switcher */}
                        {!isAnuloma && !isWimHof && !isManual && !isHolotropic && (
                            <div className="w-full flex justify-center py-2 shrink-0 relative z-10 mb-2">
                                <div className="flex items-center justify-center p-1 bg-zinc-100 dark:bg-white/5 rounded-full backdrop-blur-md border border-zinc-200 dark:border-white/10 scale-90 shadow-sm">
                                    <button onClick={() => handleModeSwitch('timer')} className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all ${executionMode === 'timer' ? 'bg-white dark:bg-black text-black dark:text-white shadow' : 'text-gray-500'}`}>Таймер</button>
                                    <button onClick={() => handleModeSwitch('stopwatch')} className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all ${executionMode === 'stopwatch' ? 'bg-white dark:bg-black text-black dark:text-white shadow' : 'text-gray-500'}`}>Секундомер</button>
                                </div>
                            </div>
                        )}

                        {/* The Visualizer */}
                        {/* FIXED: Increased min-height to 450px to prevent layout shift when Anuloma loads */}
                        <div className="relative z-10 w-full flex justify-center p-0 min-h-[450px]">
                            <Suspense fallback={<LoadingFallback />}>
                                {isHolotropic ? (
                                    <div className="w-full h-[450px] flex flex-col items-center justify-center relative overflow-hidden">
                                        <div className="absolute inset-0 bg-purple-500/10 blur-[80px] animate-pulse-slow"></div>
                                        <div className="relative z-10 text-center space-y-4">
                                            <div className="text-6xl animate-pulse">♾️</div>
                                            <h3 className="text-xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                                                ТРАНСЦЕНДЕНЦИЯ
                                            </h3>
                                            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">
                                                Следуйте за музыкой
                                            </p>
                                        </div>
                                    </div>
                                ) : isWimHof ? (
                                    <div className="w-full max-w-2xl flex justify-center">
                                        <WimHofInterface pattern={activePattern} onExit={() => setView('library')} />
                                    </div>
                                ) : isAnuloma ? (
                                    <div className="w-full flex-1 flex items-center justify-center min-h-0">
                                        <AnulomaVilomaInterface 
                                            phase={timerState.currentPhase} 
                                            timeLeft={timerState.secondsRemaining} 
                                            totalTime={getPhaseDuration()} // FIX: Pass actual phase duration
                                            currentRound={timerState.currentRound} 
                                        />
                                    </div>
                                ) : activePattern.id === 'box-breathing' && executionMode !== 'stopwatch' ? (
                                    <div className="w-full flex justify-center">
                                        <BoxTimerVisual phase={timerState.currentPhase} timeLeft={timerState.secondsRemaining} totalTimeForPhase={4} currentRound={timerState.currentRound} label={timerState.currentPhase} />
                                    </div>
                                ) : (
                                    <div className="w-full flex justify-center transform scale-100 lg:scale-[0.9]">
                                        <TimerVisual 
                                            phase={timerState.currentPhase} 
                                            timeLeft={executionMode === 'stopwatch' ? timerState.totalSecondsElapsed : timerState.secondsRemaining} 
                                            totalTimeForPhase={timerState.secondsRemaining} 
                                            label={timerState.currentPhase} 
                                            currentRound={timerState.currentRound} 
                                            currentBreath={timerState.currentBreath} 
                                            totalBreaths={activePattern.breathCount} 
                                            mode={executionMode === 'stopwatch' ? 'stopwatch' : activePattern.mode} 
                                            theme={theme} 
                                            isActive={timerState.isActive && !timerState.isPaused}
                                        />
                                    </div>
                                )}
                            </Suspense>
                        </div>

                        {/* Controls */}
                        {!isWimHof && !isHolotropic && (
                            <div className="w-full px-4 flex-shrink-0 relative z-10 pb-4 mt-4">
                                <div className="max-w-md mx-auto flex flex-col gap-3">
                                    <div className="flex items-center justify-center gap-6">
                                        <button onClick={resetTimer} className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-white/10 flex items-center justify-center text-zinc-500 hover:text-black dark:text-gray-400 dark:hover:text-white"><i className="fas fa-redo text-sm"></i></button>
                                        <button onClick={toggleTimer} className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-lg transition-transform active:scale-95 ${timerState.isActive && !timerState.isPaused ? 'bg-white text-rose-500 border-2 border-rose-500' : 'bg-zinc-900 text-white dark:bg-white dark:text-black'}`}>
                                            <i className={`fas fa-${timerState.isActive && !timerState.isPaused ? 'pause' : 'play ml-1'}`}></i>
                                        </button>
                                    </div>
                                    {!isManual && executionMode === 'timer' && (
                                        <div className={`transition-all duration-300 ${timerState.isActive && !timerState.isPaused ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                                            <Suspense fallback={null}>
                                                <Controls pattern={{...activePattern, mode: activePattern.mode}} onChange={setActivePattern} rounds={rounds} onRoundsChange={setRounds} readOnly={timerState.isActive && !timerState.isPaused} />
                                            </Suspense>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 2. INFO / SIDEBAR SECTION */}
                    {/* On Desktop: Order 1 (Left Side) */}
                    <div className="lg:order-1 w-full lg:w-[450px] flex-shrink-0 bg-white dark:bg-[#0a0a0b] border-t lg:border-t-0 lg:border-r border-zinc-200 dark:border-white/5 relative z-10 min-h-[500px]">
                        <Suspense fallback={<div className="p-10 text-center opacity-50">Загрузка информации...</div>}>
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

                </div>
            </div>
        )}
      </main>
    </div>
  );
};

export default App;