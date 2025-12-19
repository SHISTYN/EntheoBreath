import React from 'react';
import ReactMarkdown from 'react-markdown';
import { BreathingPattern } from '../types';
import { CATEGORY_ICONS, CATEGORY_NAMES } from '../constants';
import IconRenderer from './IconRenderer';

interface TimerSidebarProps {
    activePattern: BreathingPattern;
    setView: (v: 'library') => void;
    infoTab: 'about' | 'guide' | 'safety';
    setInfoTab: (v: 'about' | 'guide' | 'safety') => void;
    handleDeepAnalysis: () => void;
    isAnalyzing: boolean;
}

const TimerSidebar: React.FC<TimerSidebarProps> = ({
    activePattern,
    setView,
    infoTab,
    setInfoTab,
    handleDeepAnalysis,
    isAnalyzing
}) => {
    return (
        <div className={`w-full ${activePattern.mode === 'manual' ? 'lg:w-full' : 'lg:w-[480px]'} bg-white/80 dark:bg-[#0a0a0b]/80 backdrop-blur-3xl border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-white/5 flex flex-col relative z-20 shadow-2xl h-auto lg:h-full lg:overflow-y-auto custom-scrollbar order-1 transition-all duration-500`}>
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
                        <i className={`fas fa-${CATEGORY_ICONS[activePattern.category]}`}></i>
                        <span className="hidden sm:inline">{CATEGORY_NAMES[activePattern.category]}</span>
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
                    {activePattern.mode !== 'manual' && activePattern.category !== 'Toltec' && (
                        <button 
                            onClick={() => setInfoTab('safety')}
                            className={`flex-1 py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all uppercase tracking-wide ${infoTab === 'safety' ? 'bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                        >
                            <i className="fas fa-shield-alt mr-1"></i> Важно
                        </button>
                    )}
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
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {activePattern.benefits.map((benefit, i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 bg-white/50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl">
                                                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center text-premium-purple dark:text-purple-400 shrink-0">
                                                    <IconRenderer iconName={benefit.icon} size={16} />
                                                </div>
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{benefit.label}</span>
                                            </div>
                                        ))}
                                    </div>
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
                                strong: ({node, ...props}) => <span className="text-cyan-700 dark:text-zen-accent font-bold" {...props} />,
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
                            
                            {(activePattern.mode === 'manual' || activePattern.category === 'Toltec') && activePattern.safetyWarning && (
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

                    {infoTab === 'safety' && (
                        <div className="space-y-8 animate-fade-in">
                            {activePattern.safetyWarning && (
                                <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-500/20 p-6 rounded-2xl">
                                    <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-3">Главное предупреждение</h4>
                                    <p className="text-rose-900 dark:text-rose-100 leading-relaxed font-medium text-lg">{activePattern.safetyWarning}</p>
                                </div>
                            )}
                            
                            {activePattern.contraindications && activePattern.contraindications.length > 0 && (
                                <div>
                                    <h4 className="text-[10px] font-bold text-rose-500 uppercase tracking-[0.2em] mb-3 opacity-80">Противопоказания</h4>
                                    <ul className="space-y-3">
                                        {activePattern.contraindications.map((c, i) => (
                                            <li key={i} className="flex items-start gap-3 text-gray-700 dark:text-gray-300 font-light">
                                                <i className="fas fa-times-circle text-rose-500 mt-1"></i>
                                                <span className="text-base md:text-lg">{c}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {activePattern.conditions && activePattern.conditions.length > 0 && (
                                <div>
                                    <h4 className="text-[10px] font-bold text-premium-gold uppercase tracking-[0.2em] mb-3 opacity-80">Условия</h4>
                                    <ul className="space-y-3">
                                        {activePattern.conditions.map((c, i) => (
                                            <li key={i} className="flex items-start gap-3 text-gray-700 dark:text-gray-300 font-light">
                                                <i className="fas fa-check-circle text-premium-gold mt-1"></i>
                                                <span className="text-base md:text-lg">{c}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
            </div>

            <div className="hidden lg:block p-4 md:p-6 border-t border-gray-200 dark:border-white/5 text-center text-gray-500 dark:text-gray-500 bg-white/50 dark:bg-[#0a0a0b]/50 backdrop-blur-xl mt-auto">
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
    );
};

export default TimerSidebar;