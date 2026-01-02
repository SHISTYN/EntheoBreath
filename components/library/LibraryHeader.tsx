
import React, { useEffect, useRef } from 'react';
import { CATEGORY_NAMES } from '../../constants';
import { Search, Zap, Moon, AlertCircle, BatteryCharging, Command, Target, Heart } from 'lucide-react';
import { motion, LayoutGroup } from 'framer-motion';

const MotionDiv = motion.div as any;
const MotionButton = motion.button as any;

interface LibraryHeaderProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    totalCount: number;
    selectedTag: string | null;
    onTagSelect: (tag: string | null) => void;
}

// Configuration for Neural Chips
const QUICK_ACTIONS = [
    { 
        label: 'Взбодриться', 
        tag: 'wakeup', 
        icon: Zap, 
        baseColor: 'text-orange-500 dark:text-orange-400',
        activeColor: 'text-white dark:text-orange-950',
        activeBg: 'bg-orange-500 dark:bg-orange-400',
        glow: 'shadow-[0_0_15px_-3px_rgba(249,115,22,0.4)]'
    },
    { 
        label: 'Концентрация', 
        tag: 'focus', 
        icon: Target, 
        baseColor: 'text-blue-500 dark:text-blue-400',
        activeColor: 'text-white dark:text-blue-950',
        activeBg: 'bg-blue-500 dark:bg-blue-400',
        glow: 'shadow-[0_0_15px_-3px_rgba(59,130,246,0.4)]'
    },
    { 
        label: 'Уснуть', 
        tag: 'sleep', 
        icon: Moon, 
        baseColor: 'text-indigo-500 dark:text-indigo-400',
        activeColor: 'text-white dark:text-indigo-950',
        activeBg: 'bg-indigo-500 dark:bg-indigo-400',
        glow: 'shadow-[0_0_15px_-3px_rgba(99,102,241,0.4)]'
    },
    { 
        label: 'Стоп Паника', 
        tag: 'panic', 
        icon: AlertCircle, 
        baseColor: 'text-red-500 dark:text-red-400',
        activeColor: 'text-white dark:text-red-950',
        activeBg: 'bg-red-500 dark:bg-red-500',
        glow: 'shadow-[0_0_15px_-3px_rgba(239,68,68,0.4)]'
    },
    { 
        label: 'Энергия', 
        tag: 'energy-return', 
        icon: BatteryCharging, 
        baseColor: 'text-emerald-500 dark:text-emerald-400',
        activeColor: 'text-white dark:text-emerald-950',
        activeBg: 'bg-emerald-500 dark:bg-emerald-400',
        glow: 'shadow-[0_0_15px_-3px_rgba(16,185,129,0.4)]'
    },
];

const LibraryHeader: React.FC<LibraryHeaderProps> = ({ 
    searchQuery, 
    onSearchChange, 
    selectedCategory, 
    onCategoryChange,
    totalCount,
    selectedTag,
    onTagSelect
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Keyboard Shortcut Handler
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Category Logic
    const allCategories = ['All', 'AuthorChoice', 'Favorites', ...Object.keys(CATEGORY_NAMES)];

    const getCategoryLabel = (cat: string) => {
        if (cat === 'All') return 'Все';
        if (cat === 'Favorites') return 'Избранное';
        if (cat === 'AuthorChoice') return 'Выбор Автора';
        return CATEGORY_NAMES[cat] || cat;
    };

    return (
        <div className="relative z-10 flex flex-col items-center justify-center pt-0 pb-6 text-center w-full">
            
            {/* --- STATIC HEADER CONTENT (Scrolls away) --- */}
            <div className="w-full max-w-5xl mx-auto px-4 flex flex-col items-center">
                {/* 1. BADGE */}
                <MotionDiv 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#0a0a0b] border border-cyan-500/20 shadow-[0_0_20px_-5px_rgba(34,211,238,0.15)]"
                >
                    <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
                    </span>
                    <span className="text-cyan-600 dark:text-cyan-400/90 text-[10px] font-bold tracking-widest uppercase ml-1">
                        {totalCount} Техник
                    </span>
                </MotionDiv>

                {/* 2. TITLE */}
                <h1 className="text-4xl md:text-5xl font-display font-bold text-zinc-900 dark:text-white mb-8 tracking-tight leading-tight px-4">
                    Библиотека <span className="font-serif italic bg-gradient-to-r from-cyan-500 via-white to-cyan-500 dark:from-cyan-400 dark:via-white dark:to-cyan-400 bg-[length:200%_auto] bg-clip-text text-transparent animate-shimmer-slow py-1 px-2 -mx-2">Дыхания</span>
                </h1>

                {/* 3. INPUT */}
                <div className="relative w-full max-w-xl group mb-8 mx-auto px-4">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500 group-focus-within:opacity-100"></div>
                    <div className="relative flex items-center bg-white/50 dark:bg-[#0f0f10]/80 backdrop-blur-xl border border-zinc-200 dark:border-white/10 rounded-2xl transition-all group-focus-within:border-cyan-500/30 group-focus-within:ring-1 group-focus-within:ring-cyan-500/20 shadow-sm">
                        <div className="pl-4 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-zinc-400 dark:text-zinc-500 group-focus-within:text-cyan-500 dark:group-focus-within:text-cyan-400 transition-colors duration-300" />
                        </div>
                        <input 
                            ref={inputRef}
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder="Поиск по состоянию..." 
                            className="w-full pl-3 pr-12 py-3.5 bg-transparent text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-600 focus:outline-none font-medium text-sm"
                        />
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                            <kbd className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-[10px] text-zinc-500 font-mono">
                                <Command size={10} /> K
                            </kbd>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- STICKY NAVIGATION BAR --- */}
            {/* Sticky container wrapping Tags and Categories */}
            <div className="sticky top-0 z-40 w-full py-4 bg-slate-50/90 dark:bg-[#050505]/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/5 transition-all duration-500">
                <LayoutGroup>
                    {/* 5. QUICK ACTIONS (Liquid Chips) */}
                    <div className="w-full flex flex-wrap justify-center gap-2 mb-4 px-2 max-w-[1600px] mx-auto">
                        {QUICK_ACTIONS.map((action) => {
                            const isActive = selectedTag === action.tag;
                            return (
                                <MotionButton
                                    key={action.tag}
                                    layout
                                    onClick={() => onTagSelect(isActive ? null : action.tag)}
                                    whileTap={{ scale: 0.95 }}
                                    whileHover={{ scale: 1.05 }}
                                    className={`
                                        relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wide overflow-hidden
                                        transition-colors duration-300
                                        ${isActive ? `${action.activeColor} border-transparent ${action.glow}` : `bg-white dark:bg-[#0a0a0b]/40 border-zinc-200 dark:border-white/5 ${action.baseColor} hover:bg-zinc-50 dark:hover:bg-white/5`}
                                    `}
                                >
                                    {isActive && (
                                        <MotionDiv 
                                            layoutId="activeTagBg"
                                            className={`absolute inset-0 ${action.activeBg}`}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                    <span className="relative z-10 flex items-center gap-1.5">
                                        <action.icon size={13} strokeWidth={2.5} />
                                        <span>{action.label}</span>
                                    </span>
                                </MotionButton>
                            );
                        })}
                    </div>

                    {/* 6. WRAPPED CATEGORY NAVIGATION */}
                    <div className="w-full relative group max-w-[1600px] mx-auto px-4">
                        <div 
                            ref={scrollContainerRef}
                            className="flex flex-wrap justify-center gap-2 py-1"
                        >
                            {allCategories.map(cat => {
                                const isAuthorChoice = cat === 'AuthorChoice';
                                const isSelected = selectedCategory === cat;
                                const isFavorites = cat === 'Favorites';
                                
                                return (
                                    <MotionButton
                                        key={cat}
                                        layout
                                        onClick={() => onCategoryChange(cat)}
                                        whileTap={{ scale: 0.9 }}
                                        className={`
                                            relative px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0
                                            ${isSelected ? 'text-white dark:text-black shadow-lg' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}
                                        `}
                                    >
                                        {isSelected && (
                                            <MotionDiv
                                                layoutId="activeCategoryPill"
                                                className={`absolute inset-0 rounded-full ${isAuthorChoice ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white' : 'bg-zinc-900 dark:bg-white'}`}
                                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                            />
                                        )}
                                        <span className="relative z-10 flex items-center gap-1.5">
                                            {/* REPLACED EMOJIS WITH ICONS */}
                                            {isFavorites && (
                                                <Heart 
                                                    size={12} 
                                                    className={isSelected ? 'fill-rose-400 text-rose-400' : 'fill-rose-500 text-rose-500'} 
                                                />
                                            )}
                                            {isAuthorChoice && !isSelected && <Zap size={12} className="text-amber-500 fill-amber-500" />}
                                            {getCategoryLabel(cat)}
                                        </span>
                                    </MotionButton>
                                );
                            })}
                        </div>
                    </div>
                </LayoutGroup>
            </div>
        </div>
    );
};

export default LibraryHeader;
