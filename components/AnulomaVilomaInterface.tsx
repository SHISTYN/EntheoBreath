import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, ArrowDown, X } from 'lucide-react';
import { BreathingPhase, BreathingPattern } from '../types';

interface Props {
    phase: BreathingPhase;
    timeLeft: number;
    totalTime: number;
    currentRound: number;
    onPatternUpdate?: (pattern: Partial<BreathingPattern>) => void;
    activePattern?: BreathingPattern;
}

const AnulomaVilomaInterface: React.FC<Props> = ({ 
    phase, 
    timeLeft, 
    currentRound
}) => {
    
    // --- 1. CORE LOGIC ---
    const isOddRound = currentRound % 2 !== 0; 
    
    // Visual State Types
    type IconType = 'up' | 'down' | 'block';
    type SideState = { icon: IconType; color: string; label: string; active: boolean };

    let leftState: SideState = { icon: 'block', color: 'text-zinc-700', label: 'ЗАКРЫТО', active: false };
    let rightState: SideState = { icon: 'block', color: 'text-zinc-700', label: 'ЗАКРЫТО', active: false };
    
    let mainLabel = "";
    
    // --- MAPPING LOGIC ---
    
    if (phase === BreathingPhase.Inhale) {
        if (isOddRound) {
            // Inhale Left -> Right Blocked
            leftState = { icon: 'up', color: 'text-cyan-400', label: 'ВДОХ', active: true };
            rightState = { icon: 'block', color: 'text-zinc-600', label: 'ЗАКРЫТО', active: false };
            mainLabel = "ВДОХ ЛЕВОЙ";
        } else {
            // Inhale Right -> Left Blocked
            leftState = { icon: 'block', color: 'text-zinc-600', label: 'ЗАКРЫТО', active: false };
            rightState = { icon: 'up', color: 'text-cyan-400', label: 'ВДОХ', active: true };
            mainLabel = "ВДОХ ПРАВОЙ";
        }
    } else if (phase === BreathingPhase.Exhale) {
        if (isOddRound) {
            // Exhale Right -> Left Blocked
            leftState = { icon: 'block', color: 'text-zinc-600', label: 'ЗАКРЫТО', active: false };
            rightState = { icon: 'down', color: 'text-orange-400', label: 'ВЫДОХ', active: true };
            mainLabel = "ВЫДОХ ПРАВОЙ";
        } else {
            // Exhale Left -> Right Blocked
            leftState = { icon: 'down', color: 'text-orange-400', label: 'ВЫДОХ', active: true };
            rightState = { icon: 'block', color: 'text-zinc-600', label: 'ЗАКРЫТО', active: false };
            mainLabel = "ВЫДОХ ЛЕВОЙ";
        }
    } else if (phase === BreathingPhase.HoldIn || phase === BreathingPhase.HoldOut) {
        // Hold -> Both Blocked
        leftState = { icon: 'block', color: 'text-zinc-600', label: 'ДЕРЖАТЬ', active: false };
        rightState = { icon: 'block', color: 'text-zinc-600', label: 'ДЕРЖАТЬ', active: false };
        mainLabel = "ЗАДЕРЖКА";
    } else {
        // Ready
        mainLabel = "ПРИГОТОВЬТЕСЬ";
    }

    // --- HELPER COMPONENT FOR ICONS ---
    const StatusIcon = ({ type, className }: { type: IconType, className: string }) => {
        if (type === 'up') return <ArrowUp className={`w-16 h-16 md:w-24 md:h-24 ${className}`} strokeWidth={3} />;
        if (type === 'down') return <ArrowDown className={`w-16 h-16 md:w-24 md:h-24 ${className}`} strokeWidth={3} />;
        return <X className={`w-16 h-16 md:w-24 md:h-24 ${className}`} strokeWidth={3} />;
    };

    return (
        <div className="relative w-full flex flex-col items-center justify-center py-4 select-none font-sans min-h-[60vh]">
            
            {/* --- TIMER (HUGE) --- */}
            <div className="flex flex-col items-center justify-center z-20 mb-12 pointer-events-none">
                 <motion.span 
                    key={Math.ceil(timeLeft)}
                    initial={{ scale: 0.95, opacity: 0.9 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-[120px] md:text-[180px] font-display font-black text-white tabular-nums tracking-tighter leading-none drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                 >
                    {Math.ceil(timeLeft)}
                 </motion.span>
            </div>

            {/* --- DASHBOARD (SYMBOLS) --- */}
            <div className="flex items-center justify-center gap-8 md:gap-16 mb-12 w-full max-w-2xl px-4">
                
                {/* LEFT NOSTRIL ZONE */}
                <div className="flex flex-col items-center gap-4 flex-1">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Левая</span>
                    <motion.div 
                        key={`L-${leftState.icon}`}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`
                            relative w-28 h-28 md:w-40 md:h-40 rounded-3xl flex items-center justify-center
                            border-2 transition-all duration-300
                            ${leftState.active 
                                ? `bg-white/5 border-white/20 shadow-2xl ${leftState.icon === 'up' ? 'shadow-cyan-500/20' : 'shadow-orange-500/20'}` 
                                : 'bg-black/20 border-white/5 opacity-50'}
                        `}
                    >
                        <StatusIcon type={leftState.icon} className={leftState.color} />
                    </motion.div>
                    <span className={`text-[10px] md:text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-white/5 ${leftState.active ? 'text-white' : 'text-zinc-600'}`}>
                        {leftState.label}
                    </span>
                </div>

                {/* CENTER DIVIDER (Optional visual anchor) */}
                <div className="h-32 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>

                {/* RIGHT NOSTRIL ZONE */}
                <div className="flex flex-col items-center gap-4 flex-1">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Правая</span>
                    <motion.div 
                        key={`R-${rightState.icon}`}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`
                            relative w-28 h-28 md:w-40 md:h-40 rounded-3xl flex items-center justify-center
                            border-2 transition-all duration-300
                            ${rightState.active 
                                ? `bg-white/5 border-white/20 shadow-2xl ${rightState.icon === 'up' ? 'shadow-cyan-500/20' : 'shadow-orange-500/20'}` 
                                : 'bg-black/20 border-white/5 opacity-50'}
                        `}
                    >
                        <StatusIcon type={rightState.icon} className={rightState.color} />
                    </motion.div>
                    <span className={`text-[10px] md:text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-white/5 ${rightState.active ? 'text-white' : 'text-zinc-600'}`}>
                        {rightState.label}
                    </span>
                </div>

            </div>

            {/* --- INSTRUCTIONS (HUGE) --- */}
            <div className="flex flex-col items-center w-full px-4 z-20 text-center mt-auto">
                <AnimatePresence mode="wait">
                    <motion.h2 
                        key={mainLabel}
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 1.1, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="text-4xl md:text-6xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 tracking-tight drop-shadow-lg leading-tight"
                    >
                        {mainLabel}
                    </motion.h2>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AnulomaVilomaInterface;