
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { 
  Music, Menu, X, Share2, Download, BookOpen, Library,
  Sparkles, Waves, Brain, PlayCircle, PauseCircle, Infinity as InfinityIcon, Clock,
  Volume2, CloudRain, Bell, Drum, CircleDot, Wind, Sliders, Radio, Gem, CircleHelp
} from 'lucide-react';
import { PHILOSOPHY_CONTENT, CATEGORY_ICONS } from '../../constants';
import EntheoLogo from '../EntheoLogo';
import { useAudioEngine, SolfeggioFreq, PlaybackMode, NoiseColor } from '../../context/AudioContext';
import { SoundMode } from '../../hooks/useAudioSystem';
import YinYangToggle from '../YinYangToggle';
import ChangelogSystem from '../ChangelogSystem';
import { CURRENT_VERSION } from '../../data/changelog'; // Import version

const MotionHeader = motion.header as any;
const MotionDiv = motion.div as any;

interface HeaderProps {
    view: 'timer' | 'library';
    setView: (v: 'timer' | 'library') => void;
    theme: 'dark' | 'light';
    toggleTheme: () => void;
    deferredPrompt: any;
    handleInstallClick: () => void;
    handleShare: () => void;
    setShowMobileFaq: (v: boolean) => void;
    soundMode: SoundMode;
    changeSoundMode: (m: SoundMode) => void;
}

// REMOVED 'Library' as per request. Only Philosophy remains.
const NAV_ITEMS = [
  { id: 'philosophy', label: 'Философия', icon: BookOpen },
] as const;

const SOLFEGGIO_LIST: { freq: SolfeggioFreq; label: string; desc: string }[] = [
    { freq: 396, label: '396 Гц', desc: 'Освобождение от вины и страха' },
    { freq: 417, label: '417 Гц', desc: 'Нейтрализация и перемены' },
    { freq: 432, label: '432 Гц', desc: 'Гармония Вселенной' },
    { freq: 528, label: '528 Гц', desc: 'Трансформация ДНК' },
    { freq: 639, label: '639 Гц', desc: 'Связь и отношения' },
    { freq: 741, label: '741 Гц', desc: 'Пробуждение интуиции' },
    { freq: 852, label: '852 Гц', desc: 'Духовный порядок' },
];

const TIMER_SOUNDS: { id: SoundMode; label: string; icon: any }[] = [
    { id: 'mute', label: 'Тишина', icon: Volume2 },
    { id: 'bell', label: 'Колокольчик', icon: Bell },
    { id: 'hang', label: 'Ханг (Hang)', icon: Drum },
    { id: 'bowl', label: 'Поющая Чаша', icon: CircleDot },
    { id: 'om', label: 'ОМ (Вибрация)', icon: Sparkles },
    { id: 'rain', label: 'Дождь (Стик)', icon: CloudRain },
];

export const Header: React.FC<HeaderProps> = ({
    view,
    setView,
    theme,
    toggleTheme,
    deferredPrompt,
    handleInstallClick,
    handleShare,
    setShowMobileFaq,
    soundMode,
    changeSoundMode
}) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSoundMenuOpen, setIsSoundMenuOpen] = useState(false);
    const [isPhilosophyOpen, setIsPhilosophyOpen] = useState(false);
    const [isChangelogOpen, setIsChangelogOpen] = useState(false); 
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);
    
    const { 
        activeBinaural, toggleBinaural, 
        activeSolfeggio, setSolfeggio,
        activeCrystalMode, toggleCrystalMode,
        playbackMode, setPlaybackMode,
        activeAmbience, toggleAmbience, windIntensity, setWindIntensity,
        activeNoise, toggleNoise, noiseColor, setNoiseColor
    } = useAudioEngine();

    const handleNavClick = (id: string) => {
        if (id === 'philosophy') {
            setIsPhilosophyOpen(true);
        } else if (id === 'library') {
            setView('library');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const isAudioActive = activeBinaural !== 'none' || activeSolfeggio !== 0 || activeAmbience || activeNoise || activeCrystalMode;

    return (
        <>
        <ChangelogSystem isOpenManual={isChangelogOpen} onCloseManual={() => setIsChangelogOpen(false)} />

        <MotionHeader
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-4 md:top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none"
        >
            <div 
                className={`
                    relative pointer-events-auto
                    w-full max-w-5xl
                    flex items-center justify-between
                    bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl
                    border border-zinc-200/50 dark:border-white/10 rounded-full 
                    shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]
                    px-4 py-2 md:px-6 md:py-3
                    transition-all duration-500 ease-out
                `}
            >
                {/* 1. LOGO */}
                <div 
                    onClick={() => handleNavClick('library')}
                    className="flex items-center gap-2 md:gap-3 pl-1 cursor-pointer group shrink-0"
                >
                    <div className="relative flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-tr from-cyan-500/10 to-purple-500/10 border border-zinc-200 dark:border-white/5 group-hover:border-cyan-500/30 transition-colors shadow-inner">
                         <EntheoLogo className="w-6 h-6 md:w-7 md:h-7" />
                    </div>
                    <span className="font-display font-bold text-zinc-900 dark:text-white tracking-wide text-sm md:text-base transition-colors duration-500">
                        Entheo<span className="text-zinc-400 dark:text-zinc-500">Breath</span>
                    </span>
                </div>

                {/* 2. NAVIGATION (CENTER) */}
                <nav className="hidden md:flex items-center absolute left-1/2 -translate-x-1/2 bg-zinc-100 dark:bg-white/5 rounded-full p-1 border border-zinc-200 dark:border-white/5 transition-colors duration-500">
                    {NAV_ITEMS.map((item) => {
                        const isActive = isPhilosophyOpen && item.id === 'philosophy';
                        
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleNavClick(item.id)}
                                className={`
                                    relative px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300
                                    flex items-center gap-2
                                    ${isActive ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}
                                `}
                            >
                                {isActive && (
                                    <MotionDiv
                                        layoutId="navPill"
                                        className="absolute inset-0 bg-white dark:bg-white/10 rounded-full shadow-sm border border-black/5 dark:border-white/5"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-2">
                                    <item.icon size={14} className={isActive ? "text-cyan-600 dark:text-cyan-400" : ""} />
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </nav>

                {/* 3. ACTIONS (RIGHT) */}
                <div className="flex items-center gap-1 md:gap-2 pr-1 shrink-0">
                    
                    {/* VERSION PILL */}
                    <button 
                        onClick={() => setIsChangelogOpen(!isChangelogOpen)}
                        className="px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/10 transition-all uppercase tracking-wider"
                    >
                        v{CURRENT_VERSION.split('.')[0]}.{CURRENT_VERSION.split('.')[1]}
                    </button>

                    {/* Sound Toggle */}
                    <div className="relative">
                        <button 
                            onClick={() => setIsSoundMenuOpen(!isSoundMenuOpen)}
                            className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all ${
                                isAudioActive
                                ? 'text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-500/10 hover:bg-cyan-200 dark:hover:bg-cyan-500/20 shadow-glow-cyan' 
                                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                            }`}
                        >
                            <Music size={18} className={isAudioActive ? 'animate-pulse' : ''} />
                        </button>

                        <AnimatePresence>
                            {isSoundMenuOpen && (
                                <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsSoundMenuOpen(false)}></div>
                                <MotionDiv
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                    className="absolute right-0 top-full mt-3 w-80 bg-white dark:bg-[#1c1c1e] border border-zinc-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-20 backdrop-blur-xl max-h-[85vh] flex flex-col"
                                >
                                    {/* Playback Mode Selector */}
                                    <div className="p-3 bg-zinc-50 dark:bg-black/40 border-b border-zinc-200 dark:border-white/5 flex gap-2">
                                        <button 
                                            onClick={() => setPlaybackMode('always')}
                                            className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all ${playbackMode === 'always' ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/30' : 'bg-white dark:bg-white/5 text-zinc-500 border border-transparent'}`}
                                        >
                                            <InfinityIcon size={12} /> Всегда
                                        </button>
                                        <button 
                                            onClick={() => setPlaybackMode('practice_only')}
                                            className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all ${playbackMode === 'practice_only' ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30' : 'bg-white dark:bg-white/5 text-zinc-500 border border-transparent'}`}
                                        >
                                            <Clock size={12} /> В таймере
                                        </button>
                                    </div>

                                    <div className="overflow-y-auto custom-scrollbar">
                                        {/* (SOUND MENU CONTENT REMAINED SAME) */}
                                        <div className="bg-zinc-50/50 dark:bg-black/20 border-b border-zinc-100 dark:border-white/5 pb-2">
                                            <div className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-600/70 dark:text-cyan-500/70">
                                                Атмосфера
                                            </div>
                                            <button onClick={(e) => { e.stopPropagation(); toggleCrystalMode(); }} className={`w-full text-left px-5 py-3.5 text-sm font-bold flex items-center justify-between transition-colors group relative ${activeCrystalMode ? 'bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-300' : 'hover:bg-black/5 dark:hover:bg-white/5 text-zinc-600 dark:text-gray-500 hover:text-black dark:hover:text-white'}`}>
                                                {activeCrystalMode && <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500 shadow-[0_0_10px_purple]"></div>}
                                                <div className="flex items-center gap-4"><div className="w-6 text-center"><Gem size={18} className={activeCrystalMode ? 'animate-pulse' : ''} /></div><div className="flex flex-col"><span className="font-medium bg-gradient-to-r from-purple-500 to-cyan-500 dark:from-purple-300 dark:to-cyan-300 bg-clip-text text-transparent">Хрустальная Сессия</span><span className="text-[10px] text-zinc-400 dark:text-gray-400 font-normal">Генеративные чаши (Live)</span></div></div>
                                                <div className="opacity-50 group-hover:opacity-100">{activeCrystalMode ? <PauseCircle size={16} /> : <PlayCircle size={16} />}</div>
                                            </button>
                                            <div className="relative">
                                                <button onClick={(e) => { e.stopPropagation(); toggleAmbience(); }} className={`w-full text-left px-5 py-3.5 text-sm font-bold flex items-center justify-between transition-colors group relative ${activeAmbience ? 'bg-cyan-50 dark:bg-zen-accent/10 text-cyan-700 dark:text-zen-accent' : 'hover:bg-black/5 dark:hover:bg-white/5 text-zinc-600 dark:text-gray-400 hover:text-black dark:hover:text-white'}`}>
                                                    {activeAmbience && <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_10px_#22d3ee]"></div>}
                                                    <div className="flex items-center gap-4"><div className="w-6 text-center"><Wind size={18} className={activeAmbience ? 'animate-pulse' : ''} /></div><div className="flex flex-col"><span className="font-medium">Ветер (Природа)</span><span className="text-[10px] opacity-60 font-normal">Генеративный поток</span></div></div>
                                                    <div className="opacity-50 group-hover:opacity-100">{activeAmbience ? <PauseCircle size={16} /> : <PlayCircle size={16} />}</div>
                                                </button>
                                                {activeAmbience && (<div className="px-5 pb-3 pt-0 bg-cyan-50 dark:bg-zen-accent/10 animate-fade-in"><div className="flex items-center gap-3"><Sliders size={12} className="text-cyan-600/50" /><input type="range" min="0" max="1" step="0.05" value={windIntensity} onChange={(e) => setWindIntensity(parseFloat(e.target.value))} className="w-full h-1 bg-cyan-200 dark:bg-cyan-900 rounded-lg appearance-none cursor-pointer accent-cyan-500" /></div></div>)}
                                            </div>
                                            <div className="relative">
                                                <button onClick={(e) => { e.stopPropagation(); toggleNoise(); }} className={`w-full text-left px-5 py-3.5 text-sm font-bold flex items-center justify-between transition-colors group relative ${activeNoise ? 'bg-stone-100 dark:bg-white/10 text-stone-700 dark:text-white' : 'hover:bg-black/5 dark:hover:bg-white/5 text-zinc-600 dark:text-gray-400 hover:text-black dark:hover:text-white'}`}>
                                                    {activeNoise && <div className="absolute left-0 top-0 bottom-0 w-1 bg-stone-400 dark:bg-white shadow-[0_0_10px_white]"></div>}
                                                    <div className="flex items-center gap-4"><div className="w-6 text-center"><Radio size={18} className={activeNoise ? 'animate-pulse' : ''} /></div><div className="flex flex-col"><span className="font-medium">Шум (Фокус)</span><span className="text-[10px] opacity-60 font-normal">Спектральный шум</span></div></div>
                                                    <div className="opacity-50 group-hover:opacity-100">{activeNoise ? <PauseCircle size={16} /> : <PlayCircle size={16} />}</div>
                                                </button>
                                                {activeNoise && (<div className="px-5 pb-3 pt-1 bg-stone-100 dark:bg-white/10 animate-fade-in flex gap-2">{(['brown', 'pink', 'white'] as NoiseColor[]).map((c) => (<button key={c} onClick={() => setNoiseColor(c)} className={`flex-1 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider border transition-all ${noiseColor === c ? 'bg-stone-300 dark:bg-white text-black border-stone-400 dark:border-white' : 'bg-transparent text-gray-400 border-gray-300 dark:border-gray-600 hover:border-gray-400'}`}>{c === 'brown' ? 'Глуб' : c === 'pink' ? 'Баланс' : 'Высок'}</button>))}</div>)}
                                            </div>
                                            <button onClick={(e) => { e.stopPropagation(); toggleBinaural('theta'); }} className={`w-full text-left px-5 py-3.5 text-sm font-bold flex items-center justify-between transition-colors group relative ${activeBinaural === 'theta' ? 'bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400' : 'hover:bg-black/5 dark:hover:bg-white/5 text-zinc-600 dark:text-gray-500 hover:text-black dark:hover:text-white'}`}>
                                                {activeBinaural === 'theta' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500 shadow-[0_0_10px_purple]"></div>}
                                                <div className="flex items-center gap-4"><div className="w-6 text-center"><Waves size={18} /></div><div className="flex flex-col"><span>Theta (4Hz)</span><span className="text-[10px] opacity-50 font-normal">Глубокая медитация</span></div></div>
                                                <div className="opacity-50 group-hover:opacity-100">{activeBinaural === 'theta' ? <PauseCircle size={16}/> : <PlayCircle size={16}/>}</div>
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); toggleBinaural('alpha'); }} className={`w-full text-left px-5 py-3.5 text-sm font-bold flex items-center justify-between transition-colors group relative ${activeBinaural === 'alpha' ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'hover:bg-black/5 dark:hover:bg-white/5 text-zinc-600 dark:text-gray-500 hover:text-black dark:hover:text-white'}`}>
                                                {activeBinaural === 'alpha' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 shadow-[0_0_10px_blue]"></div>}
                                                <div className="flex items-center gap-4"><div className="w-6 text-center"><Brain size={18} /></div><div className="flex flex-col"><span>Alpha (10Hz)</span><span className="text-[10px] opacity-50 font-normal">Релакс и фокус</span></div></div>
                                                <div className="opacity-50 group-hover:opacity-100">{activeBinaural === 'alpha' ? <PauseCircle size={16}/> : <PlayCircle size={16}/>}</div>
                                            </button>
                                        </div>
                                        <div className="pb-2 border-b border-zinc-100 dark:border-white/5">
                                            <div className="px-5 py-3 mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600/70 dark:text-amber-500/70">Сольфеджио (Тон)</div>
                                            {SOLFEGGIO_LIST.map((item) => (<button key={item.freq} onClick={() => setSolfeggio(item.freq)} className={`w-full text-left px-5 py-3 text-xs flex items-center justify-between transition-colors group ${activeSolfeggio === item.freq ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'text-zinc-500 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'}`}><div className="flex flex-col"><span className="font-bold text-sm tracking-wide">{item.label}</span><span className="text-[10px] opacity-60">{item.desc}</span></div><div className={`transition-opacity ${activeSolfeggio === item.freq ? 'opacity-100' : 'opacity-30 group-hover:opacity-100'}`}>{activeSolfeggio === item.freq ? <PauseCircle size={16} /> : <PlayCircle size={16} />}</div></button>))}
                                        </div>
                                        <div className="pb-4">
                                            <div className="px-5 py-3 mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600/70 dark:text-emerald-500/70">Звук Таймера (Тик)</div>
                                            {TIMER_SOUNDS.map((snd) => (<button key={snd.id} onClick={() => changeSoundMode(snd.id)} className={`w-full text-left px-5 py-3 text-xs flex items-center gap-3 transition-colors ${soundMode === snd.id ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'text-zinc-500 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'}`}><div className="w-4 flex justify-center"><snd.icon size={14} /></div><span className="font-bold tracking-wide">{snd.label}</span>{soundMode === snd.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_8px_#34d399]" />}</button>))}
                                        </div>
                                    </div>
                                </MotionDiv>
                                </>
                            )}
                        </AnimatePresence>
                    </div>

                    <YinYangToggle theme={theme} toggleTheme={toggleTheme} className="ml-1" />

                    <button 
                        onClick={handleShare}
                        className="hidden md:flex w-9 h-9 md:w-10 md:h-10 rounded-full items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                    >
                        <Share2 size={18} />
                    </button>

                    <button 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden w-9 h-9 rounded-full flex items-center justify-center text-zinc-500 dark:text-zinc-300 bg-black/5 dark:bg-white/5 border border-zinc-200 dark:border-white/10 ml-2"
                    >
                        {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>

                    {isMobileMenuOpen && (
                        <div className="absolute top-full right-0 mt-4 w-64 bg-white/95 dark:bg-[#121212]/95 backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl p-4 z-50 animate-fade-in origin-top-right md:hidden">
                            {/* ... Mobile Menu Content ... */}
                            <div className="flex flex-col gap-2">
                                <button onClick={() => { setIsPhilosophyOpen(true); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold bg-gray-50 dark:bg-white/5 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"><BookOpen size={18} className="text-purple-600 dark:text-premium-purple" /><span className="tracking-wide">Философия</span></button>
                                <button onClick={() => { handleShare(); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold bg-gray-50 dark:bg-white/5 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"><Share2 size={18} className="text-zen-accent" /><span className="tracking-wide">Поделиться</span></button>
                                <button onClick={() => { setShowMobileFaq(true); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold bg-gray-50 dark:bg-white/5 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"><CircleHelp size={18} className="text-gray-400" /><span className="tracking-wide">Помощь</span></button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MotionHeader>

        {/* --- PHILOSOPHY MODAL: PORTAL (FIXED POSITIONING) --- */}
        {mounted && createPortal(
            <AnimatePresence>
                {isPhilosophyOpen && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden">
                        
                        {/* BACKDROP */}
                        <MotionDiv 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-3xl transition-all duration-500" 
                            onClick={() => setIsPhilosophyOpen(false)} 
                        />
                        
                        {/* CARD */}
                        <MotionDiv 
                            initial={{ scale: 0.9, opacity: 0, y: 40 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 40 }}
                            transition={{ type: "spring", stiffness: 350, damping: 28 }}
                            className="
                                relative w-full max-w-3xl 
                                bg-[#0f0f10]/80 backdrop-blur-2xl 
                                rounded-[36px] overflow-hidden flex flex-col 
                                max-h-[85vh] md:max-h-[800px]
                                border border-white/10 
                                shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)]
                                ring-1 ring-white/5
                            "
                        >
                            {/* HEADER */}
                            <div className="flex items-center justify-between px-6 py-6 md:px-8 shrink-0 bg-gradient-to-b from-white/5 to-transparent border-b border-white/5 relative z-10">
                                <div className="flex flex-col">
                                    <h2 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight drop-shadow-md flex items-center gap-3">
                                        <BookOpen size={24} className="text-purple-400" />
                                        Философия Практики
                                    </h2>
                                    <p className="text-white/40 text-xs md:text-sm mt-1 font-medium tracking-wide pl-9">
                                        Энтеогенный подход к сознанию
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setIsPhilosophyOpen(false)}
                                    className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-white/70 hover:text-white transition-all hover:rotate-90 active:scale-90"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* CONTENT */}
                            <div className="overflow-y-auto custom-scrollbar flex-1 p-6 md:p-10 bg-gradient-to-b from-transparent to-black/40 relative z-0">
                                <ReactMarkdown
                                    components={{
                                        h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4" {...props} />,
                                        h3: ({node, ...props}) => <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mt-8 mb-4 uppercase tracking-wide" {...props} />,
                                        p: ({node, ...props}) => <p className="mb-5 text-gray-300 leading-relaxed font-light text-base md:text-lg" {...props} />,
                                        ul: ({node, ...props}) => <ul className="space-y-3 mb-8 pl-2" {...props} />,
                                        li: ({node, ...props}) => (
                                            <li className="flex items-start gap-3 text-gray-300 text-base md:text-lg">
                                                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)] shrink-0"></span>
                                                <span className="leading-relaxed">{props.children}</span>
                                            </li>
                                        ),
                                        strong: ({node, ...props}) => <strong className="text-white font-bold" {...props} />,
                                        a: ({node, ...props}) => <a className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 transition-colors" {...props} />
                                    }}
                                >
                                    {PHILOSOPHY_CONTENT}
                                </ReactMarkdown>
                            </div>
                        </MotionDiv>
                    </div>
                )}
            </AnimatePresence>,
            document.body
        )}
        </>
    );
};
