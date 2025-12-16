import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { BreathState, BreathingPattern, BreathingPhase } from './types';
import { DEFAULT_PATTERNS } from './constants';
import Controls from './components/Controls';
import TimerVisual from './components/TimerVisual';
import { getBreathingAnalysis, generateVoiceGuidance } from './services/geminiService';
import AnalysisModal from './components/AnalysisModal';

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
  const [infoTab, setInfoTab] = useState<'about' | 'guide' | 'safety'>('about'); // Tab state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
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
  
  // Philosophy Modal State
  const [showPhilosophy, setShowPhilosophy] = useState(false);
  
  // Mobile FAQ
  const [showMobileFaq, setShowMobileFaq] = useState(false);

  // Audio
  const [audioEnabled, setAudioEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Refs
  const requestRef = useRef<number | undefined>(undefined);
  const previousTimeRef = useRef<number | undefined>(undefined);

  // --- Helpers ---
  const playPhaseSound = () => {
    // Immediate soft chime using Web Audio API
    if (!audioEnabled) return;
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        // Soft sine wave bell tone
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(261.63, ctx.currentTime + 1.5); // Drop an octave
        
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
        
        osc.start();
        osc.stop(ctx.currentTime + 1.5);
    } catch (e) {
        console.error("Audio context error", e);
    }
  };

  const playAudioCue = async (text: string, currentRound: number, patternId: string) => {
    if (!audioEnabled && text !== "Test") return;

    let spokenText = text;
    
    // Custom logic for Anuloma Viloma instructions
    if (patternId === 'anuloma-viloma-base') {
        const isOddRound = currentRound % 2 !== 0;
        if (text === "Inhale") spokenText = isOddRound ? "Вдох левой" : "Вдох правой";
        else if (text === "Exhale") spokenText = isOddRound ? "Выдох правой" : "Выдох левой";
        else if (text === "Hold") spokenText = "Задержка";
    } else if (text === "Inhale" || text === "Exhale") {
        // Standard translations
        spokenText = text === "Inhale" ? "Вдох" : "Выдох";
    } else {
        // Other phases
         spokenText = text === "Hold" ? "Задержка" :
                     text === "Session complete" ? "Практика завершена" : 
                     text === "Test" ? "Вдох" : text;
    }

    // Don't voice every single breath in rapid breathing (Wim Hof)
    if (patternId === 'wim-hof-session' && (text === "Inhale" || text === "Exhale")) {
       return; 
    }

    const url = await generateVoiceGuidance(spokenText);
    if (url) {
        if (audioRef.current) {
            audioRef.current.src = url;
            audioRef.current.play().catch(e => console.log("Audio play failed", e));
        } else {
             const audio = new Audio(url);
             audioRef.current = audio;
             audio.play().catch(e => console.log("Audio play failed", e));
        }
    }
  };

  const toggleAudio = () => {
      const newState = !audioEnabled;
      setAudioEnabled(newState);
      if (newState) {
          playPhaseSound(); // Test beep
          playAudioCue("Test", 1, ""); // Test voice
      }
  };

  // --- Timer Logic ---
  const advancePhase = useCallback(() => {
    setTimerState(prev => {
      let nextPhase = prev.currentPhase;
      let nextDuration = 0;
      let nextRound = prev.currentRound;
      let nextBreath = prev.currentBreath;

      // --- WIM HOF MODE LOGIC ---
      if (activePattern.mode === 'wim-hof') {
          const targetBreaths = activePattern.breathCount || 30;
          
          switch (prev.currentPhase) {
              case BreathingPhase.Ready:
                  nextPhase = BreathingPhase.Inhale;
                  // Use pattern values instead of hardcoded 1.6
                  nextDuration = activePattern.inhale; 
                  nextBreath = 1;
                  break;
                  
              case BreathingPhase.Inhale:
                  nextPhase = BreathingPhase.Exhale;
                  // Use pattern values instead of hardcoded 1.0 (approx 60% of inhale is standard logic if not set, but now we set both)
                  nextDuration = activePattern.exhale || (activePattern.inhale * 0.6); 
                  break;
                  
              case BreathingPhase.Exhale:
                  if (prev.currentBreath < targetBreaths) {
                      // Continue loop
                      nextBreath = prev.currentBreath + 1;
                      nextPhase = BreathingPhase.Inhale;
                      nextDuration = activePattern.inhale;
                  } else {
                      // Finished breathing cycle -> Go to Retention
                      nextPhase = BreathingPhase.HoldOut; // Retention
                      // Progressive retention: Base + 30s per round (e.g. 30, 60, 90)
                      nextDuration = activePattern.holdOut + (prev.currentRound - 1) * 30;
                      if (audioEnabled) playAudioCue("Глубокий выдох и задержка", nextRound, activePattern.id);
                  }
                  break;
                  
              case BreathingPhase.HoldOut: // Retention finished
                  nextPhase = BreathingPhase.Inhale; // Recovery Inhale
                  nextDuration = 2.0; // Deep breath in time
                  if (audioEnabled) playAudioCue("Глубокий вдох", nextRound, activePattern.id);
                  break;
                  
              case BreathingPhase.HoldIn: // Recovery Hold (15s) finished
                   // Check if session done
                   if (rounds > 0 && prev.currentRound >= rounds) {
                       nextPhase = BreathingPhase.Done;
                       if (audioEnabled) playAudioCue("Session complete", nextRound, activePattern.id);
                   } else {
                       nextRound = prev.currentRound + 1;
                       nextBreath = 1;
                       nextPhase = BreathingPhase.Inhale;
                       nextDuration = activePattern.inhale;
                       if (audioEnabled) playAudioCue("Раунд " + nextRound, nextRound, activePattern.id);
                   }
                   break;
            
              default:
                   return prev;
          }
          
          // Fix for the Inhale ambiguity in switch:
          if (prev.currentPhase === BreathingPhase.Inhale) {
             if (prev.currentBreath > targetBreaths) {
                  nextPhase = BreathingPhase.HoldIn;
                  nextDuration = activePattern.holdIn; // 15s
                  if (audioEnabled) playAudioCue("Держим 15 секунд", nextRound, activePattern.id);
             }
          }
          
      } else {
          // --- STANDARD LOOP LOGIC ---
          switch (prev.currentPhase) {
            case BreathingPhase.Ready:
              nextPhase = BreathingPhase.Inhale;
              nextDuration = activePattern.inhale;
              if (audioEnabled) playAudioCue("Inhale", nextRound, activePattern.id);
              break;
            case BreathingPhase.Inhale:
              if (activePattern.holdIn > 0) {
                nextPhase = BreathingPhase.HoldIn;
                nextDuration = activePattern.holdIn;
                if (audioEnabled) playAudioCue("Hold", nextRound, activePattern.id);
              } else {
                nextPhase = BreathingPhase.Exhale;
                nextDuration = activePattern.exhale;
                if (audioEnabled) playAudioCue("Exhale", nextRound, activePattern.id);
              }
              break;
            case BreathingPhase.HoldIn:
              nextPhase = BreathingPhase.Exhale;
              nextDuration = activePattern.exhale;
              if (audioEnabled) playAudioCue("Exhale", nextRound, activePattern.id);
              break;
            case BreathingPhase.Exhale:
              if (activePattern.holdOut > 0) {
                nextPhase = BreathingPhase.HoldOut;
                nextDuration = activePattern.holdOut;
                if (audioEnabled) playAudioCue("Hold", nextRound, activePattern.id);
              } else {
                if (rounds > 0 && prev.currentRound >= rounds) {
                   nextPhase = BreathingPhase.Done;
                   if (audioEnabled) playAudioCue("Session complete", nextRound, activePattern.id);
                } else {
                   nextRound = prev.currentRound + 1;
                   nextPhase = BreathingPhase.Inhale;
                   nextDuration = activePattern.inhale;
                   if (audioEnabled) playAudioCue("Inhale", nextRound, activePattern.id);
                }
              }
              break;
            case BreathingPhase.HoldOut:
               if (rounds > 0 && prev.currentRound >= rounds) {
                 nextPhase = BreathingPhase.Done;
                 if (audioEnabled) playAudioCue("Session complete", nextRound, activePattern.id);
               } else {
                 nextRound = prev.currentRound + 1;
                 nextPhase = BreathingPhase.Inhale;
                 nextDuration = activePattern.inhale;
                 if (audioEnabled) playAudioCue("Inhale", nextRound, activePattern.id);
               }
               break;
            default:
              return prev;
          }
      }

      // Shared "Done" handling
      if (nextPhase === BreathingPhase.Done) {
         return { ...prev, currentPhase: nextPhase, isActive: false, secondsRemaining: 0 };
      }
      
      // Play chime if enabled (except Wim Hof rapid breathing)
      if (audioEnabled && activePattern.mode !== 'wim-hof') {
          playPhaseSound();
      }

      return { 
          ...prev, 
          currentPhase: nextPhase, 
          secondsRemaining: nextDuration, 
          currentRound: nextRound,
          currentBreath: nextBreath
      };
    });
  }, [activePattern, rounds, audioEnabled]);

  const tick = useCallback((time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = (time - previousTimeRef.current) / 1000;
      setTimerState(prev => {
        if (!prev.isActive || prev.isPaused || prev.currentPhase === BreathingPhase.Done) return prev;
        const newTimeLeft = prev.secondsRemaining - deltaTime;
        if (newTimeLeft <= 0) return { ...prev, secondsRemaining: newTimeLeft, totalSecondsElapsed: prev.totalSecondsElapsed + deltaTime };
        return { ...prev, secondsRemaining: newTimeLeft, totalSecondsElapsed: prev.totalSecondsElapsed + deltaTime };
      });
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(tick);
  }, []);

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
     if (timerState.isActive && !timerState.isPaused && timerState.secondsRemaining <= 0.05 && timerState.currentPhase !== BreathingPhase.Done) {
         advancePhase();
     }
  }, [timerState.secondsRemaining, timerState.isActive, timerState.isPaused, timerState.currentPhase, advancePhase]);

  const toggleTimer = () => {
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
        secondsRemaining: 3,
        totalSecondsElapsed: 0,
        currentRound: 1,
        currentBreath: 1,
        isActive: false,
        isPaused: false
    });
  };

  const handleDeepAnalysis = async () => {
    setAnalysisOpen(true);
    setAnalyzing(true);
    const text = await getBreathingAnalysis(activePattern.name, `${activePattern.inhale}-${activePattern.holdIn}-${activePattern.exhale}-${activePattern.holdOut}`);
    setAnalysisContent(text);
    setAnalyzing(false);
  };

  const selectPattern = (p: BreathingPattern) => {
      setActivePattern(p);
      setView('timer');
      // Set default rounds for Wim Hof to 3, else 0 (infinite)
      setRounds(p.mode === 'wim-hof' ? 3 : 0);
      resetTimer();
  };

  const categoryNames: Record<string, string> = {
      'Energy': 'Энергия',
      'Calm': 'Спокойствие',
      'Balance': 'Баланс',
      'Sleep': 'Сон',
      'Focus': 'Фокус',
      'Health': 'Здоровье',
      'Transcendence': 'Трансценденция'
  };

  const categoryIcons: Record<string, string> = {
      'Energy': 'bolt',
      'Calm': 'water',
      'Balance': 'scale-balanced',
      'Sleep': 'moon',
      'Focus': 'brain',
      'Health': 'heart-pulse',
      'Transcendence': 'om'
  };

  // Group patterns by category with Filtering
  const getFilteredPatterns = () => {
      let patterns = DEFAULT_PATTERNS;

      // 1. Filter by Search
      if (searchQuery) {
          const lowerQuery = searchQuery.toLowerCase();
          patterns = patterns.filter(p => 
              p.name.toLowerCase().includes(lowerQuery) || 
              p.description.toLowerCase().includes(lowerQuery) ||
              p.category.toLowerCase().includes(lowerQuery)
          );
      }

      // 2. Filter by Category Tab
      if (selectedCategory !== 'All') {
          patterns = patterns.filter(p => p.category === selectedCategory);
      }

      // 3. Group them
      return patterns.reduce((acc, pattern) => {
          if (!acc[pattern.category]) acc[pattern.category] = [];
          acc[pattern.category].push(pattern);
          return acc;
      }, {} as Record<string, BreathingPattern[]>);
  };

  const filteredGroupedPatterns = getFilteredPatterns();
  const allCategories = ['All', ...Object.keys(categoryNames)];

  // --- Render ---
  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-cyan-500/30 overflow-x-hidden relative text-white">
      
      {/* Entheogenic Background */}
      <div className="fixed inset-0 z-0 bg-[#050505]">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-black to-teal-900/20 animate-pulse-slow"></div>
          {/* Aurora effects */}
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-cyan-900/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px]"></div>
      </div>
      
      {/* Modals */}
      {showMobileFaq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-fade-in">
             <div className="bg-[#1c1c1e] p-8 rounded-3xl max-w-md border border-white/5 shadow-2xl relative z-50">
                <h3 className="text-2xl font-bold mb-4">Приложение или Сайт?</h3>
                <p className="mb-4 text-gray-400">Это PWA. Добавь на экран "Домой" и пользуйся как приложением.</p>
                <button onClick={() => setShowMobileFaq(false)} className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors">Понятно</button>
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
      
      {/* Philosophy Modal */}
      <AnalysisModal 
         isOpen={showPhilosophy} 
         onClose={() => setShowPhilosophy(false)} 
         title="Философия Практики" 
         content={PHILOSOPHY_CONTENT}
         isLoading={false}
      />

      {/* Navbar */}
      <nav className="w-full bg-black/30 backdrop-blur-md border-b border-white/5 sticky top-0 z-40 flex-shrink-0">
        <div className="w-full px-6 h-16 flex items-center justify-between max-w-[1920px] mx-auto">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('library')}>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                     <i className="fas fa-wind text-white text-sm"></i>
                </div>
                <h1 className="font-bold text-lg tracking-wide text-white">Prana<span className="text-cyan-400">Flow</span></h1>
            </div>
            <div className="flex gap-4 items-center">
                <button 
                    onClick={() => setShowPhilosophy(true)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                >
                    <i className="fas fa-book-open"></i>
                    <span className="hidden sm:inline">Философия</span>
                </button>
                
                <button 
                    onClick={toggleAudio}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${audioEnabled ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400' : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'}`}
                >
                    <i className={`fas fa-volume-${audioEnabled ? 'up' : 'mute'}`}></i>
                    <span className="hidden sm:inline">{audioEnabled ? 'ВКЛ' : 'ВЫКЛ'}</span>
                </button>
                <button onClick={() => setShowMobileFaq(true)} className="text-gray-500 hover:text-white transition-colors">
                    <i className="far fa-question-circle text-lg"></i>
                </button>
            </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="w-full max-w-[1920px] mx-auto flex-grow flex flex-col relative z-10">
        
        {view === 'library' && (
            <div className="animate-fade-in p-6 md:p-12 pb-24">
                <div className="max-w-6xl mx-auto">
                    <header className="mb-12 text-center">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-gray-400 tracking-tight">Библиотека Дыхания</h2>
                        
                        {/* SEARCH & FILTERS */}
                        <div className="max-w-xl mx-auto space-y-4">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <i className="fas fa-search text-gray-500 group-focus-within:text-cyan-400 transition-colors"></i>
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Поиск техник..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 text-white placeholder-gray-500 transition-all"
                                />
                            </div>

                            <div className="flex flex-wrap justify-center gap-2">
                                {allCategories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                                            selectedCategory === cat 
                                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' 
                                            : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        {cat === 'All' ? 'Все' : categoryNames[cat]}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </header>

                    <div className="space-y-16">
                        {Object.entries(filteredGroupedPatterns).map(([category, patterns]) => (
                            <div key={category} className="animate-fade-in-up">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5 text-cyan-400 text-lg">
                                        <i className={`fas fa-${categoryIcons[category] || 'wind'}`}></i>
                                    </div>
                                    <h3 className="text-2xl font-bold text-white tracking-wide">
                                        {categoryNames[category] || category}
                                    </h3>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {patterns.map((p) => (
                                        <div 
                                            key={p.id} 
                                            onClick={() => selectPattern(p)}
                                            className="group relative bg-[#1c1c1e]/60 backdrop-blur-md hover:bg-[#2c2c2e]/80 border border-white/5 hover:border-cyan-500/30 rounded-3xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-900/20"
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">{p.name}</h3>
                                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border border-white/5 ${
                                                    p.difficulty === 'Новичок' ? 'bg-emerald-500/10 text-emerald-400' :
                                                    p.difficulty === 'Средний' ? 'bg-yellow-500/10 text-yellow-400' :
                                                    'bg-rose-500/10 text-rose-400'
                                                }`}>
                                                    {p.difficulty}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-400 mb-6 h-10 line-clamp-2 leading-relaxed">{p.description}</p>
                                            
                                            {/* Benefits Tags */}
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {p.benefits && p.benefits.slice(0, 2).map((b, i) => (
                                                    <span key={i} className="text-[10px] text-gray-400 bg-black/30 px-2 py-1 rounded-full border border-white/5">
                                                        {b}
                                                    </span>
                                                ))}
                                                {p.benefits && p.benefits.length > 2 && (
                                                    <span className="text-[10px] text-gray-500 px-1 py-1">+ еще {p.benefits.length - 2}</span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2 text-xs font-mono text-gray-500 border-t border-white/5 pt-4">
                                                <i className="far fa-clock"></i>
                                                {p.mode === 'wim-hof' ? (
                                                    <span>Протокол: 3 Фазы</span>
                                                ) : (
                                                    <span>Паттерн: {p.inhale}-{p.holdIn}-{p.exhale}-{p.holdOut}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        
                        {Object.keys(filteredGroupedPatterns).length === 0 && (
                            <div className="text-center py-20 text-gray-500">
                                <i className="fas fa-search text-4xl mb-4 opacity-50"></i>
                                <p>Ничего не найдено по вашему запросу.</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-20 flex justify-center pb-12">
                         <button 
                            onClick={() => selectPattern(DEFAULT_PATTERNS.find(p => p.id === 'custom')!)}
                            className="flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group backdrop-blur-sm"
                        >
                            <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
                                <i className="fas fa-sliders-h"></i>
                            </span>
                            <span className="font-bold text-gray-300 group-hover:text-white">Конструктор практики</span>
                        </button>
                    </div>
                </div>
            </div>
        )}

        {view === 'timer' && (
            <div className="flex-grow flex flex-col lg:flex-row h-full animate-fade-in overflow-hidden">
                
                {/* LEFT SIDEBAR: Info & Guide */}
                <div className="lg:w-[350px] xl:w-[400px] flex-shrink-0 bg-[#0f0f10]/80 backdrop-blur-xl border-r border-white/5 flex flex-col h-full overflow-hidden relative z-20 shadow-2xl">
                    <div className="p-6 border-b border-white/5">
                        <button 
                            onClick={() => setView('library')}
                            className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider mb-6"
                        >
                            <i className="fas fa-arrow-left"></i> Меню
                        </button>
                        <h2 className="text-3xl font-bold text-white mb-2 leading-tight">{activePattern.name}</h2>
                        
                        {/* Tabs */}
                        <div className="flex p-1 bg-white/5 rounded-xl mt-6 border border-white/5">
                            <button 
                                onClick={() => setInfoTab('about')}
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${infoTab === 'about' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                Обзор
                            </button>
                            <button 
                                onClick={() => setInfoTab('guide')}
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${infoTab === 'guide' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                Техника
                            </button>
                            <button 
                                onClick={() => setInfoTab('safety')}
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${infoTab === 'safety' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/20' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <i className="fas fa-shield-alt mr-1"></i> Безопасность
                            </button>
                        </div>
                    </div>

                    <div className="flex-grow overflow-y-auto custom-scrollbar p-6">
                         {infoTab === 'about' && (
                             <div className="space-y-8 animate-fade-in">
                                 <div>
                                     <h4 className="text-xs font-bold text-cyan-500 uppercase tracking-widest mb-3">Суть практики</h4>
                                     <p className="text-gray-300 leading-relaxed text-lg">{activePattern.description}</p>
                                 </div>
                                 
                                 <div>
                                     <h4 className="text-xs font-bold text-purple-500 uppercase tracking-widest mb-3">Ключевые эффекты</h4>
                                     <ul className="space-y-3">
                                         {activePattern.benefits && activePattern.benefits.map((benefit, i) => (
                                             <li key={i} className="flex items-start gap-3 text-gray-300">
                                                 <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0"></span>
                                                 <span>{benefit}</span>
                                             </li>
                                         ))}
                                     </ul>
                                 </div>

                                 <div className="grid grid-cols-2 gap-3 mt-4">
                                     <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                         <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Категория</div>
                                         <div className="text-white font-semibold">{activePattern.category}</div>
                                     </div>
                                     <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                         <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Сложность</div>
                                         <div className="text-white font-semibold">{activePattern.difficulty}</div>
                                     </div>
                                 </div>

                                 <button 
                                    onClick={handleDeepAnalysis}
                                    disabled={isAnalyzing}
                                    className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-4 bg-gradient-to-r from-cyan-900/40 to-purple-900/40 border border-cyan-500/30 text-cyan-200 rounded-xl text-sm font-bold hover:from-cyan-900/60 hover:to-purple-900/60 transition-all shadow-lg hover:shadow-cyan-500/20"
                                 >
                                    <i className="fas fa-sparkles"></i>
                                    {isAnalyzing ? 'Анализирую...' : 'AI Анализ (Подробнее)'}
                                 </button>
                             </div>
                         )}

                         {infoTab === 'guide' && (
                             // Improved Technique Rendering
                             <div className="animate-fade-in">
                                 <ReactMarkdown
                                    components={{
                                        p: ({node, ...props}) => <p className="mb-4 text-gray-300 leading-relaxed" {...props} />,
                                        strong: ({node, ...props}) => <span className="text-cyan-400 font-bold block mb-1 uppercase text-xs tracking-wider" {...props} />,
                                        ol: ({node, ...props}) => <ol className="space-y-4 mb-6 list-decimal pl-4 text-gray-300" {...props} />,
                                        ul: ({node, ...props}) => <ul className="space-y-2 list-disc pl-5 mb-4 text-gray-300 marker:text-cyan-500" {...props} />,
                                        li: ({node, ...props}) => (
                                            <li className="pl-1 mb-1" {...props} />
                                        ),
                                        h3: ({node, ...props}) => <h3 className="text-lg font-bold text-white mt-8 mb-4 border-b border-white/10 pb-2" {...props} />
                                    }}
                                 >
                                    {activePattern.instruction}
                                 </ReactMarkdown>

                                 {/* Music Link Section */}
                                 {activePattern.audioUrl && (
                                     <div className="mt-8 p-4 bg-gradient-to-r from-purple-900/40 to-cyan-900/40 border border-white/10 rounded-xl">
                                         <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                                             <i className="fas fa-music text-purple-400"></i> Музыкальное сопровождение
                                         </h4>
                                         <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                                             Для этой практики музыка критически важна. Скачайте подготовленный сет или включите его онлайн.
                                         </p>
                                         <a 
                                            href={activePattern.audioUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="block w-full text-center py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors shadow-lg"
                                         >
                                             Скачать / Слушать сет
                                         </a>
                                     </div>
                                 )}
                             </div>
                         )}

                         {infoTab === 'safety' && (
                             <div className="space-y-8 animate-fade-in">
                                 {/* Critical Warning Block */}
                                 {activePattern.safetyWarning && (
                                     <div className="bg-rose-900/20 border border-rose-500/30 p-4 rounded-xl">
                                         <div className="flex items-center gap-2 mb-2 text-rose-400 font-bold uppercase text-xs tracking-widest">
                                             <i className="fas fa-exclamation-triangle"></i> Внимание
                                         </div>
                                         <p className="text-rose-100 leading-relaxed font-medium">
                                             {activePattern.safetyWarning}
                                         </p>
                                     </div>
                                 )}

                                 {/* Contraindications */}
                                 <div>
                                     <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Противопоказания</h4>
                                     {activePattern.contraindications && activePattern.contraindications.length > 0 ? (
                                         <ul className="space-y-3">
                                             {activePattern.contraindications.map((item, i) => (
                                                 <li key={i} className="flex items-start gap-3 text-gray-300 bg-white/5 p-3 rounded-lg border border-white/5">
                                                     <i className="fas fa-times-circle text-rose-500 mt-1"></i>
                                                     <span>{item}</span>
                                                 </li>
                                             ))}
                                         </ul>
                                     ) : (
                                         <p className="text-gray-500 italic">Специфических противопоказаний нет, но слушайте свое тело.</p>
                                     )}
                                 </div>

                                 {/* Conditions (When/Where) */}
                                 <div>
                                     <h4 className="text-xs font-bold text-cyan-500 uppercase tracking-widest mb-3">Условия выполнения</h4>
                                     {activePattern.conditions && activePattern.conditions.length > 0 ? (
                                         <ul className="space-y-3">
                                             {activePattern.conditions.map((item, i) => (
                                                 <li key={i} className="flex items-start gap-3 text-gray-300">
                                                     {item.includes('❌') ? (
                                                         <span className="mt-1 flex-shrink-0 text-rose-500">❌</span>
                                                     ) : item.includes('✅') ? (
                                                          <span className="mt-1 flex-shrink-0 text-emerald-500">✅</span>
                                                     ) : item.includes('🥣') ? (
                                                          <span className="mt-1 flex-shrink-0 text-amber-500">🥣</span>
                                                     ) : item.includes('👥') ? (
                                                          <span className="mt-1 flex-shrink-0 text-purple-500">👥</span>
                                                     ) : (
                                                          <span className="mt-1 flex-shrink-0 text-cyan-500">•</span>
                                                     )}
                                                     <span>{item.replace(/^[❌✅🥣👥]\s*/, '')}</span>
                                                 </li>
                                             ))}
                                         </ul>
                                     ) : (
                                         <p className="text-gray-500 italic">Нет особых ограничений по месту и времени.</p>
                                     )}
                                 </div>

                                 <div className="p-4 bg-yellow-900/10 border border-yellow-500/20 rounded-xl text-xs text-yellow-200/70 mt-4 leading-relaxed">
                                     <i className="fas fa-info-circle mr-2"></i>
                                     Информация носит ознакомительный характер. Если у вас есть серьезные заболевания, проконсультируйтесь с врачом перед началом практик.
                                 </div>
                             </div>
                         )}
                    </div>
                </div>

                {/* RIGHT MAIN AREA: Visual & Controls */}
                <div className="flex-grow flex flex-col items-center justify-center relative bg-transparent">
                    
                    {/* Ghost Gradient for Timer focus */}
                    <div 
                        className={`absolute inset-0 transition-opacity duration-1000 ${timerState.isActive ? 'opacity-30' : 'opacity-0'}`}
                        style={{
                            background: 'radial-gradient(circle at center, rgba(100, 210, 255, 0.1) 0%, rgba(0,0,0,0) 60%)'
                        }}
                    ></div>

                    <div className="relative z-10 w-full max-w-4xl px-6 flex flex-col items-center">
                        
                        {/* Visual Timer */}
                        <div className="mb-12 scale-100 md:scale-110 transition-transform">
                            <TimerVisual 
                                phase={timerState.currentPhase} 
                                timeLeft={timerState.secondsRemaining}
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
                                mode={activePattern.mode}
                            />
                        </div>

                        {/* Play/Pause Main Actions */}
                        <div className="flex items-center gap-8 mb-12">
                            <button 
                                onClick={resetTimer}
                                className="w-14 h-14 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-all backdrop-blur-md"
                            >
                                <i className="fas fa-redo"></i>
                            </button>

                            <button 
                                onClick={toggleTimer}
                                className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl transition-all active:scale-95 ${
                                    timerState.isActive && !timerState.isPaused
                                    ? 'bg-[#1c1c1e] text-rose-500 border border-rose-500/20 shadow-[0_0_50px_rgba(244,63,94,0.3)] hover:shadow-rose-500/40'
                                    : 'bg-white text-black hover:bg-gray-100 shadow-[0_0_50px_rgba(255,255,255,0.15)]'
                                }`}
                            >
                                <i className={`fas fa-${timerState.isActive && !timerState.isPaused ? 'pause' : 'play ml-1'}`}></i>
                            </button>

                            <div className="w-14 h-14 flex flex-col items-center justify-center">
                                <span className="text-2xl font-mono font-bold text-white">{timerState.currentRound}</span>
                                <span className="text-[10px] text-gray-500 uppercase tracking-wider">Раунд</span>
                            </div>
                        </div>

                        {/* Controls Container - Only visible when paused/inactive */}
                        <div className={`w-full transition-all duration-500 ${timerState.isActive && !timerState.isPaused ? 'opacity-30 blur-sm pointer-events-none grayscale' : 'opacity-100'}`}>
                             <Controls 
                                pattern={activePattern} 
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

      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-gray-500 text-xs relative z-10 border-t border-white/5 bg-black/20 backdrop-blur-md flex-shrink-0">
        <div className="flex flex-col items-center gap-2">
            <p>
                Создано с ❤️ — <a href="https://t.me/nikolaiovchinnikov" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 transition-colors font-bold">Николай Овчинников</a>
            </p>
            <a href="https://t.me/nikolaiovchinnikov" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                <i className="fab fa-telegram"></i>
                <span>Предложения и обратная связь</span>
            </a>
        </div>
      </footer>
    </div>
  );
};

export default App;