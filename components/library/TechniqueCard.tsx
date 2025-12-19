import React from 'react';
import { BreathingPattern } from '../../types';
import SpotlightCard from '../SpotlightCard';
import IconRenderer from '../IconRenderer';
import { Heart } from 'lucide-react';

interface TechniqueCardProps {
    pattern: BreathingPattern;
    onClick: () => void;
    isFavorite?: boolean;
    onToggleFavorite?: (id: string) => void;
}

const TechniqueCard: React.FC<TechniqueCardProps> = ({ 
    pattern, 
    onClick, 
    isFavorite = false, 
    onToggleFavorite 
}) => {
    // 👑 THE KING CHECK
    const isKing = pattern.id === 'wim-hof-session';

    // Helper for difficulty colors
    const getDifficultyColor = (diff: string) => {
        switch (diff) {
            case 'Новичок': return 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
            case 'Средний': return 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400';
            case 'Профи': return 'bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400';
            default: return 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-400';
        }
    };

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onToggleFavorite) {
            onToggleFavorite(pattern.id);
        }
    };

    // Styling overrides for The King
    // FIX: Using [&>div.absolute]:!hidden to suppress SpotlightCard's internal border/bg layers
    // to create a true monolithic card with a single ring border and glow.
    const containerClasses = isKing 
        ? "relative overflow-hidden rounded-[24px] cursor-pointer flex flex-col h-full min-h-[260px] group transition-all duration-500 bg-gradient-to-br from-[#0f1014] to-[#000000] backdrop-blur-2xl ring-1 ring-cyan-400/30 shadow-[0_0_30px_-5px_rgba(34,211,238,0.15)] hover:shadow-[0_0_50px_-5px_rgba(34,211,238,0.3)] [&>div.absolute]:!hidden"
        : "bg-white/90 dark:bg-[#0f0f10]/80 backdrop-blur-xl rounded-[24px] p-5 cursor-pointer shadow-sm hover:shadow-2xl dark:shadow-black/50 border border-gray-200 dark:border-white/5 flex flex-col h-full min-h-[260px] group relative";

    return (
        <SpotlightCard 
            onClick={onClick}
            className={containerClasses}
        >
            {/* 👑 King Effects (Re-added here since we hid SpotlightCard's internals) */}
            {isKing && (
                <>
                    <div className="absolute inset-0 bg-cyan-500/5 animate-pulse-slow pointer-events-none z-0"></div>
                    <div className="absolute -right-12 -top-12 w-32 h-32 bg-cyan-500/20 blur-[60px] pointer-events-none z-0"></div>
                </>
            )}

            {/* Favorite Button */}
            <button 
                onClick={handleFavoriteClick}
                className="absolute top-4 right-4 z-30 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-all active:scale-90"
            >
                <Heart 
                    size={20} 
                    className={`transition-colors duration-300 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-gray-300 dark:text-gray-600 hover:text-rose-500'}`} 
                />
            </button>

            {/* Header: Tighter vertical spacing */}
            <div className="flex flex-col gap-2 mb-3 pr-10 relative z-20">
                <div className="flex items-center gap-2">
                     <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-transparent dark:border-white/5 shrink-0 ${getDifficultyColor(pattern.difficulty)}`}>
                        {pattern.difficulty}
                    </span>
                    {/* 👑 MAX EFFECT BADGE */}
                    {isKing && (
                        <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow-glow-gold animate-pulse">
                            👑 MAX EFFECT
                        </span>
                    )}
                </div>
                <h3 className={`text-lg font-display font-extrabold group-hover:text-zen-accent dark:group-hover:text-zen-accent transition-colors leading-tight ${isKing ? 'text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-200' : 'text-gray-900 dark:text-white'}`}>
                    {pattern.name}
                </h3>
            </div>

            {/* Description */}
            <p className={`text-sm mb-4 line-clamp-4 leading-relaxed font-medium flex-grow opacity-95 relative z-20 ${isKing ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'}`}>
                {pattern.description}
            </p>
            
            {/* Benefits Grid */}
            <div className="grid grid-cols-2 gap-2 mb-4 mt-auto relative z-20">
                {pattern.benefits && pattern.benefits.slice(0, 4).map((b, i) => (
                    <div key={i} className={`flex items-center gap-2 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border overflow-hidden ${isKing ? 'bg-white/5 border-white/5 text-gray-200' : 'text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5'}`}>
                        <IconRenderer iconName={b.icon} size={13} className={isKing ? "text-cyan-400 shrink-0" : "text-cyan-600 dark:text-zen-accent shrink-0"} />
                        <span className="truncate">{b.label}</span>
                    </div>
                ))}
            </div>

            {/* Footer Metadata */}
            <div className={`flex items-center gap-2 text-sm font-bold border-t pt-3 group-hover:text-zen-accent dark:group-hover:text-zen-accent transition-colors relative z-20 ${isKing ? 'text-cyan-400/80 border-white/10' : 'text-gray-500 dark:text-gray-400 border-gray-100 dark:border-white/5'}`}>
                <i className="far fa-clock text-xs"></i>
                <span className="truncate">
                    {pattern.mode === 'wim-hof' ? (
                        <span>Протокол: 3 Фазы</span>
                    ) : pattern.mode === 'stopwatch' ? (
                        <span>Секундомер</span>
                    ) : pattern.mode === 'manual' ? (
                        <span>Руководство</span>
                    ) : (
                        <span className="flex items-center">
                            Паттерн: 
                            <span className={`ml-2 px-1.5 py-0.5 rounded ${isKing ? 'bg-white/10 text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white'}`}>
                                {pattern.displayLabel ? pattern.displayLabel : `${pattern.inhale}-${pattern.holdIn}-${pattern.exhale}-${pattern.holdOut}`}
                            </span>
                        </span>
                    )}
                </span>
            </div>
        </SpotlightCard>
    );
};

export default TechniqueCard;