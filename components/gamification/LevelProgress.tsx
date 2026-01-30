
import React from 'react';
import { motion } from 'framer-motion';

interface LevelProgressProps {
    level: number;
    xpProgress: {
        current: number;
        needed: number;
        percentage: number;
    };
    compact?: boolean;
}

const LevelProgress: React.FC<LevelProgressProps> = ({ level, xpProgress, compact = false }) => {
    if (compact) {
        // Compact version for Header
        return (
            <div className="flex items-center gap-2">
                {/* Level Badge */}
                <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-[0_0_15px_-3px_rgba(34,211,238,0.5)]">
                        {level}
                    </div>
                    {/* Mini progress ring */}
                    <svg className="absolute inset-0 w-8 h-8 -rotate-90">
                        <circle
                            cx="16"
                            cy="16"
                            r="14"
                            fill="none"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="2"
                        />
                        <motion.circle
                            cx="16"
                            cy="16"
                            r="14"
                            fill="none"
                            stroke="url(#levelGradient)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            initial={{ strokeDashoffset: 88 }}
                            animate={{ strokeDashoffset: 88 - (88 * xpProgress.percentage) / 100 }}
                            strokeDasharray="88"
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                        />
                        <defs>
                            <linearGradient id="levelGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#22d3ee" />
                                <stop offset="100%" stopColor="#3b82f6" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
            </div>
        );
    }

    // Full version
    return (
        <div className="w-full bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    {/* Level Badge */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-lg font-bold text-white shadow-[0_0_20px_-5px_rgba(34,211,238,0.5)]">
                        {level}
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Уровень</p>
                        <p className="text-lg font-bold text-white">
                            {level < 50 ? `${xpProgress.current} / ${xpProgress.needed} XP` : 'MAX'}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                        {Math.round(xpProgress.percentage)}%
                    </p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-3 bg-black/30 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress.percentage}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full relative"
                >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer-slow" />
                </motion.div>
            </div>
        </div>
    );
};

export default LevelProgress;
