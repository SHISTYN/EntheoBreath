import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { 
  Music, 
  Menu, 
  X, 
  Moon, 
  Sun, 
  Share2, 
  Download,
  BookOpen,
  Library,
  Sparkles
} from 'lucide-react';
import { SoundMode } from '../../hooks/useAudioSystem';
import { PHILOSOPHY_CONTENT } from '../../constants';
import EntheoLogo from '../EntheoLogo';

interface HeaderProps {
    view: 'timer' | 'library';
    setView: (v: 'timer' | 'library') => void;
    theme: 'dark' | 'light';
    toggleTheme: () => void;
    deferredPrompt: any;
    handleInstallClick: () => void;
    soundMode: SoundMode;
    changeSoundMode: (m: SoundMode) => void;
    handleShare: () => void;
    setShowMobileFaq: (v: boolean) => void;
}

const NAV_ITEMS = [
  { id: 'library', label: 'Библиотека', icon: Library },
  { id: 'philosophy', label: 'Философия', icon: BookOpen },
] as const;

export const Header: React.FC<HeaderProps> = ({
    view,
    setView,
    theme,
    toggleTheme,
    deferredPrompt,
    handleInstallClick,
    soundMode,
    changeSoundMode,
    handleShare,
    setShowMobileFaq
}) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSoundMenuOpen, setIsSoundMenuOpen] = useState(false);
    const [isPhilosophyOpen, setIsPhilosophyOpen] = useState(false);

    // Scroll Effect
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleNavClick = (id: string) => {
        if (id === 'philosophy') {
            setIsPhilosophyOpen(true);
        } else if (id === 'library') {
            setView('library');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const soundOptions: { id: SoundMode; label: string }[] = [
        { id: 'mute', label: 'Без звука' },
        { id: 'bell', label: 'Колокольчик' },
        { id: 'hang', label: 'Ханг' },
        { id: 'bowl', label: 'Чаша' },
        { id: 'om', label: 'Ом' },
        { id: 'rain', label: 'Дождь' },
    ];

    return (
        <>
        {/* --- FLOATING GLASS CAPSULE --- */}
        <motion.header
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
                    bg-zinc-900/60 backdrop-blur-lg
                    border border-white/10 rounded-full 
                    shadow-2xl
                    px-4 py-2 md:px-6 md:py-3
                    transition-all duration-300 ease-out
                    ${isScrolled ? 'bg-zinc-900/80 shadow-[0_8px_32px_rgba(0,0,0,0.5)] border-white/5' : ''}
                `}
            >
                {/* 1. LOGO AREA */}
                <div 
                    onClick={() => handleNavClick('library')}
                    className="flex items-center gap-2 md:gap-3 pl-1 cursor-pointer group shrink-0"
                >
                    <div className="relative flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-tr from-cyan-500/10 to-purple-500/10 border border-white/5 group-hover:border-cyan-500/30 transition-colors shadow-inner">
                         <EntheoLogo className="w-6 h-6 md:w-7 md:h-7" />
                    </div>
                    <span className="font-display font-bold text-white tracking-wide text-sm md:text-base">
                        Entheo<span className="text-zinc-500">Breath</span>
                    </span>
                </div>

                {/* 2. NAVIGATION (CENTER) */}
                <nav className="hidden md:flex items-center absolute left-1/2 -translate-x-1/2 bg-white/5 rounded-full p-1 border border-white/5">
                    {NAV_ITEMS.map((item) => {
                        const isActive = (view === item.id) && !isPhilosophyOpen && (item.id !== 'philosophy');
                        
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleNavClick(item.id)}
                                className={`
                                    relative px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300
                                    flex items-center gap-2
                                    ${isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}
                                `}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="navPill"
                                        className="absolute inset-0 bg-white/10 rounded-full shadow-sm border border-white/5"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-2">
                                    <item.icon size={14} className={isActive ? "text-cyan-400" : ""} />
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </nav>

                {/* 3. ACTIONS (RIGHT) */}
                <div className="flex items-center gap-1.5 md:gap-2 pr-1 shrink-0">
                    
                    {/* Sound Toggle */}
                    <div className="relative">
                        <button 
                            onClick={() => setIsSoundMenuOpen(!isSoundMenuOpen)}
                            className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all ${
                                soundMode !== 'mute' 
                                ? 'text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 shadow-glow-cyan' 
                                : 'text-zinc-500 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <Music size={18} />
                        </button>

                        <AnimatePresence>
                            {isSoundMenuOpen && (
                                <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsSoundMenuOpen(false)}></div>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                    className="absolute right-0 top-full mt-3 w-40 bg-[#1c1c1e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-20 backdrop-blur-xl"
                                >
                                    {soundOptions.map((opt) => (
                                        <button
                                            key={opt.id}
                                            onClick={() => { changeSoundMode(opt.id); setIsSoundMenuOpen(false); }}
                                            className={`w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-wide flex items-center gap-2 hover:bg-white/5 transition-colors ${soundMode === opt.id ? 'text-cyan-400' : 'text-zinc-400'}`}
                                        >
                                            {soundMode === opt.id && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_cyan]" />}
                                            {opt.label}
                                        </button>
                                    ))}
                                </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Theme Toggle */}
                    <button 
                        onClick={toggleTheme}
                        className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/5 transition-all"
                    >
                        {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                    </button>

                    {/* Desktop Share */}
                    <button 
                        onClick={handleShare}
                        className="hidden md:flex w-9 h-9 md:w-10 md:h-10 rounded-full items-center justify-center text-zinc-500 hover:text-white hover:bg-white/5 transition-all"
                    >
                        <Share2 size={18} />
                    </button>

                    {/* Mobile Menu Trigger */}
                    <button 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden w-9 h-9 rounded-full flex items-center justify-center text-zinc-300 bg-white/5 border border-white/10 ml-2"
                    >
                        {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>

                </div>
            </div>
        </motion.header>

        {/* --- PHILOSOPHY MODAL (PORTAL) --- */}
        <AnimatePresence>
            {isPhilosophyOpen && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center px-4"
                >
                    <div 
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
                        onClick={() => setIsPhilosophyOpen(false)} 
                    />
                    
                    <motion.div 
                        initial={{ scale: 0.95, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.95, y: 20, opacity: 0 }}
                        className="relative w-full max-w-2xl bg-[#0f0f10] border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5 backdrop-blur-xl">
                            <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
                                <BookOpen size={20} className="text-premium-purple" />
                                Философия Практики
                            </h2>
                            <button 
                                onClick={() => setIsPhilosophyOpen(false)}
                                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                            >
                                <X size={16} className="text-white" />
                            </button>
                        </div>

                        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                            <ReactMarkdown
                                components={{
                                    h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-white mb-6" {...props} />,
                                    h3: ({node, ...props}) => <h3 className="text-lg font-bold text-cyan-400 mt-6 mb-3 uppercase tracking-wide" {...props} />,
                                    p: ({node, ...props}) => <p className="mb-4 text-gray-300 leading-relaxed font-light" {...props} />,
                                    ul: ({node, ...props}) => <ul className="space-y-2 mb-6 pl-4" {...props} />,
                                    li: ({node, ...props}) => (
                                        <li className="flex items-start gap-3 text-gray-300">
                                            <span className="mt-2 w-1 h-1 rounded-full bg-purple-500 shrink-0"></span>
                                            <span>{props.children}</span>
                                        </li>
                                    ),
                                    strong: ({node, ...props}) => <strong className="text-white font-bold" {...props} />,
                                    a: ({node, ...props}) => <a className="text-purple-400 hover:text-purple-300 underline underline-offset-4" {...props} />
                                }}
                            >
                                {PHILOSOPHY_CONTENT}
                            </ReactMarkdown>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* --- MOBILE MENU DRAWER --- */}
        <AnimatePresence>
            {isMobileMenuOpen && (
                <>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    />
                    <motion.div
                        initial={{ y: "-100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "-100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed top-0 left-0 right-0 bg-[#0f0f10] border-b border-white/10 z-40 md:hidden pt-28 pb-8 px-6 rounded-b-[32px] shadow-2xl"
                    >
                        <div className="flex flex-col gap-2">
                             {NAV_ITEMS.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => { handleNavClick(item.id); setIsMobileMenuOpen(false); }}
                                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                                        (view === item.id && !isPhilosophyOpen) 
                                        ? 'bg-white/10 text-white border border-white/10' 
                                        : 'text-zinc-500 hover:bg-white/5 hover:text-white'
                                    }`}
                                >
                                    <item.icon size={20} />
                                    <span className="text-lg font-bold tracking-wide">{item.label}</span>
                                </button>
                             ))}

                             <div className="h-px bg-white/5 my-2" />

                             {deferredPrompt && (
                                <button onClick={handleInstallClick} className="flex items-center gap-4 p-4 text-cyan-400">
                                    <Download size={20} />
                                    <span className="text-sm font-bold uppercase tracking-widest">Установить App</span>
                                </button>
                             )}
                             <button onClick={() => { setShowMobileFaq(true); setIsMobileMenuOpen(false); }} className="flex items-center gap-4 p-4 text-zinc-400">
                                <Sparkles size={20} />
                                <span className="text-sm font-bold uppercase tracking-widest">О приложении</span>
                             </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
        </>
    );
};