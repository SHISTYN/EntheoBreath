import React, { useState } from 'react';
import { BreathingPattern } from '../types';
import { DEFAULT_PATTERNS, CATEGORY_NAMES, CATEGORY_ICONS } from '../constants';
import SpotlightCard from './SpotlightCard';
import IconRenderer from './IconRenderer';

interface LibraryViewProps {
    selectPattern: (p: BreathingPattern) => void;
}

const LibraryView: React.FC<LibraryViewProps> = ({ selectPattern }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

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
    const allCategories = ['All', ...Object.keys(CATEGORY_NAMES)];

    return (
        <div className="animate-fade-in p-6 md:p-16 pb-32">
            <div className="max-w-7xl mx-auto">
                <header className="mb-20 text-center relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full blur-[100px] -z-10 opacity-50 pointer-events-none"></div>

                    <div className="inline-flex items-center justify-center mb-6 animate-fade-in">
                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-700 dark:text-zen-accent text-[10px] font-bold uppercase tracking-[0.2em] shadow-glow-cyan backdrop-blur-md transition-transform hover:scale-105 cursor-default">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 dark:bg-zen-accent animate-pulse"></span>
                            {DEFAULT_PATTERNS.length} Техник в базе
                        </div>
                    </div>

                    <h2 className="text-5xl md:text-7xl font-display font-medium mb-8 text-transparent bg-clip-text bg-gradient-to-b from-gray-900 to-gray-500 dark:from-white dark:to-gray-500 tracking-tight leading-[1.1]">
                        Библиотека <br className="md:hidden" /> <span className="italic font-light text-zen-accent dark:text-zen-accent">Дыхания</span>
                    </h2>
                    
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
                                    {cat === 'All' ? 'Все' : CATEGORY_NAMES[cat]}
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
                                    <i className={`fas fa-${CATEGORY_ICONS[category] || 'wind'}`}></i>
                                </div>
                                <h3 className="text-3xl font-display font-bold text-gray-900 dark:text-white tracking-tight">
                                    {CATEGORY_NAMES[category] || category}
                                </h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {patterns.map((p, idx) => (
                                    <SpotlightCard 
                                        key={p.id} 
                                        onClick={() => selectPattern(p)}
                                        className="bg-white/80 dark:bg-[#0f0f10]/60 backdrop-blur-xl rounded-[24px] p-6 cursor-pointer shadow-sm hover:shadow-2xl dark:shadow-black/50 border border-gray-200 dark:border-white/5 flex flex-col h-full min-h-[300px]"
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
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 line-clamp-3 leading-relaxed font-light">{p.description}</p>
                                        
                                        <div className="grid grid-cols-2 gap-2 mb-4 mt-auto">
                                            {p.benefits && p.benefits.slice(0, 4).map((b, i) => (
                                                <div key={i} className="flex items-center gap-1.5 text-[9px] text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-white/5 px-2 py-1.5 rounded-lg border border-gray-100 dark:border-white/5 overflow-hidden">
                                                    <IconRenderer iconName={b.icon} size={10} className="text-cyan-600 dark:text-zen-accent shrink-0" />
                                                    <span className="truncate">{b.label}</span>
                                                </div>
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
    );
};

export default LibraryView;