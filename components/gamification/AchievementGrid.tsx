
import React from 'react';
import { motion } from 'framer-motion';
import { Achievement, ACHIEVEMENTS_LIST } from '../../hooks/useGamification';
import { Lock } from 'lucide-react';

interface AchievementGridProps {
    unlockedAchievements: Achievement[];
}

const AchievementGrid: React.FC<AchievementGridProps> = ({ unlockedAchievements }) => {
    const unlockedIds = new Set(unlockedAchievements.map(a => a.id));

    return (
        <div className="w-full">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span>🏆</span> Достижения
                <span className="text-sm font-normal text-zinc-500">
                    ({unlockedAchievements.length}/{ACHIEVEMENTS_LIST.length})
                </span>
            </h3>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {ACHIEVEMENTS_LIST.map((achievement, index) => {
                    const isUnlocked = unlockedIds.has(achievement.id);
                    const unlockedData = unlockedAchievements.find(a => a.id === achievement.id);

                    return (
                        <motion.div
                            key={achievement.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className={`
                group relative aspect-square rounded-2xl p-3 flex flex-col items-center justify-center
                transition-all duration-300 cursor-pointer
                ${isUnlocked
                                    ? 'bg-gradient-to-br from-amber-900/50 to-yellow-900/50 border border-yellow-500/30 hover:border-yellow-500/50 shadow-[0_0_20px_-5px_rgba(251,191,36,0.3)]'
                                    : 'bg-white/5 border border-white/10 hover:border-white/20'
                                }
              `}
                            title={`${achievement.name}: ${achievement.description}`}
                        >
                            {/* Icon */}
                            <div className={`text-3xl mb-1 ${isUnlocked ? '' : 'grayscale opacity-30'}`}>
                                {isUnlocked ? achievement.icon : <Lock size={24} className="text-zinc-500" />}
                            </div>

                            {/* Name */}
                            <p className={`text-[10px] font-medium text-center leading-tight ${isUnlocked ? 'text-yellow-300' : 'text-zinc-500'}`}>
                                {achievement.name}
                            </p>

                            {/* Tooltip on hover */}
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                <div className="bg-black/90 backdrop-blur-md rounded-xl px-3 py-2 border border-white/10 shadow-xl whitespace-nowrap">
                                    <p className="text-xs font-bold text-white">{achievement.name}</p>
                                    <p className="text-[10px] text-zinc-400">{achievement.description}</p>
                                    {unlockedData?.unlockedAt && (
                                        <p className="text-[10px] text-green-400 mt-1">
                                            ✓ {new Date(unlockedData.unlockedAt).toLocaleDateString('ru-RU')}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Shimmer for unlocked */}
                            {isUnlocked && (
                                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-500/10 to-transparent animate-shimmer-slow" />
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default AchievementGrid;
