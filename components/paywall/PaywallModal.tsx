import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Star, Zap, Crown, Infinity } from 'lucide-react';
import { liquidVariants } from '../../config/animations';
import { usePro } from '../../hooks/usePro';
import { LiquidButton } from '../ui/LiquidButton';

interface PaywallModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({ isOpen, onClose }) => {
    const { upgradeToPro, restorePurchases } = usePro();
    const [selectedPlan, setSelectedPlan] = useState<'year' | 'lifetime'>('year');
    const [isPurchasing, setIsPurchasing] = useState(false);

    const handlePurchase = async () => {
        setIsPurchasing(true);
        await upgradeToPro();
        setIsPurchasing(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-xl"
                onClick={onClose}
            />

            <motion.div
                variants={liquidVariants.modal}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="relative w-full max-w-lg bg-[#0f0f10] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden z-20 flex flex-col max-h-[90vh]"
            >
                {/* Background FX */}
                <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-cyan-900/20 via-purple-900/10 to-transparent pointer-events-none" />
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/20 blur-[80px] rounded-full pointer-events-none" />
                <div className="absolute top-40 -left-20 w-48 h-48 bg-purple-500/20 blur-[60px] rounded-full pointer-events-none" />

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 z-30 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                >
                    <X size={20} className="text-zinc-400" />
                </button>

                <div className="p-6 md:p-8 flex flex-col h-full overflow-y-auto custom-scrollbar">

                    {/* Header */}
                    <div className="text-center mb-8 relative">
                        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20 mb-4 transform rotate-3">
                            <Crown size={32} className="text-white drop-shadow-md" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-2 tracking-tight">
                            Entheo<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">Pro</span>
                        </h2>
                        <p className="text-zinc-400 text-sm md:text-base px-4">
                            Разблокируй полную силу своего дыхания.
                        </p>
                    </div>

                    {/* Features */}
                    <div className="space-y-3 mb-8">
                        {[
                            'Доступ ко всем техникам (Wim Hof)',
                            'Безлимитное время практики',
                            'Настройка звуков окружения',
                            'Расширенная статистика и история'
                        ].map((feat, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
                                    <Check size={12} className="text-cyan-400" />
                                </div>
                                <span className="text-zinc-300 font-medium text-sm">{feat}</span>
                            </div>
                        ))}
                    </div>

                    {/* Plans Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        {/* Yearly Plan */}
                        <div
                            onClick={() => setSelectedPlan('year')}
                            className={`relative p-4 rounded-3xl border transition-all cursor-pointer ${selectedPlan === 'year'
                                    ? 'bg-gradient-to-b from-white/10 to-white/5 border-cyan-500/50 shadow-[0_0_30px_-10px_rgba(6,182,212,0.3)]'
                                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                                }`}
                        >
                            {selectedPlan === 'year' && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500 text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                                    Хит
                                </div>
                            )}
                            <div className="text-center">
                                <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Год</div>
                                <div className="text-2xl font-bold text-white mb-1">₽3,990</div>
                                <div className="text-[10px] text-zinc-500">₽332 / мес</div>
                            </div>
                        </div>

                        {/* Lifetime Plan */}
                        <div
                            onClick={() => setSelectedPlan('lifetime')}
                            className={`relative p-4 rounded-3xl border transition-all cursor-pointer ${selectedPlan === 'lifetime'
                                    ? 'bg-gradient-to-b from-amber-500/20 to-orange-600/10 border-amber-500/50 shadow-[0_0_30px_-10px_rgba(245,158,11,0.3)]'
                                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                                }`}
                        >
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                                    <Infinity size={12} /> Навсегда
                                </div>
                                <div className="text-2xl font-bold text-white mb-1">₽9,990</div>
                                <div className="text-[10px] text-zinc-500">Один платеж</div>
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="mt-auto space-y-4">
                        <LiquidButton
                            variant="primary"
                            className="w-full justify-center !py-4 !text-lg bg-gradient-to-r from-amber-400 to-orange-500 text-black border-none shadow-glow-gold hover:shadow-glow-gold-lg"
                            onClick={handlePurchase}
                            disabled={isPurchasing}
                        >
                            {isPurchasing ? 'Обработка...' : (selectedPlan === 'year' ? 'Попробовать бесплатно' : 'Купить навсегда')}
                        </LiquidButton>

                        <p className="text-center text-[10px] text-zinc-600">
                            7 дней бесплатно, затем ₽3,990 в год. Отмена в любой момент.
                        </p>

                        <button
                            onClick={restorePurchases}
                            className="w-full text-center text-xs font-medium text-zinc-500 hover:text-white transition-colors"
                        >
                            Восстановить покупки
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
