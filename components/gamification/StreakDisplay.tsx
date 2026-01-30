
import React from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

interface StreakDisplayProps {
    streak: number;
    compact?: boolean;
}

const StreakDisplay: React.FC<StreakDisplayProps> = ({ streak, compact = false }) => {
    const isOnFire = streak >= 7;
    const isLegendary = streak >= 30;

    if (compact) {
        // Compact version for Header
        if (streak === 0) return null;

        return (
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/20 border border-orange-500/30"
            >
                <motion.div
                    animate={isOnFire ? {
                        scale: [1, 1.2, 1],
                        rotate: [0, -5, 5, 0],
                    } : {}}
                    transition={{ repeat: Infinity, duration: 0.5 }}
                >
                    <Flame
                        size={14}
                        className={isLegendary ? 'text-yellow-400' : isOnFire ? 'text-orange-400' : 'text-orange-300'}
                        fill={isOnFire ? 'currentColor' : 'none'}
                    />
                </motion.div>
                <span className={`text-xs font-bold ${isLegendary ? 'text-yellow-400' : 'text-orange-300'}`}>
                    {streak}
                </span>
            </motion.div>
        );
    }

    // Full version
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden bg-gradient-to-br from-orange-900/50 to-red-900/50 backdrop-blur-xl rounded-2xl p-4 border border-orange-500/20"
        >
            {/* Fire glow */}
            {isOnFire && (
                <motion.div
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 bg-gradient-to-t from-orange-500/20 to-transparent"
                />
            )}

            <div className="relative flex items-center gap-4">
                {/* Fire Icon */}
                <motion.div
                    animate={isOnFire ? {
                        scale: [1, 1.1, 1],
                        rotate: [-3, 3, -3],
                    } : {}}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className={`text-4xl ${streak === 0 ? 'grayscale opacity-30' : ''}`}
                >
                    🔥
                </motion.div>

                {/* Text */}
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-orange-400/70">
                        {streak === 0 ? 'Серия не начата' : 'Дней подряд'}
                    </p>
                    <p className={`text-3xl font-bold ${isLegendary ? 'text-yellow-400' : 'text-orange-300'}`}>
                        {streak}
                    </p>
                </div>

                {/* Bonus indicator */}
                {streak >= 7 && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30"
                    >
                        <span className="text-xs font-bold text-orange-300">
                            +{streak >= 30 ? '50' : '25'}% XP
                        </span>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default StreakDisplay;
