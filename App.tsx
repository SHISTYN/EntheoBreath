import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { BreathState, BreathingPattern, BreathingPhase } from './types';
import { DEFAULT_PATTERNS, CATEGORY_NAMES as categoryNames, CATEGORY_ICONS as categoryIcons } from './constants';
import Controls from './components/Controls';
import TimerVisual from './components/TimerVisual';
import { getBreathingAnalysis } from './services/geminiService';
import AnalysisModal from './components/AnalysisModal';

// --- TYPES ---
type SoundMode = 'mute' | 'bell' | 'hang' | 'bowl' | 'gong' | 'rain' | 'om' | 'flute' | 'harp';
type ThemeMode = 'dark' | 'light';
type ExecutionMode = 'timer' | 'stopwatch';

// --- SPOTLIGHT CARD COMPONENT (PREMIUM VERSION) ---
const SpotlightCard: React.FC<{ 
    children: React.ReactNode; 
    className?: string; 
    onClick?: () => void 
}> = ({ children, className = "", onClick }) => {
    const divRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!divRef.current) return;
        const div = divRef.current;
        const rect = div.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        div.style.setProperty("--mouse-x", `${x}px`);
        div.style.setProperty("--mouse-y", `${y}px`);
    };

    return (
        <div 
            ref={divRef}
            onMouseMove={handleMouseMove}
            onClick={onClick}
            className={`spotlight-card relative group rounded-[24px] overflow-hidden transition-all duration-500 ease-out hover:scale-[1.02] hover:-translate-y-1 ${className}`}
        >
            {/* Glass Border Gradient */}
            <div className="absolute inset-0 rounded-[24px] p-[1px] bg-gradient-to-br from-white/10 to-transparent group-hover:from-premium-purple/40 group-hover:to-zen-accent/40 transition-all duration-500 z-0 pointer-events-none"></div>
            
            {/* Background & Blur */}
            <div className="absolute inset-[1px] rounded-[23px] bg-white/80 dark:bg-[#0f0f10]/80 backdrop-blur-xl z-0 transition-colors duration-500 group-hover:bg-white/90 dark:group-hover:bg-[#151516]/90"></div>

            {/* Content Container */}
            <div className="relative z-10 h-full p-6 flex flex-col">
                {children}
            </div>
        </div>
    );
};

// --- LOGO COMPONENT (FIXED & UNIQUE IDs) ---
const EntheoLogo: React.FC<{ size?: number; animated?: boolean; idSuffix?: string }> = ({ size = 60, animated = true, idSuffix = 'main' }) => {
    // Generate unique IDs to prevent gradient conflicts between multiple instances of the logo
    const magicCapId = `magicCap-${idSuffix}`;
    const windFadeId = `windFade-${idSuffix}`;
    const goldAuraId = `goldAura-${idSuffix}`;

    return (
        <svg 
            width={size} 
            height={size} 
            viewBox="0 0 200 120" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            style={{ overflow: 'visible', filter: 'drop-shadow(0 0 15px rgba(124, 58, 237, 0.2))' }}
        >
            <defs>
                <linearGradient id={magicCapId} x1="60" y1="20" x2="60" y2="70" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#ef4444" />
                    <stop offset="1" stopColor="#991b1b" />
                </linearGradient>
                <linearGradient id={windFadeId} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="white" stopOpacity="0" />
                    <stop offset="20%" stopColor="white" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="white" stopOpacity="0" />
                </linearGradient>
                <radialGradient id={goldAuraId} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(60 60) rotate(90) scale(60)">
                    <stop stopColor="#F59E0B" stopOpacity="0.3" /> 
                    <stop offset="0.8" stopColor="#7C3AED" stopOpacity="0" />
                </radialGradient>
            </defs>

            {/* Aura */}
            <circle cx="60" cy="70" r="50" fill={`url(#${goldAuraId})`} className={animated ? "animate-pulse-slow" : ""} />

            {/* Wind Effects */}
            {animated && (
                <g className="mix-blend-overlay">
                    <path d="M 120 35 Q 150 25 180 35" stroke={`url(#${windFadeId})`} strokeWidth="1" fill="none" strokeLinecap="round" strokeDasharray="40 100" className="animate-flow" style={{ animationDuration: '4s' }} />
                    <path d="M 110 50 Q 140 55 170 45" stroke={`url(#${windFadeId})`} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeDasharray="30 80" className="animate-flow" style={{ animationDuration: '6s', animationDelay: '0.5s' }} />
                </g>
            )}

            {/* Mushroom Shape */}
            <g transform="translate(0, 5)">
                {/* Stem */}
                <path d="M 50 65 Q 48 95 45 100 L 75 100 Q 72 95 70 65" fill="#FFF9E5" />
                <path d="M 50 65 L 70 65 L 70 100 L 45 100 Z" fill="rgba(0,0,0,0.05)" />
                <path d="M 50 70 Q 60 80 70 70 L 72 66 L 48 66 Z" fill="#FFF" />
                
                {/* Cap with Animation */}
                <g className={animated ? "animate-mushroom-breath" : ""} style={{ transformOrigin: '60px 65px' }}>
                    <path d="M 25 65 C 25 25, 95 25, 95 65 Q 60 55 25 65 Z" fill={`url(#${magicCapId})`} style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.2))" }} />
                    
                    {/* Spots */}
                    <g fill="#FFFFFF" fillOpacity="0.9">
                        <ellipse cx="45" cy="40" rx="5" ry="3" transform="rotate(-20 45 40)" />
                        <circle cx="65" cy="35" r="4" />
                        <circle cx="82" cy="50" r="3" />
                        <circle cx="35" cy="55" r="2.5" />
                    </g>
                    
                    {/* Spores */}
                    {animated && (
                        <g>
                            <circle cx="85" cy="50" r="1.5" className="fill-cyan-100 animate-spores" style={{ opacity: 0, animationDelay: '0s' }} />
                            <circle cx="95" cy="40" r="1" className="fill-purple-100 animate-spores" style={{ opacity: 0, animationDelay: '1.5s' }} />
                        </g>
                    )}
                </g>
            </g>
        </svg>
    );
};

// --- CONTENT ---
const PHILOSOPHY_CONTENT = `
# 🔯 Заветы Дыхания и Энергии

Согласно многим духовным и оздоровительным системам (включая метод К.П. Бутейко), **уменьшение дыхания** и накопление энергии — ключ к здоровью и долголетию.

### 1. Периодическая депривация сна
Некоторые исследования показывают, что кратковременная осознанная депривация сна может стимулировать определенные резервные процессы в организме, улучшать когнитивные функции и повышать уровень энергии после восстановления. 
*Важно: Соблюдайте баланс, не во вред здоровью.*

### 2. Питание и Энергия
*   **Животная пища:** Если человек не занимается активным спортом, тяжелая пища требует огромных затрат энергии на переваривание, что ведет к усталости и увеличению потребности во сне.
*   **Растительная пища:** Легче усваивается, дает "чистую" энергию и может уменьшить потребность в длительном сне.

### 3. Физическая активность
Регулярные упражнения учат организм эффективно расходовать и восстанавливать энергию. Это помогает легче переносить стрессы и меньше спать без потери качества жизни.

### 4. Утечки Энергии
Высокий уровень стресса, эмоциональные всплески, гнев, чрезмерная половая активность (потеря семени) и пустые разговоры заставляют сердце биться чаще, а дыхание — становиться частым и глубоким. Это "сливает" жизненную силу.

### 5. Метод Вима Хофа
Сочетает **гипервентиляцию** (насыщение кислородом) и **гипоксию** (накопление CO2 и адаптация к стрессу), плюс холод. Это тренировка сосудов и митохондрий.

### 6. Метод Бутейко
*   **Суть:** "Дыши меньше, чтобы жить дольше".
*   **Цель:** Нормализация уровня углекислого газа (CO2). Именно CO2 необходим, чтобы кислород оторвался от гемоглобина и перешел в клетки (Эффект Вериго-Бора). Глубокое дыхание вымывает CO2, вызывая кислородное голодание клеток.

### 7. Анулома-Вилома
Балансирует "Солнечный" (горячий) и "Лунный" (холодный) каналы. Успокаивает ум, что автоматически делает дыхание поверхностным и эффективным.

### 8. Закаливание
Холодная вода — мощнейший адаптоген. Она учит тело не реагировать на стресс выбросом кортизола, а сохранять спокойствие.

---

❤️ **[Love: Канал о любви и осознанности](https://t.me/loveisalllove)**
*(Голодание, дыхание, религии, закаливание)*
`;

const App: React.FC = () => {
  // --- State ---
  const [activePattern, setActivePattern] = useState<BreathingPattern>(DEFAULT_PATTERNS[0]);
  const [rounds, setRounds] = useState<number>(0); 
  const [view, setView] = useState<'timer' | 'library'>('library');
  const [infoTab, setInfoTab] = useState<'about' | 'guide'>('about'); 
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isLoadingApp, setIsLoadingApp] = useState(true);
  const [executionMode, setExecutionMode] = useState<ExecutionMode>('timer');
  const [manualStopwatchOpen, setManualStopwatchOpen] = useState(false); // New state for overlay stopwatch
  
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
  });

  // Analysis State
  const [isAnalysisOpen, setAnalysisOpen] = useState(false);
  const [analysisContent, setAnalysisContent] = useState("");
  const [isAnalyzing, setAnalyzing] = useState(false);
  
  // Modal State
  const [showPhilosophy, setShowPhilosophy] = useState(false);
  const [showMobileFaq, setShowMobileFaq] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false); // NEW: For mobile navbar

  // Audio State
  const [soundMode, setSoundMode] = useState<SoundMode>('bell');
  const [showSoundMenu, setShowSoundMenu] = useState(false);
  
  // Refs for Audio System
  const audioContextRef = useRef<AudioContext | null>(null);

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
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      console.log('PWA Install Prompt captured');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setShowMobileMenu(false); // Close mobile menu if open
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
          // Fallback to clipboard
          navigator.clipboard.writeText(window.location.href);
          alert("Ссылка скопирована в буфер обмена!");
      }
  };

  // --- WAKE LOCK LOGIC (KEEPS SCREEN ON) ---
  useEffect(() => {
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator) {
        try {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
          console.log('Wake Lock is active');
        } catch (err: any) {
          console.error(`${err.name}, ${err.message}`);
        }
      }
    };

    const releaseWakeLock = async () => {
      if (wakeLockRef.current) {
        try {
          await wakeLockRef.current.release();
          wakeLockRef.current = null;
          console.log('Wake Lock released');
        } catch (err: any) {
          console.error(`${err.name}, ${err.message}`);
        }
      }
    };

    if (timerState.isActive && !timerState.isPaused) {
        requestWakeLock();
    } else {
        releaseWakeLock();
    }

    // Handle visibility change (tab switch/minimize) to re-acquire lock when returning
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


  // --- AUDIO SYSTEM ---
  const initAudio = () => {
      if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
      }
  };

  const createNoiseBuffer = (ctx: AudioContext) => {
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
      }
      return buffer;
  };

  const playSoundEffect = (mode: SoundMode) => {
    if (mode === 'mute') return;
    if (!audioContextRef.current) initAudio();
    const ctx = audioContextRef.current!;
    const now = ctx.currentTime;

    const createOsc = (type: OscillatorType, freq: number, gainVal: number, duration: number, delay: number = 0) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);
        
        gain.gain.setValueAtTime(0, now + delay);
        gain.gain.linearRampToValueAtTime(gainVal, now + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + duration);
    };

    switch(mode) {
        case 'bell':
            createOsc('sine', 523.25, 0.1, 1.5);
            createOsc('sine', 1046.50, 0.05, 1.5);
            break;
        case 'hang':
            createOsc('triangle', 293.66, 0.15, 2.0);
            createOsc('sine', 587.32, 0.1, 1.5);
            createOsc('sine', 880.00, 0.02, 1.0);
            break;
        case 'bowl':
            createOsc('sine', 174.61, 0.2, 4.0);
            createOsc('sine', 176.61, 0.15, 4.0);
            createOsc('sine', 523.83, 0.05, 3.0);
            break;
        case 'gong':
            createOsc('triangle', 80, 0.3, 3.5);
            createOsc('sawtooth', 120, 0.1, 3.0);
            createOsc('sine', 200, 0.05, 2.5);
            break;
        case 'harp':
            createOsc('sine', 329.63, 0.15, 1.0);
            createOsc('triangle', 659.25, 0.05, 0.8);
            setTimeout(() => createOsc('sine', 440, 0.1, 1.0), 50);
            break;
        case 'flute':
            createOsc('sine', 440, 0.15, 1.5);
            createOsc('triangle', 440, 0.05, 1.5);
            break;
        case 'om':
            createOsc('sawtooth', 130.81, 0.05, 3.0);
            createOsc('sine', 261.63, 0.1, 3.0);
            break;
        case 'rain':
            const noise = ctx.createBufferSource();
            noise.buffer = createNoiseBuffer(ctx);
            const noiseGain = ctx.createGain();
            const filter = ctx.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.value = 800;
            
            noiseGain.gain.setValueAtTime(0, now);
            noiseGain.gain.linearRampToValueAtTime(0.05, now + 0.1);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);
            
            noise.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(ctx.destination);
            noise.start(now);
            noise.stop(now + 2.0);
            break;
        default:
            break;
    }
  };

  const changeSoundMode = (mode: SoundMode) => {
      initAudio(); // Ensure context is running
      setSoundMode(mode);
      setShowSoundMenu(false);
      setShowMobileMenu(false); // Close mobile menu on selection
      playSoundEffect(mode); 
  };

  const soundOptions: { id: SoundMode; label: string; icon: string }[] = [
      { id: 'mute', label: 'Без звука', icon: 'volume-mute' },
      { id: 'bell', label: 'Колокольчик', icon: 'bell' },
      { id: 'hang', label: 'Ханг (Hang)', icon: 'drum' },
      { id: 'bowl', label: 'Поющая чаша', icon: 'circle-notch' },
      { id: 'gong', label: 'Гонг', icon: 'record-vinyl' },
      { id: 'rain', label: 'Дождь', icon: 'cloud-showers-heavy' },
      { id: 'om', label: 'Ом (Синт)', icon: 'om' },
      { id: 'harp', label: 'Арфа', icon: 'music' },
      { id: 'flute', label: 'Флейта', icon: 'wind' },
  ];

  // --- TIMER LOGIC ---
  const calculateTotalDuration = (p: BreathingPattern, r: number) => {
      if (r === 0) return 0;
      let seconds = 0;
      if (p.mode === 'wim-hof') {
          const avgRetention = p.holdOut + ((r - 1) * 30) / 2;
          const oneRound = ((p.breathCount || 30) * p.inhale) + avgRetention + p.holdIn;
          seconds = oneRound * r;
      } else {
          seconds = (p.inhale + p.holdIn + p.exhale + p.holdOut) * r;
      }
      return seconds;
  };

  const formatDuration = (seconds: number) => {
      if (seconds === 0) return "∞";
      const m = Math.floor(seconds / 60);
      const s = Math.floor(seconds % 60);
      return `${m}м ${s}с`;
  };

  const totalSessionDuration = calculateTotalDuration(activePattern, rounds);
  const timeRemaining = Math.max(0, totalSessionDuration - timerState.totalSecondsElapsed);

  const advancePhase = useCallback(() => {
    setTimerState(prev => {
      let nextPhase = prev.currentPhase;
      let nextDuration = 0;
      let nextRound = prev.currentRound;
      let nextBreath = prev.currentBreath;

      if (executionMode === 'stopwatch') {
          return prev;
      }

      if (activePattern.mode === 'wim-hof') {
          const targetBreaths = activePattern.breathCount || 30;
          switch (prev.currentPhase) {
              case BreathingPhase.Ready:
                  nextPhase = BreathingPhase.Inhale;
                  nextDuration = activePattern.inhale; 
                  nextBreath = 1;
                  break;
              case BreathingPhase.Inhale:
                  nextPhase = BreathingPhase.Exhale;
                  nextDuration = activePattern.exhale || (activePattern.inhale * 0.6); 
                  break;
              case BreathingPhase.Exhale:
                  if (prev.currentBreath < targetBreaths) {
                      nextBreath = prev.currentBreath + 1;
                      nextPhase = BreathingPhase.Inhale;
                      nextDuration = activePattern.inhale;
                  } else {
                      nextPhase = BreathingPhase.HoldOut;
                      nextDuration = activePattern.holdOut + (prev.currentRound - 1) * 30;
                  }
                  break;
              case BreathingPhase.HoldOut:
                  nextPhase = BreathingPhase.Inhale;
                  nextDuration = 2.0; 
                  break;
              case BreathingPhase.HoldIn:
                   if (rounds > 0 && prev.currentRound >= rounds) {
                       nextPhase = BreathingPhase.Done;
                   } else {
                       nextRound = prev.currentRound + 1;
                       nextBreath = 1;
                       nextPhase = BreathingPhase.Inhale;
                       nextDuration = activePattern.inhale;
                   }
                   break;
              default: return prev;
          }
          if (prev.currentPhase === BreathingPhase.Inhale && prev.currentBreath > targetBreaths) {
               nextPhase = BreathingPhase.HoldIn;
               nextDuration = activePattern.holdIn;
          }
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
          currentBreath: nextBreath
      };
    });
  }, [activePattern, rounds, soundMode, executionMode]);

  const tick = useCallback((time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = (time - previousTimeRef.current) / 1000;
      setTimerState(prev => {
        if (!prev.isActive || prev.isPaused || prev.currentPhase === BreathingPhase.Done) return prev;
        
        if (executionMode === 'stopwatch') {
             return { ...prev, totalSecondsElapsed: prev.totalSecondsElapsed + deltaTime, secondsRemaining: prev.secondsRemaining + deltaTime };
        }

        const newTimeLeft = prev.secondsRemaining - deltaTime;
        if (newTimeLeft <= 0) return { ...prev, secondsRemaining: newTimeLeft, totalSecondsElapsed: prev.totalSecondsElapsed + deltaTime };
        return { ...prev, secondsRemaining: newTimeLeft, totalSecondsElapsed: prev.totalSecondsElapsed + deltaTime };
      });
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(tick);
  }, [executionMode]);

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
     if (executionMode !== 'stopwatch' && timerState.isActive && !timerState.isPaused && timerState.secondsRemaining <= 0.05 && timerState.currentPhase !== BreathingPhase.Done) {
         advancePhase();
     }
  }, [timerState.secondsRemaining, timerState.isActive, timerState.isPaused, timerState.currentPhase, advancePhase, executionMode]);

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
        isPaused: false
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
          totalSecondsElapsed: 0
      }));
  };

  const getFilteredPatterns = () => {
      let patterns = DEFAULT_PATTERNS;
      if (searchQuery) {
          const lowerQuery = searchQuery.toLowerCase();
          patterns = patterns.filter(p => 
              p.name.toLowerCase().includes(lowerQuery) || 
              p.description.toLowerCase().includes(lowerQuery) ||
              p.category.toLowerCase().includes(lowerQuery)
          );
      }
      if (selectedCategory !== 'All') {
          patterns = patterns.filter(p => p.category === selectedCategory);
      }
      return patterns.reduce((acc, pattern) => {
          if (!acc[pattern.category]) acc[pattern.category] = [];
          acc[pattern.category].push(pattern);
          return acc;
      }, {} as Record<string, BreathingPattern[]>);
  };

  const filteredGroupedPatterns = getFilteredPatterns();
  const allCategories = ['All', ...Object.keys(categoryNames)];

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-purple-500/30 overflow-x-hidden relative text-gray-900 dark:text-gray-100 transition-colors duration-500 bg-slate-50 dark:bg-[#050505]">
      
      {/* LOADING SCREEN (SPLASH) */}
      {isLoadingApp && (
          <div className="fixed inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-center transition-opacity duration-1000 animate-fade-in">
              <div className="mb-8 transform scale-100 md:scale-150 transition-transform duration-700">
                  {/* Using a unique ID suffix for the splash screen logo to avoid gradient conflicts */}
                  <EntheoLogo size={120} animated={true} idSuffix="splash" />
              </div>
              <h1 className="text-3xl md:text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-zen-accent via-premium-purple to-premium-gold tracking-[0.2em] animate-pulse text-center px-4 uppercase">EntheoBreath</h1>
              <p className="text-premium-purple/70 mt-4 text-[10px] md:text-xs font-bold uppercase tracking-[0.5em] text-center">Загрузка сознания...</p>
          </div>
      )}

      {/* --- PREMIUM ANIMATED BACKGROUND --- */}
      <div className={`fixed inset-0 z-0 transition-opacity duration-1000 ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute inset-0 bg-[#050505]">
            <div className="absolute top-[-40%] left-[-20%] w-[80vw] h-[80vw] bg-indigo-900/10 rounded-full blur-[150px] animate-aurora mix-blend-screen"></div>
            <div className="absolute bottom-[-40%] right-[-20%] w-[80vw] h-[80vw] bg-purple-900/10 rounded-full blur-[150px] animate-aurora mix-blend-screen" style={{ animationDelay: '-10s' }}></div>
            <div className="absolute top-[40%] left-[30%] w-[40vw] h-[40vw] bg-amber-900/5 rounded-full blur-[120px] animate-pulse-slow mix-blend-screen"></div>
          </div>
      </div>
      
      <div className={`fixed inset-0 z-0 bg-slate-50 transition-opacity duration-1000 ${theme === 'light' ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50"></div>
      </div>

      {/* Modals */}
      {showMobileFaq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 dark:bg-black/80 backdrop-blur-xl animate-fade-in">
             <div className="bg-white dark:bg-[#121212] p-8 rounded-3xl max-w-md border border-gray-100 dark:border-white/5 shadow-2xl relative z-50">
                <h3 className="text-2xl font-display font-bold mb-4 text-gray-900 dark:text-white">Приложение или Сайт?</h3>
                <p className="mb-6 text-gray-600 dark:text-gray-400 font-light leading-relaxed">Это PWA. Добавь на экран "Домой" и пользуйся как нативным приложением.</p>
                <button onClick={() => setShowMobileFaq(false)} className="w-full py-3.5 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl hover:scale-[1.02] transition-transform active:scale-95">Понятно</button>
             </div>
        </div>
      )}
      
      <AnalysisModal 
         isOpen={isAnalysisOpen} 
         onClose={() => setAnalysisOpen(false)} 
         title={`AI Анализ: ${activePattern.name}`} 
         content={analysisContent}
         isLoading={isAnalyzing}
      />
      <AnalysisModal 
         isOpen={showPhilosophy} 
         onClose={() => setShowPhilosophy(false)} 
         title="Философия Практики" 
         content={PHILOSOPHY_CONTENT}
         isLoading={false}
      />

      {/* --- PREMIUM NAVBAR (RESPONSIVE) --- */}
      <nav className="w-full h-20 md:h-24 bg-white/70 dark:bg-[#050505]/60 backdrop-blur-2xl border-b border-gray-200/50 dark:border-white/5 sticky top-0 z-40 flex-shrink-0 transition-all duration-300">
        <div className="w-full px-4 md:px-6 h-full flex items-center justify-between max-w-[1920px] mx-auto relative">
            
            {/* 1. Left: Logo & Branding */}
            <div className="flex items-center gap-3 cursor-pointer group relative flex-shrink-0" onClick={() => setView('library')}>
                <div className="absolute left-8 top-1/2 -translate-y-1/2 w-32 h-32 bg-cyan-500/10 blur-[50px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="relative group-hover:scale-105 transition-transform duration-500 ease-out z-10">
                    {/* Responsive Logo Size - ID Suffix Main to differ from Splash */}
                     <div className="block md:hidden"><EntheoLogo size={40} animated={true} idSuffix="nav-sm" /></div>
                     <div className="hidden md:block"><EntheoLogo size={64} animated={true} idSuffix="nav-lg" /></div>
                </div>
                <div className="flex flex-col z-10">
                    {/* Responsive Text Size */}
                    <h1 className="font-display font-bold text-xl md:text-3xl tracking-tight text-gray-900 dark:text-white leading-none">
                        Entheo<span className="text-transparent bg-clip-text bg-gradient-to-r from-zen-accent via-premium-purple to-premium-gold">Breath</span>
                    </h1>
                </div>
            </div>
            
            {/* 2. Right: Controls */}
            <div className="flex gap-2 md:gap-4 items-center relative">
                
                {/* Theme Toggle (Always Visible) */}
                <button 
                    onClick={toggleTheme}
                    className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-2xl bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-zen-accent dark:hover:text-white transition-all duration-300 active:scale-95 border border-transparent hover:border-white/10"
                >
                    <i className={`fas fa-${theme === 'dark' ? 'sun' : 'moon'} text-lg md:text-xl`}></i>
                </button>

                {/* --- DESKTOP MENU (Hidden on Mobile) --- */}
                <div className="hidden md:flex items-center gap-4">
                    
                    {/* INSTALL PWA BUTTON (Desktop) */}
                    {deferredPrompt && (
                        <button 
                            onClick={handleInstallClick}
                            className="flex items-center gap-3 px-5 py-2.5 rounded-full text-xs font-bold bg-zen-accent/10 border border-zen-accent/30 text-zen-accent hover:bg-zen-accent/20 transition-all duration-300 hover:shadow-glow-cyan backdrop-blur-md animate-pulse-slow"
                        >
                            <i className="fas fa-download"></i>
                            <span className="tracking-wide">Установить</span>
                        </button>
                    )}

                    <button 
                        onClick={() => setShowPhilosophy(true)}
                        className="flex items-center gap-3 px-5 py-2.5 rounded-full text-xs font-bold bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/5 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:border-premium-purple/30 transition-all duration-300 hover:shadow-glow-purple backdrop-blur-md"
                    >
                        <i className="fas fa-book-open text-premium-purple"></i>
                        <span className="tracking-wide">Философия</span>
                    </button>
                    
                    <div className="relative">
                        <button 
                            onClick={() => setShowSoundMenu(!showSoundMenu)}
                            className={`flex items-center gap-3 px-5 py-2.5 rounded-full text-xs font-bold transition-all border duration-300 backdrop-blur-md ${
                                soundMode !== 'mute' 
                                ? 'bg-zen-accent/5 border-zen-accent/20 text-cyan-600 dark:text-zen-accent shadow-glow-cyan' 
                                : 'bg-white/50 dark:bg-white/5 border-gray-200 dark:border-white/5 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
                            }`}
                        >
                            <i className={`fas fa-${soundOptions.find(o => o.id === soundMode)?.icon || 'bell'}`}></i>
                            <span className="tracking-wide">
                                {soundOptions.find(o => o.id === soundMode)?.label || 'Звук'}
                            </span>
                            <i className="fas fa-chevron-down text-[9px] ml-1 opacity-60"></i>
                        </button>

                        {showSoundMenu && (
                            <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowSoundMenu(false)}></div>
                            <div className="absolute right-0 top-full mt-4 w-72 bg-white/90 dark:bg-[#121212]/90 border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl py-3 z-50 animate-fade-in flex flex-col max-h-[400px] overflow-y-auto custom-scrollbar backdrop-blur-xl ring-1 ring-black/5">
                                <div className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-white/5 mb-2">
                                    Атмосфера
                                </div>
                                {soundOptions.map((opt) => (
                                    <div 
                                        key={opt.id}
                                        className={`px-5 py-3.5 flex items-center justify-between gap-4 text-sm transition-all cursor-pointer group relative ${
                                            soundMode === opt.id 
                                            ? 'bg-cyan-50 dark:bg-zen-accent/10' 
                                            : 'hover:bg-gray-50 dark:hover:bg-white/5'
                                        }`}
                                        onClick={() => changeSoundMode(opt.id)}
                                    >
                                        {soundMode === opt.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-zen-accent shadow-[0_0_10px_#22d3ee]"></div>}
                                        <div className={`flex items-center gap-4 ${
                                            soundMode === opt.id ? 'text-cyan-700 dark:text-zen-accent font-bold' : 'text-gray-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white'
                                        }`}>
                                            <div className="w-6 text-center"><i className={`fas fa-${opt.icon}`}></i></div>
                                            <span className="font-medium">{opt.label}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            </>
                        )}
                    </div>

                    <button 
                        onClick={handleShare} 
                        className="w-12 h-12 flex items-center justify-center rounded-2xl text-gray-400 hover:text-zen-accent dark:hover:text-zen-accent transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                        title="Поделиться"
                    >
                        <i className="fas fa-share-alt text-xl"></i>
                    </button>
                </div>

                {/* --- MOBILE MENU BUTTON (Visible on Mobile) --- */}
                <button 
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                    className="md:hidden w-10 h-10 flex items-center justify-center rounded-2xl bg-white/5 dark:bg-white/5 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10"
                >
                    <i className={`fas fa-${showMobileMenu ? 'times' : 'bars'} text-lg`}></i>
                </button>

                {/* --- MOBILE MENU DROPDOWN --- */}
                {showMobileMenu && (
                    <div className="absolute top-full right-0 mt-4 w-64 bg-white/95 dark:bg-[#121212]/95 backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl p-4 z-50 animate-fade-in origin-top-right md:hidden">
                        <div className="flex flex-col gap-2">
                            
                            {/* Install Button (Mobile Menu) */}
                            {deferredPrompt && (
                                <button 
                                    onClick={handleInstallClick}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold bg-zen-accent/10 text-zen-accent hover:bg-zen-accent/20 transition-colors animate-pulse-slow"
                                >
                                    <i className="fas fa-download w-5 text-center"></i>
                                    <span className="tracking-wide">Установить приложение</span>
                                </button>
                            )}

                            {/* Philosophy */}
                            <button 
                                onClick={() => { setShowPhilosophy(true); setShowMobileMenu(false); }}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold bg-gray-50 dark:bg-white/5 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                            >
                                <i className="fas fa-book-open text-premium-purple w-5 text-center"></i>
                                <span className="tracking-wide">Философия</span>
                            </button>

                            {/* Share Mobile */}
                            <button 
                                onClick={() => { handleShare(); setShowMobileMenu(false); }} 
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold bg-gray-50 dark:bg-white/5 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                            >
                                <i className="fas fa-share-alt text-zen-accent w-5 text-center"></i>
                                <span className="tracking-wide">Поделиться</span>
                            </button>

                            {/* FAQ */}
                            <button 
                                onClick={() => { setShowMobileFaq(true); setShowMobileMenu(false); }} 
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold bg-gray-50 dark:bg-white/5 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                            >
                                <i className="far fa-question-circle text-gray-400 w-5 text-center"></i>
                                <span className="tracking-wide">Помощь</span>
                            </button>

                            <div className="h-px bg-gray-200 dark:bg-white/10 my-1"></div>
                            
                            {/* Sound Selector (Embedded in Mobile Menu) */}
                            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 px-2 py-1">
                                Звуки
                            </div>
                            <div className="grid grid-cols-1 gap-1 max-h-[200px] overflow-y-auto custom-scrollbar">
                                {soundOptions.map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => changeSoundMode(opt.id)}
                                        className={`px-3 py-2.5 rounded-lg flex items-center gap-3 text-xs transition-colors ${
                                            soundMode === opt.id 
                                            ? 'bg-cyan-50 dark:bg-zen-accent/10 text-cyan-700 dark:text-zen-accent font-bold border border-cyan-200 dark:border-zen-accent/30' 
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
                                        }`}
                                    >
                                        <i className={`fas fa-${opt.icon} w-5 text-center`}></i>
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="w-full max-w-[1920px] mx-auto flex-grow flex flex-col relative z-10">
        
        {view === 'library' && (
            <div className="animate-fade-in p-6 md:p-16 pb-32">
                {/* ... existing library content ... */}
                <div className="max-w-7xl mx-auto">
                    <header className="mb-20 text-center relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full blur-[100px] -z-10 opacity-50 pointer-events-none"></div>

                        <h2 className="text-5xl md:text-7xl font-display font-medium mb-8 text-transparent bg-clip-text bg-gradient-to-b from-gray-900 to-gray-500 dark:from-white dark:to-gray-500 tracking-tight leading-[1.1]">
                            Библиотека <br className="md:hidden" /> <span className="italic font-light text-zen-accent dark:text-zen-accent">Дыхания</span>
                        </h2>
                        
                        {/* SEARCH & FILTERS */}
                        <div className="max-w-2xl mx-auto space-y-6">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <i className="fas fa-search text-gray-400 dark:text-gray-500 group-focus-within:text-zen-accent transition-colors duration-300"></i>
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Поиск техник..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-6 py-4 bg-white/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl focus:outline-none focus:border-zen-accent focus:ring-1 focus:ring-zen-accent/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 transition-all shadow-lg dark:shadow-none backdrop-blur-md hover:shadow-xl"
                                />
                            </div>

                            <div className="flex flex-wrap justify-center gap-3">
                                {allCategories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-5 py-2 rounded-full text-xs font-bold transition-all border duration-300 ${
                                            selectedCategory === cat 
                                            ? 'bg-cyan-100 dark:bg-zen-accent/20 text-cyan-700 dark:text-zen-accent border-cyan-200 dark:border-zen-accent/30 shadow-glow-cyan' 
                                            : 'bg-white/50 dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/5 hover:bg-white dark:hover:bg-white/10 hover:text-black dark:hover:text-white'
                                        }`}
                                    >
                                        {cat === 'All' ? 'Все' : categoryNames[cat]}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </header>
                    
                    <div className="space-y-20">
                        {Object.entries(filteredGroupedPatterns).map(([category, patterns], catIdx) => (
                            <div key={category} className="animate-fade-in-up" style={{ animationDelay: `${catIdx * 100}ms` }}>
                                <div className="flex items-center gap-5 mb-10">
                                    <div className="w-12 h-12 rounded-2xl bg-cyan-100/50 dark:bg-white/5 flex items-center justify-center border border-cyan-200/50 dark:border-white/5 text-cyan-600 dark:text-zen-accent text-xl shadow-lg backdrop-blur-sm">
                                        <i className={`fas fa-${categoryIcons[category] || 'wind'}`}></i>
                                    </div>
                                    <h3 className="text-3xl font-display font-bold text-gray-900 dark:text-white tracking-tight">
                                        {categoryNames[category] || category}
                                    </h3>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {patterns.map((p, idx) => (
                                        <SpotlightCard 
                                            key={p.id} 
                                            onClick={() => selectPattern(p)}
                                            className="bg-white/80 dark:bg-[#0f0f10]/60 backdrop-blur-xl rounded-[24px] p-6 cursor-pointer shadow-sm hover:shadow-2xl dark:shadow-black/50 border border-gray-200 dark:border-white/5 flex flex-col h-full min-h-[280px]"
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <h3 className="text-lg font-display font-bold text-gray-900 dark:text-white group-hover:text-zen-accent dark:group-hover:text-zen-accent transition-colors leading-tight line-clamp-2">{p.name}</h3>
                                                <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg border border-transparent dark:border-white/5 shrink-0 ml-2 ${
                                                    p.difficulty === 'Новичок' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' :
                                                    p.difficulty === 'Средний' ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400' :
                                                    'bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400'
                                                }`}>
                                                    {p.difficulty}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 line-clamp-4 leading-relaxed font-light">{p.description}</p>
                                            
                                            <div className="flex flex-wrap gap-2 mb-4 mt-auto">
                                                {p.benefits && p.benefits.slice(0, 2).map((b, i) => (
                                                    <span key={i} className="text-[10px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/5 px-2.5 py-1 rounded-md border border-gray-100 dark:border-white/5 truncate max-w-full">
                                                        {b}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="flex items-center gap-3 text-xs font-mono text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-white/5 pt-4 group-hover:text-zen-accent dark:group-hover:text-zen-accent transition-colors">
                                                <i className="far fa-clock"></i>
                                                {p.mode === 'wim-hof' ? (
                                                    <span>Протокол: 3 Фазы</span>
                                                ) : p.mode === 'stopwatch' ? (
                                                    <span>Режим: Секундомер</span>
                                                ) : p.mode === 'manual' ? (
                                                    <span>Режим: Руководство</span>
                                                ) : (
                                                    <span>Паттерн: <span className="text-gray-900 dark:text-white font-bold">
                                                        {p.displayLabel ? p.displayLabel : `${p.inhale}-${p.holdIn}-${p.exhale}-${p.holdOut}`}
                                                    </span></span>
                                                )}
                                            </div>
                                        </SpotlightCard>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                <footer className="mt-32 pb-10 text-center animate-fade-in text-gray-500 dark:text-gray-500">
                    <div className="flex flex-col items-center gap-6">
                        <div className="text-sm font-bold tracking-[0.1em] opacity-70">
                            СОЗДАНО С 
                            <a 
                                href="https://t.me/+D78P1fpaduBlOTc6" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-block mx-1 align-middle cursor-default"
                            >
                                <span className="text-rose-500 animate-pulse text-lg">❤️</span>
                            </a> 
                            — <a href="https://t.me/nikolaiovchinnikov" target="_blank" rel="noopener noreferrer" className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 transition-colors border-b border-transparent hover:border-cyan-500">НИКОЛАЙ ОВЧИННИКОВ</a>
                        </div>
                        <a 
                            href="https://t.me/nikolaiovchinnikov" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-white/10 hover:border-cyan-500 dark:hover:border-cyan-500 hover:scale-105 transition-all text-xs font-bold uppercase tracking-widest shadow-lg"
                        >
                            <i className="fab fa-telegram-plane text-cyan-500 text-lg"></i>
                            Предложения и обратная связь
                        </a>
                    </div>
                </footer>
            </div>
        )}

        {view === 'timer' && (
            // REFACTORED MOBILE LAYOUT
            <div className="flex-grow flex flex-col lg:flex-row h-screen lg:overflow-hidden relative">
                
                {/* --- MANUAL STOPWATCH OVERLAY (NEW) --- */}
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
                                <TimerVisual 
                                    phase={timerState.currentPhase} 
                                    timeLeft={timerState.totalSecondsElapsed}
                                    totalTimeForPhase={3}
                                    label={"Секундомер"}
                                    mode={'stopwatch'}
                                    theme={theme}
                                />
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

                {/* INFO PANEL (Full width in manual mode, else split) */}
                <div className={`w-full ${activePattern.mode === 'manual' ? 'lg:w-full' : 'lg:w-[480px]'} bg-white/80 dark:bg-[#0a0a0b]/80 backdrop-blur-3xl border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-white/5 flex flex-col relative z-20 shadow-2xl h-auto lg:h-full lg:overflow-y-auto custom-scrollbar order-1 transition-all duration-500`}>
                    {/* Header Area */}
                    <div className="px-6 py-6 md:px-8 md:py-6 border-b border-gray-200 dark:border-white/5 bg-white/50 dark:bg-[#0a0a0b]/50 sticky top-0 z-30 backdrop-blur-xl transition-colors duration-300">
                        <button 
                            onClick={() => setView('library')}
                            className="flex items-center gap-2 text-gray-500 hover:text-black dark:hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest mb-4 group"
                        >
                            <i className="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i> Меню
                        </button>

                        <div className="flex items-baseline justify-between mb-2">
                            <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900 dark:text-white leading-none tracking-tight">{activePattern.name}</h2>
                            <div className="flex items-center gap-2 text-xs text-zen-accent font-bold">
                                <i className={`fas fa-${categoryIcons[activePattern.category]}`}></i>
                                <span className="hidden sm:inline">{categoryNames[activePattern.category]}</span>
                            </div>
                        </div>
                        
                        <div className="flex p-1 bg-gray-100/80 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/5 mt-4">
                            <button 
                                onClick={() => setInfoTab('about')}
                                className={`flex-1 py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all uppercase tracking-wide ${infoTab === 'about' ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            >
                                Обзор
                            </button>
                            <button 
                                onClick={() => setInfoTab('guide')}
                                className={`flex-1 py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all uppercase tracking-wide ${infoTab === 'guide' ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            >
                                Техника
                            </button>
                        </div>
                    </div>

                    <div className={`p-6 md:p-8 pb-10 ${activePattern.mode === 'manual' ? 'max-w-4xl mx-auto w-full' : ''}`}>
                         {infoTab === 'about' && (
                             <div className="space-y-8 animate-fade-in">
                                 <div>
                                     <h4 className="text-[10px] font-bold text-zen-accent uppercase tracking-[0.2em] mb-3 opacity-80">Суть практики</h4>
                                     <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base md:text-lg font-light">{activePattern.description}</p>
                                 </div>
                                 
                                 {activePattern.benefits && activePattern.benefits.length > 0 && (
                                     <div>
                                         <h4 className="text-[10px] font-bold text-premium-purple uppercase tracking-[0.2em] mb-3 opacity-80">Ключевые эффекты</h4>
                                         <ul className="space-y-3">
                                             {activePattern.benefits.map((benefit, i) => (
                                                 <li key={i} className="flex items-start gap-3 text-gray-700 dark:text-gray-300 font-light">
                                                     <div className="mt-2 w-1.5 h-1.5 rounded-full bg-premium-purple flex-shrink-0 shadow-glow-purple"></div>
                                                     <span className="text-base md:text-lg">{benefit}</span>
                                                 </li>
                                             ))}
                                         </ul>
                                     </div>
                                 )}
                                 
                                 <div className="grid grid-cols-2 gap-4 mt-6">
                                     <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-200 dark:border-white/5">
                                         <div className="text-[9px] text-gray-400 uppercase tracking-wider mb-1 font-bold">Категория</div>
                                         <div className="text-gray-900 dark:text-white font-display font-bold text-sm">{activePattern.category}</div>
                                     </div>
                                     <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-200 dark:border-white/5">
                                         <div className="text-[9px] text-gray-400 uppercase tracking-wider mb-1 font-bold">Сложность</div>
                                         <div className="text-gray-900 dark:text-white font-display font-bold text-sm">{activePattern.difficulty}</div>
                                     </div>
                                 </div>

                                 {activePattern.mode !== 'stopwatch' && activePattern.mode !== 'manual' && (
                                     <div className="w-full mt-6 group relative">
                                         <button 
                                            onClick={handleDeepAnalysis}
                                            disabled={isAnalyzing}
                                            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 dark:from-cyan-900/40 dark:to-purple-900/40 border border-cyan-200 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-200 rounded-xl text-xs font-bold hover:bg-white dark:hover:from-cyan-900/60 dark:hover:to-purple-900/60 transition-all shadow-lg hover:shadow-cyan-500/20 active:scale-[0.98]"
                                         >
                                            <i className="fas fa-sparkles text-base animate-pulse"></i>
                                            {isAnalyzing ? 'Анализирую...' : 'AI Анализ (Подробнее)'}
                                         </button>
                                     </div>
                                 )}
                             </div>
                         )}

                         {infoTab === 'guide' && (
                             <div className="animate-fade-in">
                                 <ReactMarkdown
                                    components={{
                                        p: ({node, ...props}) => <p className="mb-5 text-gray-700 dark:text-gray-300 leading-relaxed font-light text-base md:text-lg" {...props} />,
                                        strong: ({node, ...props}) => <span className="text-cyan-700 dark:text-zen-accent font-bold block mb-1 uppercase text-[10px] tracking-[0.1em] mt-6" {...props} />,
                                        ol: ({node, ...props}) => <ol className="space-y-4 mb-8 list-decimal pl-4 text-gray-700 dark:text-gray-300 text-base md:text-lg" {...props} />,
                                        ul: ({node, ...props}) => <ul className="space-y-2 list-disc pl-5 mb-6 text-gray-700 dark:text-gray-300 marker:text-cyan-500 text-base md:text-lg" {...props} />,
                                        li: ({node, ...props}) => <li className="pl-1 mb-1" {...props} />,
                                        h3: ({node, ...props}) => <h3 className="text-lg md:text-xl font-display font-bold text-gray-900 dark:text-white mt-8 mb-4 border-b border-gray-200 dark:border-white/10 pb-2" {...props} />,
                                        h4: ({node, ...props}) => <h4 className="text-base font-bold text-gray-800 dark:text-gray-200 mt-6 mb-2" {...props} />,
                                        blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-premium-purple/50 pl-4 py-2 my-4 bg-premium-purple/5 italic text-gray-600 dark:text-gray-400 text-sm" {...props} />
                                    }}
                                 >
                                    {activePattern.instruction}
                                 </ReactMarkdown>
                                 
                                 {/* Safety Warning merged into Guide */}
                                 {activePattern.safetyWarning && (
                                     <div className="mt-8 bg-rose-50 dark:bg-rose-900/10 border-l-4 border-rose-500 p-5 rounded-r-xl">
                                         <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                             <i className="fas fa-exclamation-triangle"></i> Важно
                                         </h4>
                                         <p className="text-rose-900 dark:text-rose-100 leading-relaxed font-medium text-sm md:text-base">{activePattern.safetyWarning}</p>
                                     </div>
                                 )}

                                 {activePattern.musicLinks && activePattern.musicLinks.length > 0 && (
                                     <div className="mt-8 p-5 bg-gradient-to-r from-purple-100/50 to-cyan-100/50 dark:from-purple-900/30 dark:to-cyan-900/30 border border-purple-200 dark:border-white/10 rounded-xl">
                                         <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2 uppercase tracking-wider">
                                             <i className="fas fa-book-reader text-purple-600 dark:text-premium-purple"></i> Материалы
                                         </h4>
                                         <div className="space-y-2">
                                             {activePattern.musicLinks.map((link, idx) => (
                                                 <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full text-center py-3 bg-black dark:bg-white text-white dark:text-black font-bold rounded-lg hover:scale-[1.01] transition-transform shadow-md text-xs uppercase tracking-wide">
                                                     {link.icon && <i className={`fas fa-${link.icon}`}></i>} {link.label}
                                                 </a>
                                             ))}
                                         </div>
                                     </div>
                                 )}
                             </div>
                         )}
                    </div>

                    {/* Footer - Only visible at bottom of info panel */}
                    <div className="p-4 md:p-6 border-t border-gray-200 dark:border-white/5 text-center text-gray-500 dark:text-gray-500 bg-white/50 dark:bg-[#0a0a0b]/50 backdrop-blur-xl mt-auto">
                        <div className="flex flex-col items-center gap-3">
                            <div className="text-[10px] font-bold tracking-[0.1em] opacity-50">
                                СОЗДАНО С 
                                <a 
                                    href="https://t.me/+D78P1fpaduBlOTc6" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-block mx-1 align-middle cursor-default"
                                >
                                    <span className="text-rose-500 animate-pulse text-sm">❤️</span>
                                </a> 
                                — <a href="https://t.me/nikolaiovchinnikov" target="_blank" rel="noopener noreferrer" className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 transition-colors border-b border-transparent hover:border-cyan-500">НИКОЛАЙ ОВЧИННИКОВ</a>
                            </div>
                            <a 
                                href="https://t.me/nikolaiovchinnikov" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-[8px] uppercase font-bold tracking-[0.2em] text-gray-400 hover:text-cyan-500 transition-colors border border-gray-200 dark:border-white/5 px-3 py-1.5 rounded-full"
                            >
                                <i className="fab fa-telegram mr-2"></i>
                                Обратная связь
                            </a>
                        </div>
                    </div>
                </div>

                {/* TIMER PANEL (Bottom on Mobile, Right on Desktop) - HIDDEN IN MANUAL MODE */}
                {activePattern.mode !== 'manual' && (
                    <div className="flex-1 flex flex-col min-h-screen lg:min-h-0 lg:h-full relative overflow-hidden order-2">
                    
                        {/* Ghost Gradient */}
                        <div 
                            className={`absolute inset-0 transition-opacity duration-1000 z-0 pointer-events-none ${timerState.isActive ? 'opacity-30' : 'opacity-0'}`}
                            style={{
                                background: 'radial-gradient(circle at center, rgba(34, 211, 238, 0.15) 0%, rgba(0,0,0,0) 70%)'
                            }}
                        ></div>

                        {/* FLEX CONTAINER FOR VERTICAL DISTRIBUTION */}
                        <div className="flex flex-col h-full justify-between z-10 py-6">
                            
                            {/* 1. TOP BLOCK: Mode Switcher & Info Pill */}
                            <div className="flex flex-col items-center gap-6 flex-shrink-0">
                                {/* Mode Switcher */}
                                <div className="flex items-center justify-center p-1.5 bg-gray-200 dark:bg-white/5 rounded-full backdrop-blur-md border border-white/10 scale-90 lg:scale-100">
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

                                {/* Time Remaining Pill - Now grouped with Switcher */}
                                {executionMode === 'timer' && (
                                    <div className="flex items-center justify-center gap-4 relative z-20">
                                        {timerState.isActive && rounds > 0 ? (
                                            <div className="px-5 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-zen-accent text-sm font-mono font-bold shadow-glow-cyan animate-pulse-slow">
                                                Осталось: {formatDuration(timeRemaining)}
                                            </div>
                                        ) : (
                                            <div className="px-5 py-2 rounded-full bg-gray-100/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 text-sm font-mono font-bold backdrop-blur-sm">
                                                Всего: {rounds > 0 ? `~${formatDuration(totalSessionDuration)}` : '∞'}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* 2. MIDDLE BLOCK: The Visual (Flex Grow forces centering) */}
                            <div className="flex-1 flex items-center justify-center w-full px-4">
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
                            </div>

                            {/* 3. BOTTOM BLOCK: Play Buttons & Controls */}
                            <div className="flex flex-col items-center gap-8 flex-shrink-0 w-full max-w-3xl mx-auto px-4 lg:px-8 pb-4">
                                {/* PLAY BUTTONS */}
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
                                            : 'bg-black dark:bg-white text-white dark:text-black hover:opacity-90 shadow-[0_0_60px_rgba(0,0,0,0.1)] dark:shadow-[0_0_60px_rgba(255,255,255,0.2)] hover:scale-105'
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

                                {/* CONTROLS */}
                                <div className={`w-full transition-all duration-700 ${timerState.isActive && !timerState.isPaused ? 'opacity-20 blur-sm pointer-events-none grayscale' : 'opacity-100'}`}>
                                    <Controls 
                                        pattern={{...activePattern, mode: executionMode === 'stopwatch' ? 'stopwatch' : activePattern.mode}} 
                                        onChange={setActivePattern} 
                                        rounds={rounds} 
                                        onRoundsChange={setRounds}
                                        readOnly={timerState.isActive && !timerState.isPaused}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* MANUAL MODE FLOATING BUTTON */}
                {activePattern.mode === 'manual' && (
                    <button 
                        onClick={() => setManualStopwatchOpen(true)}
                        className="fixed bottom-8 right-8 z-40 bg-white dark:bg-zen-accent text-black font-bold p-4 rounded-full shadow-glow-cyan animate-pulse-slow hover:scale-110 transition-transform"
                        title="Открыть секундомер"
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