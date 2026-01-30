import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Zap, X, ShieldCheck } from 'lucide-react';
import { liquidVariants } from '../../config/animations';
import { notificationService } from '../../services/notificationService';
import { LiquidButton } from '../ui/LiquidButton';

interface NotificationRequestProps {
    isOpen: boolean;
    onClose: () => void;
    onGranted: () => void;
}

export const NotificationRequest: React.FC<NotificationRequestProps> = ({ isOpen, onClose, onGranted }) => {
    const [isRequesting, setIsRequesting] = useState(false);

    const handleEnable = async () => {
        setIsRequesting(true);
        const granted = await notificationService.requestPermission();
        setIsRequesting(false);
        if (granted) {
            notificationService.scheduleTestNotification(); // Instant gratification
            onGranted();
            onClose();
        } else {
            // User denied or closed browser prompt
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={onClose}
            />

            <motion.div
                variants={liquidVariants.modal}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="relative w-full max-w-sm bg-[#1c1c1e]/90 backdrop-blur-2xl rounded-[32px] border border-white/10 shadow-2xl p-6 md:p-8 overflow-hidden"
            >
                {/* Visual Header */}
                <div className="flex justify-center mb-6 relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-600/20 flex items-center justify-center border border-white/10 relative z-10">
                        <Bell size={32} className="text-cyan-400 animate-wiggle" />
                    </div>
                    <div className="absolute inset-0 bg-cyan-500/20 blur-[40px] animate-pulse-slow"></div>
                </div>

                <div className="text-center space-y-2 mb-8 relative z-10">
                    <h3 className="text-2xl font-display font-bold text-white">
                        Не теряй прогресс
                    </h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        Разреши нам напоминать о практике раз в день. Это поможет сохранить Streak 🔥 и улучшить здоровье.
                    </p>
                </div>

                {/* Benefits List */}
                <div className="space-y-3 mb-8 relative z-10">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                        <Zap size={18} className="text-amber-400" />
                        <span className="text-xs font-bold text-zinc-300">Сохранение серии (Streak)</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                        <ShieldCheck size={18} className="text-green-400" />
                        <span className="text-xs font-bold text-zinc-300">Утренний настрой (Morning Glory)</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-3 relative z-10">
                    <LiquidButton
                        variant="primary"
                        className="w-full justify-center"
                        onClick={handleEnable}
                        disabled={isRequesting}
                    >
                        {isRequesting ? 'Ожидание...' : 'Включить уведомления'}
                    </LiquidButton>

                    <button
                        onClick={onClose}
                        className="w-full py-3 text-xs font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest"
                    >
                        В другой раз
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
