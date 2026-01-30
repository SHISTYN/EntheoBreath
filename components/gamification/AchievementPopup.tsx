
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Achievement } from '../../hooks/useGamification';

interface AchievementPopupProps {
    achievement: Achievement | null;
    onClose: () => void;
}

const AchievementPopup: React.FC<AchievementPopupProps> = ({ achievement, onClose }) => {
    if (!achievement) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 100, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -50, scale: 0.8 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] pointer-events-auto"
                onClick={onClose}
            >
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/30 via-amber-500/30 to-orange-500/30 blur-3xl rounded-full" />

                {/* Main Card */}
                <motion.div
                    initial={{ rotateY: -180 }}
                    animate={{ rotateY: 0 }}
                    transition={{ delay: 0.2, duration: 0.6, type: 'spring' }}
                    className="relative flex items-center gap-4 px-6 py-4 bg-gradient-to-br from-amber-900/90 to-yellow-900/90 backdrop-blur-xl rounded-2xl border border-yellow-500/30 shadow-[0_0_60px_-15px_rgba(251,191,36,0.5)]"
                >
                    {/* Icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.4, type: 'spring', stiffness: 400 }}
                        className="text-5xl"
                    >
                        {achievement.icon}
                    </motion.div>

                    {/* Text */}
                    <div className="flex flex-col">
                        <motion.span
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="text-[10px] font-bold uppercase tracking-widest text-yellow-400/80"
                        >
                            Достижение разблокировано!
                        </motion.span>
                        <motion.h3
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            className="text-xl font-bold text-white"
                        >
                            {achievement.name}
                        </motion.h3>
                        <motion.p
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 }}
                            className="text-sm text-yellow-300/70"
                        >
                            {achievement.description}
                        </motion.p>
                    </div>

                    {/* Sparkles */}
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{
                                opacity: [0, 1, 0],
                                scale: [0, 1.5, 0],
                                x: [0, (Math.random() - 0.5) * 100],
                                y: [0, (Math.random() - 0.5) * 100],
                            }}
                            transition={{ delay: 0.3 + i * 0.1, duration: 1.5 }}
                            className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                            style={{ left: '50%', top: '50%' }}
                        />
                    ))}
                </motion.div>

                {/* Tap to dismiss hint */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="text-center text-xs text-white/40 mt-2"
                >
                    Нажмите, чтобы закрыть
                </motion.p>
            </motion.div>
        </AnimatePresence>
    );
};

export default AchievementPopup;
