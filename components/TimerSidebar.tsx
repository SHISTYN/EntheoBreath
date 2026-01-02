
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { BreathingPattern } from '../types';
import { CATEGORY_ICONS, CATEGORY_NAMES } from '../constants';
import IconRenderer from './IconRenderer';
import WimHofGuide from './techniques/WimHofGuide';
import { ArrowLeft, Sparkles, Shield, Info, BookOpen, Heart, Play } from 'lucide-react';

const MotionDiv = motion.div as any;
const MotionButton = motion.button as any;

interface TimerSidebarProps {
    activePattern: BreathingPattern;
    setView: (v: 'library') => void;
    infoTab: 'about' | 'guide';
    setInfoTab: (v: 'about' | 'guide') => void;
    handleDeepAnalysis: () => void;
    isAnalyzing: boolean;
    onStart: () => void;
}

const TimerSidebar: React.FC<TimerSidebarProps> = ({
    activePattern,
    setView,
    infoTab,
    setInfoTab,
    handleDeepAnalysis,
    isAnalyzing,
    onStart
}) => {

    return (
        <div className="w-full h-full flex flex-col bg-white/80 dark:bg-[#0a0a0b]/80 backdrop-blur-3xl border-r border-white/5 shadow-[20px_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden transition-colors duration-500">
            
            {/* Background Texture (Subtle Noise) */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")` }}></div>

            {/* 1. TOP NAVIGATION */}
            <div className="flex-shrink-0 pt-8 pb-6 px-6 relative z-20">
                <div className="flex items-center justify-between mb-6">
                    <button 
                        onClick={() => setView('library')}
                        className="group flex items-center gap-2 pl-2 pr-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all text-zinc-500 hover:text-zinc-900 dark:text-gray-400 dark:hover:text-white"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-300" />
                        <span className="text-xs font-bold uppercase tracking-widest">Библиотека</span>
                    </button>
                    
                    {/* Category Pill */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400">
                        <i className={`fas fa-${CATEGORY_ICONS[activePattern.category]} text-[10px]`}></i>
                        <span className="text-[10px] font-bold uppercase tracking-wider">{CATEGORY_NAMES[activePattern.category]}</span>
                    </div>
                </div>

                {/* BIG TITLE */}
                <h1 className="text-3xl md:text-4xl font-display font-black text-transparent bg-clip-text bg-gradient-to-br from-zinc-900 via-zinc-700 to-zinc-500 dark:from-white dark:via-gray-200 dark:to-gray-500 leading-tight mb-6">
                    {activePattern.name}
                </h1>

                {/* GLASS TABS - FIXED: Text always visible */}
                <div className="p-1 bg-zinc-100/50 dark:bg-black/20 backdrop-blur-md rounded-2xl flex items-center w-full border border-white/5 shadow-inner">
                    {(['about', 'guide'] as const).map((tab) => {
                        const isActive = infoTab === tab;
                        return (
                            <button
                                key={tab}
                                onClick={() => setInfoTab(tab)}
                                className={`
                                    relative flex-1 py-3 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all duration-300
                                    ${isActive ? 'text-black dark:text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-800 dark:text-gray-500 dark:hover:text-gray-300'}
                                `}
                            >
                                {isActive && (
                                    <MotionDiv
                                        layoutId="liquidTab"
                                        className="absolute inset-0 bg-white dark:bg-white/10 border border-white/20 rounded-xl"
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    {tab === 'about' && <Info size={14} />}
                                    {tab === 'guide' && <BookOpen size={14} />}
                                    {/* ALWAYS VISIBLE TEXT */}
                                    <span>{tab === 'about' ? 'Обзор' : 'Техника'}</span>
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 2. SCROLLABLE CONTENT AREA */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-32 md:pb-24 relative z-10">
                <AnimatePresence mode="wait">
                    <MotionDiv
                        key={infoTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        {infoTab === 'about' && (
                            <>
                                {/* Description Card */}
                                {activePattern.mode !== 'stopwatch' && activePattern.mode !== 'manual' && activePattern.mode !== 'wim-hof' && (
                                    <div className="bg-white/40 dark:bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-md shadow-sm">
                                        <p className="text-zinc-700 dark:text-gray-300 leading-relaxed text-sm md:text-base font-medium font-sans">
                                            {activePattern.description}
                                        </p>
                                    </div>
                                )}

                                {/* Benefits Grid */}
                                {activePattern.benefits && activePattern.benefits.length > 0 && (
                                    <div className="grid grid-cols-1 gap-3">
                                        {activePattern.benefits.map((benefit, i) => (
                                            <div key={i} className="group flex items-center gap-4 p-4 bg-zinc-50/50 dark:bg-white/5 hover:bg-white/10 border border-zinc-100 dark:border-white/5 hover:border-white/10 rounded-2xl transition-all duration-300">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 flex items-center justify-center text-purple-600 dark:text-purple-300 shadow-inner group-hover:scale-110 transition-transform">
                                                    <IconRenderer iconName={benefit.icon} size={18} />
                                                </div>
                                                <span className="text-sm font-bold text-zinc-700 dark:text-gray-200">{benefit.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Stats Row */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-zinc-50/50 dark:bg-white/5 p-4 rounded-2xl border border-zinc-100 dark:border-white/5 flex flex-col items-center justify-center text-center">
                                        <div className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold mb-1">Сложность</div>
                                        <div className="text-zinc-900 dark:text-white font-display font-bold text-lg">{activePattern.difficulty}</div>
                                    </div>
                                    <div className="bg-zinc-50/50 dark:bg-white/5 p-4 rounded-2xl border border-zinc-100 dark:border-white/5 flex flex-col items-center justify-center text-center">
                                        <div className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold mb-1">Тип</div>
                                        <div className="text-zinc-900 dark:text-white font-display font-bold text-lg">
                                            {activePattern.mode === 'loop' ? 'Цикл' : activePattern.mode === 'wim-hof' ? 'Протокол' : 'Свободный'}
                                        </div>
                                    </div>
                                </div>

                                {/* AI Button (Gem) */}
                                {activePattern.mode !== 'stopwatch' && activePattern.mode !== 'manual' && (
                                    <MotionButton
                                        whileTap={{ scale: 0.98 }}
                                        whileHover={{ scale: 1.02 }}
                                        onClick={handleDeepAnalysis}
                                        disabled={isAnalyzing}
                                        className="w-full relative overflow-hidden p-[1px] rounded-2xl group"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 opacity-50 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer-slow bg-[length:200%_auto]"></div>
                                        <div className="relative bg-white dark:bg-[#121212] rounded-[15px] px-6 py-4 flex items-center justify-center gap-3">
                                            {isAnalyzing ? (
                                                <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <Sparkles className="text-purple-500" size={18} />
                                            )}
                                            <span className="font-bold text-sm bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-gray-300 uppercase tracking-wide">
                                                {isAnalyzing ? 'Нейросеть думает...' : 'AI Анализ Техники'}
                                            </span>
                                        </div>
                                    </MotionButton>
                                )}
                            </>
                        )}

                        {infoTab === 'guide' && (
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                {activePattern.id === 'wim-hof-session' && <div className="mb-8"><WimHofGuide /></div>}
                                
                                <div className="bg-white/40 dark:bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
                                    <ReactMarkdown components={{
                                        strong: ({node, ...props}) => <span className="text-cyan-600 dark:text-cyan-400 font-extrabold" {...props} />,
                                        h3: ({node, ...props}) => <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-6 mb-3 font-display uppercase tracking-wide border-b border-white/10 pb-2" {...props} />,
                                        li: ({node, ...props}) => <li className="marker:text-cyan-500 pl-1 mb-2 text-zinc-700 dark:text-gray-300 font-medium" {...props} />
                                    }}>
                                        {activePattern.instruction}
                                    </ReactMarkdown>
                                </div>

                                {activePattern.musicLinks && (
                                    <div className="mt-6 space-y-2">
                                        <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Материалы</h4>
                                        {activePattern.musicLinks.map((link, idx) => (
                                            <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="block w-full p-4 bg-zinc-900 dark:bg-white/10 hover:bg-black dark:hover:bg-white/20 text-white rounded-xl text-center font-bold text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-xl">
                                                {link.label}
                                            </a>
                                        ))}
                                    </div>
                                )}

                                {/* --- MERGED SAFETY SECTION --- */}
                                <div className="mt-8 space-y-6 pt-6 border-t border-zinc-200 dark:border-white/10">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Shield size={16} className="text-zinc-400" />
                                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                                            Безопасность и Условия
                                        </h3>
                                    </div>

                                    {/* Safety Warning Box */}
                                    <div className={`p-6 rounded-3xl border ${activePattern.safetyWarning ? 'bg-rose-500/10 border-rose-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                                        <div className="flex items-center gap-3 mb-3">
                                            <Shield size={20} className={activePattern.safetyWarning ? 'text-rose-500' : 'text-emerald-500'} />
                                            <h4 className={`text-sm font-bold uppercase tracking-wider ${activePattern.safetyWarning ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                {activePattern.safetyWarning ? 'Предупреждение' : 'Безопасно'}
                                            </h4>
                                        </div>
                                        <p className="text-zinc-700 dark:text-gray-200 font-medium leading-relaxed">
                                            {activePattern.safetyWarning || 'Эта практика безопасна для большинства людей.'}
                                        </p>
                                    </div>

                                    {/* Contraindications List */}
                                    {activePattern.contraindications && (
                                        <div className="bg-white/5 border border-zinc-200 dark:border-white/10 p-6 rounded-3xl">
                                            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Противопоказания</h4>
                                            <ul className="space-y-3">
                                                {activePattern.contraindications.map((c, i) => (
                                                    <li key={i} className="flex items-start gap-3 text-sm text-zinc-600 dark:text-gray-400 font-medium">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0"></span>
                                                        {c}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </MotionDiv>
                </AnimatePresence>
            </div>

            {/* --- MOBILE FLOATING ACTION BUTTON --- */}
            <div className="lg:hidden absolute bottom-0 left-0 right-0 p-4 pb-safe bg-gradient-to-t from-white dark:from-[#0a0a0b] via-white/95 dark:via-[#0a0a0b]/95 to-transparent z-50">
                <MotionButton
                    whileTap={{ scale: 0.96 }}
                    onClick={onStart}
                    className="w-full h-16 rounded-2xl bg-white dark:bg-white text-black font-display font-black text-sm uppercase tracking-widest shadow-[0_0_40px_rgba(255,255,255,0.3)] dark:shadow-[0_0_40px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3 relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none"></div>
                    <span className="relative z-10">Перейти к таймеру</span>
                    <Play size={18} fill="black" className="relative z-10" />
                </MotionButton>
            </div>

            {/* --- DESKTOP FOOTER --- */}
            <div className="hidden lg:block absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-white dark:from-[#0a0a0b] via-white/90 dark:via-[#0a0a0b]/90 to-transparent z-20">
                <div className="flex flex-col items-center justify-center gap-2 pt-4 border-t border-zinc-200 dark:border-white/5">
                    <div className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 dark:text-white/30 uppercase flex items-center gap-2">
                        Created With <Heart size={12} className="text-rose-500 fill-rose-500 animate-pulse" />
                    </div>
                    <div className="text-[9px] font-bold text-zinc-300 dark:text-white/20 uppercase tracking-widest hover:text-zinc-500 dark:hover:text-white/50 transition-colors cursor-default">
                        By Nikolai Ovchinnikov
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TimerSidebar;
