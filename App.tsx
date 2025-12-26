
import React, { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react';
import { BreathState, BreathingPattern, BreathingPhase } from './types';
import { DEFAULT_PATTERNS } from './constants';
import { getBreathingAnalysis } from './services/geminiService';
import AppBackground from './components/AppBackground';
import SplashScreen from './components/SplashScreen';
import { Header } from './components/layout/Header';
import { useAudioSystem } from './hooks/useAudioSystem';
import { useUserProgress } from './hooks/useUserProgress';
import { WifiOff, AlertCircle } from 'lucide-react';

// --- ROBUST LAZY LOADING ---
const lazySafe = (factory: () => Promise<any>) =>
  lazy(() => factory().catch(err => {
    console.error("Critical component load error", err);
    return { default: () => (
      <div className="flex flex-col items-center justify-center p-10 text-center space-y-4">
        <AlertCircle className="text-rose-500 w-12 h-12" />
        <h2 className="text-xl font-bold">Ошибка загрузки модуля</h2>
        <p className="text-sm opacity-60">Возможно, обновилась версия приложения.</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-white text-black rounded-full font-bold">Обновить страницу</button>
      </div>
    )};
  }));

const Controls = lazySafe(() => import('./components/Controls'));
const TimerVisual = lazySafe(() => import('./components/TimerVisual'));
const AnulomaVilomaInterface = lazySafe(() => import('./components/AnulomaVilomaInterface')); 
const BoxTimerVisual = lazySafe(() => import('./components/BoxTimerVisual'));
const WimHofInterface = lazySafe(() => import('./components/WimHofInterface'));
const AnalysisModal = lazySafe(() => import('./components/AnalysisModal'));
const LibraryView = lazySafe(() => import('./components/LibraryView'));
const TimerSidebar = lazySafe(() => import('./components/TimerSidebar'));
const MobileFaq = lazySafe(() => import('./components/MobileFaq'));

type ThemeMode = 'dark' | 'light';
type ExecutionMode = 'timer' | 'stopwatch';
type ViewState = 'library' | 'timer';

const LoadingFallback = () => (
  <div className="w-full h-full flex items-center justify-center min-h-[400px]">
    <div className="w-6 h-6 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
  </div>
);

const App: React.FC = () => {
  const { favorites, toggleFavorite } = useUserProgress();
  const [activePattern, setActivePattern] = useState<BreathingPattern>(DEFAULT_PATTERNS[0]);
  const [rounds, setRounds] = useState<number>(0); 
  const [view, setView] = useState<ViewState>('library');
  const [infoTab, setInfoTab] = useState<'about' | 'guide' | 'safety'>('about'); 
  const [isLoadingApp, setIsLoadingApp] = useState(true);
  const [executionMode, setExecutionMode] = useState<ExecutionMode>('timer');
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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

  const [isAnalysisOpen, setAnalysisOpen] = useState(false);
  const [analysisContent, setAnalysisContent] = useState("");
  const [isAnalyzing, setAnalyzing] = useState(false);
  const [showMobileFaq, setShowMobileFaq] = useState(false);

  const { soundMode, changeSoundMode, playSoundEffect, initAudio } = useAudioSystem();
  const requestRef = useRef<number | undefined>(undefined);
  const previousTimeRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    const timer = setTimeout(() => setIsLoadingApp(false), 2000);
    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        clearTimeout(timer);
    };
  }, []);

  const toggleTimer = () => {
    initAudio(); 
    setTimerState(prev => ({ ...prev, isActive: !prev.isActive, isPaused: prev.isActive }));
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

  const selectPattern = (p: BreathingPattern) => {
      setActivePattern(p);
      setView('timer');
      resetTimer();
  };

  return (
    <div className="w-full flex flex-col h-full font-sans bg-[#000000] text-gray-100 overflow-hidden">
      <SplashScreen isLoading={isLoadingApp} />
      <AppBackground theme={theme} />

      <Suspense fallback={null}>
        <MobileFaq isOpen={showMobileFaq} onClose={() => setShowMobileFaq(false)} />
        <AnalysisModal isOpen={isAnalysisOpen} onClose={() => setAnalysisOpen(false)} title={activePattern.name} content={analysisContent} isLoading={isAnalyzing} />
      </Suspense>

      <div className="flex-none z-50">
        <Header 
            view={view} 
            setView={setView} 
            theme={theme} 
            toggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} 
            deferredPrompt={deferredPrompt} 
            handleInstallClick={() => {}} 
            soundMode={soundMode} 
            changeSoundMode={changeSoundMode} 
            handleShare={() => {}} 
            setShowMobileFaq={setShowMobileFaq} 
        />
      </div>

      <main className="flex-1 flex flex-col w-full relative z-10 overflow-hidden min-h-0">
        {view === 'library' && (
            <div className="flex-1 overflow-y-auto pt-24 pb-safe">
                <Suspense fallback={<LoadingFallback />}>
                    <LibraryView selectPattern={selectPattern} favorites={favorites} toggleFavorite={toggleFavorite} />
                </Suspense>
            </div>
        )}

        {view === 'timer' && (
            <div className="flex-1 overflow-y-auto relative z-10">
                <div className="min-h-full flex flex-col lg:flex-row pt-28 pb-safe">
                    <div className="lg:order-2 flex-1 flex flex-col items-center relative z-20 mb-10">
                        <div className="relative z-10 w-full flex justify-center p-0 min-h-[400px]">
                            <Suspense fallback={<LoadingFallback />}>
                                {activePattern.id === 'wim-hof-session' ? (
                                    <WimHofInterface pattern={activePattern} onExit={() => setView('library')} />
                                ) : (
                                    <TimerVisual 
                                        phase={timerState.currentPhase} 
                                        timeLeft={timerState.secondsRemaining} 
                                        totalTimeForPhase={timerState.secondsRemaining} 
                                        label={timerState.currentPhase} 
                                        isActive={timerState.isActive && !timerState.isPaused}
                                    />
                                )}
                            </Suspense>
                        </div>

                        <div className="w-full px-4 flex-shrink-0 relative z-10 mt-6">
                            <div className="max-w-md mx-auto flex flex-col gap-6">
                                <div className="flex items-center justify-center gap-8">
                                    <button onClick={resetTimer} className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-gray-400"><i className="fas fa-redo"></i></button>
                                    <button onClick={toggleTimer} className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-lg ${timerState.isActive && !timerState.isPaused ? 'bg-white text-rose-500' : 'bg-white text-black'}`}>
                                        <i className={`fas fa-${timerState.isActive && !timerState.isPaused ? 'pause' : 'play ml-1'}`}></i>
                                    </button>
                                </div>
                                <Suspense fallback={null}>
                                    <Controls pattern={activePattern} onChange={setActivePattern} rounds={rounds} onRoundsChange={setRounds} readOnly={timerState.isActive} />
                                </Suspense>
                            </div>
                        </div>
                    </div>

                    <div className="lg:order-1 w-full lg:w-[450px] flex-shrink-0 bg-[#0a0a0b] border-r border-white/5 relative z-10">
                        <Suspense fallback={<div className="p-10 text-center opacity-50">Загрузка...</div>}>
                            <TimerSidebar 
                                activePattern={activePattern}
                                setView={setView}
                                infoTab={infoTab}
                                setInfoTab={setInfoTab}
                                handleDeepAnalysis={() => {}}
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
