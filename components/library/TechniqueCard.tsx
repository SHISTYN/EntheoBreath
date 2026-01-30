
import React from 'react';
import { BreathingPattern } from '../../types';
import SpotlightCard from '../SpotlightCard';
import IconRenderer from '../IconRenderer';
import { Heart, Crown } from 'lucide-react';

interface TechniqueCardProps {
    pattern: BreathingPattern;
    onClick: () => void;
    isFavorite?: boolean;
    onToggleFavorite?: (id: string) => void;
    searchQuery?: string;
    isLocked?: boolean;
}

// --- HIGHLIGHTER UTILITY ---
const HighlightedText: React.FC<{ text: string; query: string; className?: string }> = ({ text, query, className }) => {
    if (!query) return <span className={className}>{text}</span>;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
        <span className={className}>
            {parts.map((part, i) =>
                part.toLowerCase() === query.toLowerCase() ? (
                    <span key={i} className="bg-yellow-400/30 text-yellow-900 dark:text-yellow-100 rounded-sm px-0.5 box-decoration-clone">
                        {part}
                    </span>
                ) : (
                    part
                )
            )}
        </span>
    );
};

// Memoized to prevent re-render of entire list on search keystrokes
const TechniqueCard: React.FC<TechniqueCardProps> = React.memo(({
    pattern,
    onClick,
    isFavorite = false,
    onToggleFavorite,
    searchQuery = "",
    isLocked = false
}) => {
    // 👑 THE KING CHECK
    const isKing = pattern.id === 'wim-hof-session';

    // Helper for difficulty styling
    const getDifficultyStyle = (diff: string) => {
        switch (diff) {
            case 'Новичок':
                return {
                    bg: 'bg-emerald-500/10 border-emerald-500/20',
                    text: 'bg-gradient-to-r from-emerald-600 via-emerald-300 to-emerald-600 dark:from-emerald-400 dark:via-white dark:to-emerald-400 bg-[length:200%_auto] bg-clip-text text-transparent animate-shimmer-slow'
                };
            case 'Средний':
                return {
                    bg: 'bg-amber-500/10 border-amber-500/20',
                    text: 'bg-gradient-to-r from-amber-600 via-amber-200 to-amber-600 dark:from-amber-400 dark:via-white dark:to-amber-400 bg-[length:200%_auto] bg-clip-text text-transparent animate-shimmer-slow'
                };
            case 'Профи':
                return {
                    bg: 'bg-rose-500/10 border-rose-500/20',
                    text: 'bg-gradient-to-r from-rose-600 via-rose-200 to-rose-600 dark:from-rose-500 dark:via-white dark:to-rose-500 bg-[length:200%_auto] bg-clip-text text-transparent animate-shimmer-slow'
                };
            default:
                return {
                    bg: 'bg-gray-100 dark:bg-white/10 border-gray-200 dark:border-white/10',
                    text: 'text-gray-500'
                };
        }
    };

    const diffStyle = getDifficultyStyle(pattern.difficulty);

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onToggleFavorite) {
            onToggleFavorite(pattern.id);
        }
    };

    // Styling overrides for The King
    const containerClasses = isKing
        ? "relative overflow-hidden rounded-3xl cursor-pointer flex flex-col h-full min-h-[220px] group transition-all duration-500 bg-gradient-to-br from-[#0f1014] to-[#000000] backdrop-blur-3xl ring-1 ring-cyan-400/30 shadow-[0_0_30px_-5px_rgba(34,211,238,0.15)] hover:shadow-[0_0_50px_-5px_rgba(34,211,238,0.3)] hover:scale-[1.02] active:scale-[0.98] [&>div.absolute]:!hidden"
        : "bg-white/80 dark:bg-[#0f0f10]/60 backdrop-blur-2xl rounded-3xl cursor-pointer shadow-sm hover:shadow-2xl dark:shadow-black/60 border border-zinc-200 dark:border-white/10 flex flex-col h-full min-h-[220px] group relative transition-all duration-300 hover:border-zinc-300 dark:hover:border-white/20 active:scale-[0.98]";

    return (
        <SpotlightCard
            onClick={onClick}
            className={containerClasses}
            contentClassName="p-5 md:p-6 flex flex-col h-full"
        >
            {/* 👑 King Effects */}
            {isKing && (
                <>
                    <div className="absolute inset-0 bg-cyan-500/5 animate-pulse-slow pointer-events-none z-0"></div>
                    <div className="absolute -right-12 -top-12 w-32 h-32 bg-cyan-500/20 blur-[60px] pointer-events-none z-0"></div>
                </>
            )}

            {/* Favorite Button (Hide if locked? No, let them fave it) */}
            <button
                onClick={handleFavoriteClick}
                className="absolute top-3 right-3 z-30 p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-all active:scale-90"
            >
                <Heart
                    size={18}
                    className={`transition-colors duration-300 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-zinc-300 dark:text-zinc-600 hover:text-rose-500'}`}
                />
            </button>

            {/* 🔒 LOCK OVERLAY */}
            {isLocked && (
                <div className="absolute inset-0 z-40 bg-black/40 backdrop-blur-[2px] flex items-center justify-center rounded-3xl group-hover:bg-black/30 transition-colors">
                    <div className="bg-black/60 p-3 rounded-full border border-white/20 shadow-xl backdrop-blur-md transform group-hover:scale-110 transition-transform">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                            <Crown size={18} className="text-white" />
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col gap-1.5 mb-2 pr-8 relative z-20">
                <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded border shrink-0 ${diffStyle.bg} ${diffStyle.text}`}>
                        {pattern.difficulty}
                    </span>
                    {/* 👑 MAX EFFECT BADGE */}
                    {isKing && (
                        <div className="flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow-glow-gold animate-pulse">
                            <Crown size={10} fill="black" />
                            <span>KING</span>
                        </div>
                    )}
                </div>
                <h3 className={`text-base md:text-lg font-display font-extrabold group-hover:text-cyan-600 dark:group-hover:text-zen-accent transition-colors leading-tight ${isKing ? 'text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-200' : 'text-zinc-900 dark:text-white'}`}>
                    <HighlightedText text={pattern.name} query={searchQuery} />
                </h3>
            </div>

            {/* Description */}
            <div className={`text-[13px] mb-4 line-clamp-3 leading-snug font-medium flex-grow opacity-90 relative z-20 ${isKing ? 'text-gray-300' : 'text-zinc-500 dark:text-zinc-400'}`}>
                <HighlightedText text={pattern.description} query={searchQuery} />
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-2 gap-1.5 mb-3 mt-auto relative z-20 w-full">
                {pattern.benefits && pattern.benefits.slice(0, 4).map((b, i) => (
                    <div key={i} className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide px-2 py-1.5 rounded border overflow-hidden transition-colors ${isKing
                        ? 'bg-white/5 border-white/10 text-gray-300 group-hover:border-cyan-500/30'
                        : 'bg-zinc-50 dark:bg-white/5 border-zinc-100 dark:border-white/5 text-zinc-600 dark:text-zinc-400 group-hover:border-zinc-300 dark:group-hover:border-white/10'
                        }`}>
                        <IconRenderer iconName={b.icon} size={12} className={isKing ? "text-cyan-400 shrink-0" : "text-cyan-600 dark:text-zen-accent shrink-0"} />
                        <span className="truncate">{b.label}</span>
                    </div>
                ))}
            </div>

            {/* Footer Metadata */}
            <div className={`flex items-center gap-2 text-xs font-bold border-t pt-2.5 transition-colors relative z-20 ${isKing ? 'text-cyan-400/80 border-white/10 group-hover:text-cyan-300' : 'text-zinc-400 dark:text-zinc-500 border-zinc-100 dark:border-white/5 group-hover:text-cyan-600 dark:group-hover:text-zen-accent'}`}>
                <i className="far fa-clock text-[10px]"></i>
                <span className="truncate uppercase tracking-wider text-[10px]">
                    {pattern.mode === 'wim-hof' ? (
                        <span>Протокол: 3 Фазы</span>
                    ) : pattern.mode === 'stopwatch' ? (
                        <span>Режим: Секундомер</span>
                    ) : pattern.mode === 'manual' ? (
                        <span>Режим: Мануал</span>
                    ) : (
                        <span className="flex items-center">
                            Ритм: <span className="ml-1 font-mono opacity-80">{pattern.displayLabel ? pattern.displayLabel : `${pattern.inhale}-${pattern.holdIn}-${pattern.exhale}-${pattern.holdOut}`}</span>
                        </span>
                    )}
                </span>
            </div>
        </SpotlightCard>
    );
});

export default TechniqueCard;
