import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BreathingPhase } from '../types';

const MotionPath = motion.path as any;
const MotionDiv = motion.div as any;

interface Props {
    phase: BreathingPhase;
    timeLeft: number;
    totalTime: number; 
    currentRound: number;
}

const AnulomaVilomaInterface: React.FC<Props> = ({ 
    phase, 
    timeLeft, 
    totalTime,
    currentRound
}) => {
    const [isLeftHanded, setIsLeftHanded] = useState(false);

    // --- ЛОГИКА РАУНДОВ ---
    const isOddRound = currentRound % 2 !== 0; 

    // --- КОНФИГУРАЦИЯ ---
    const STROKE_WIDTH = 24; 
    
    // SVG Paths (Рисуются СНИЗУ ВВЕРХ)
    const leftPath = "M 70 380 C 70 180 70 60 150 60";
    const rightPath = "M 230 380 C 230 180 230 60 150 60";

    // --- МАТЕМАТИКА ---
    // Вычисляем прогресс (0.0 -> 1.0)
    const rawProgress = totalTime > 0 ? (totalTime - timeLeft) / totalTime : 1;
    const progress = Math.min(Math.max(rawProgress, 0), 1);

    // Цвета
    const COLOR_INHALE = "#22d3ee"; // Cyan
    const COLOR_HOLD = "#a855f7";   // Purple
    const COLOR_EXHALE = "#fb923c"; // Orange
    const COLOR_GLASS = "rgba(255, 255, 255, 0.05)"; 
    
    // --- STATE HELPERS ---
    const emptyState = {
        pathLength: 0,
        pathOffset: 0,
        color: COLOR_INHALE,
        opacity: 0
    };

    let leftState = { ...emptyState };
    let rightState = { ...emptyState };

    let leftLockOpen = false;
    let rightLockOpen = false;
    let mainText = "";
    let subText = "";

    const leftFingerLabel = isLeftHanded ? "БОЛЬШОЙ" : "БЕЗЫМЯННЫЙ";
    const rightFingerLabel = isLeftHanded ? "БЕЗЫМЯННЫЙ" : "БОЛЬШОЙ";

    const setVisuals = (
        targetState: any, 
        length: number, 
        color: string,
        offset: number = 0
    ) => {
        targetState.pathLength = length;
        targetState.pathOffset = offset;
        targetState.color = color;
        // HIDE if length is very small to prevent dot artifacts at 0 or 1 offset
        targetState.opacity = length > 0.01 ? 1 : 0;
    };

    switch (phase) {
        case BreathingPhase.Inhale:
            // Вдох: наполняем от 0 до 1 (снизу вверх)
            if (isOddRound) {
                mainText = "ВДОХ ЛЕВОЙ";
                subText = "ПРАВАЯ ЗАКРЫТА";
                leftLockOpen = true;
                setVisuals(leftState, progress, COLOR_INHALE, 0);
            } else {
                mainText = "ВДОХ ПРАВОЙ";
                subText = "ЛЕВАЯ ЗАКРЫТА";
                rightLockOpen = true;
                setVisuals(rightState, progress, COLOR_INHALE, 0);
            }
            break;

        case BreathingPhase.HoldIn:
            // Задержка: Убывает СНИЗУ ВВЕРХ
            // Эффект: энергия "втягивается" в голову.
            mainText = "ЗАДЕРЖКА";
            subText = "ДЕРЖИТЕ"; 
            leftLockOpen = false;
            rightLockOpen = false;
            
            // progress идет от 0 до 1.
            const currentOffset = progress;
            const currentLength = Math.max(0, 1 - progress);

            if (isOddRound) {
                // Вдыхали левой -> держим левую
                setVisuals(leftState, currentLength, COLOR_HOLD, currentOffset);
            } else {
                // Вдыхали правой -> держим правую
                setVisuals(rightState, currentLength, COLOR_HOLD, currentOffset);
            }
            break;

        case BreathingPhase.Exhale:
            // Выдох: убываем от 1 до 0 (Сверху вниз)
            // При Exhale pathOffset всегда 0 (стандартное поведение pathLength)
            const drainProgress = Math.max(0, 1 - progress);

            if (isOddRound) {
                mainText = "ВЫДОХ ПРАВОЙ";
                subText = "ЛЕВАЯ ЗАКРЫТА";
                rightLockOpen = true;
                
                // Active Side: Right (Draining down)
                setVisuals(rightState, drainProgress, COLOR_EXHALE, 0);

                // Inactive Side: Left (Just finished holding UP)
                // FIX: Keep offset at 1 (top) to prevent jump glitch at bottom
                setVisuals(leftState, 0, COLOR_HOLD, 1);
            } else {
                mainText = "ВЫДОХ ЛЕВОЙ";
                subText = "ПРАВАЯ ЗАКРЫТА";
                leftLockOpen = true;

                // Active Side: Left (Draining down)
                setVisuals(leftState, drainProgress, COLOR_EXHALE, 0);

                // Inactive Side: Right (Just finished holding UP)
                // FIX: Keep offset at 1 (top) to prevent jump glitch at bottom
                setVisuals(rightState, 0, COLOR_HOLD, 1);
            }
            break;
            
        default: 
            mainText = "ГОТОВНОСТЬ";
            subText = "РАССЛАБЬТЕСЬ";
            leftLockOpen = true;
            rightLockOpen = true;
            break;
    }

    const transitionConfig = {
        pathLength: { duration: 0, ease: "linear" }, 
        pathOffset: { duration: 0, ease: "linear" },
        stroke: { duration: 0.2 }, // Slightly faster color transition
        opacity: { duration: 0.1 }, // Fast fade in/out
    };

    return (
        <div className="w-full flex flex-col items-center justify-center relative min-h-[500px]">
            <div className="relative w-[340px] h-[500px] flex items-center justify-center">
                
                <svg viewBox="-40 -40 380 550" className="absolute inset-0 w-full h-full overflow-visible z-10 pointer-events-none">
                    <defs>
                        <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* 1. BACKGROUND TUBES (GLASS) */}
                    <path d={leftPath} stroke={COLOR_GLASS} strokeWidth={STROKE_WIDTH} fill="none" strokeLinecap="round" />
                    <path d={rightPath} stroke={COLOR_GLASS} strokeWidth={STROKE_WIDTH} fill="none" strokeLinecap="round" />
                    
                    {/* 2. ACTIVE LIQUID LAYER */}
                    
                    {/* LEFT SIDE */}
                    <MotionPath
                        d={leftPath}
                        fill="none"
                        strokeWidth={STROKE_WIDTH}
                        strokeLinecap="round"
                        filter="url(#neonGlow)"
                        initial={{ pathLength: 0 }}
                        animate={{ 
                            stroke: leftState.color,
                            pathLength: leftState.pathLength,
                            pathOffset: leftState.pathOffset || 0,
                            opacity: leftState.opacity,
                        }}
                        transition={transitionConfig}
                    />

                    {/* RIGHT SIDE */}
                    <MotionPath
                        d={rightPath}
                        fill="none"
                        strokeWidth={STROKE_WIDTH}
                        strokeLinecap="round"
                        filter="url(#neonGlow)"
                        initial={{ pathLength: 0 }}
                        animate={{ 
                            stroke: rightState.color,
                            pathLength: rightState.pathLength,
                            pathOffset: rightState.pathOffset || 0,
                            opacity: rightState.opacity,
                        }}
                        transition={transitionConfig}
                    />

                    {/* 3. CENTER CONNECTOR */}
                    <circle cx="150" cy="60" r="6" fill="rgba(255,255,255,0.1)" />
                    
                    {/* Pulsing indicator during Hold */}
                    {phase === BreathingPhase.HoldIn && (
                        <MotionDiv
                            key="hold-pulse"
                            className="origin-center"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        >
                            <circle cx="150" cy="60" r="16" fill={COLOR_HOLD} filter="url(#neonGlow)" opacity="0.4" />
                        </MotionDiv>
                    )}
                    <circle cx="150" cy="60" r="4" fill="white" opacity="0.8" />

                    {/* --- CONTROLS LAYER (LOCKS + SWITCHER) --- */}
                    
                    {/* LEFT LOCK */}
                    <foreignObject x="30" y="350" width="80" height="90">
                        <div className="flex flex-col items-center justify-center h-full">
                            <MotionDiv 
                                animate={{
                                    borderColor: leftLockOpen ? leftState.color : 'rgba(255,255,255,0.05)',
                                    backgroundColor: leftLockOpen ? 'rgba(255,255,255,0.05)' : 'transparent',
                                    scale: leftLockOpen ? 1.1 : 1
                                }}
                                className={`
                                    w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300
                                    ${leftLockOpen ? 'text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'text-rose-500/50'}
                                `}
                            >
                                <i className={`fas fa-${leftLockOpen ? 'lock-open' : 'lock'} text-base`}></i>
                            </MotionDiv>
                            <span className="mt-3 text-[9px] font-bold uppercase text-zinc-500 tracking-widest transition-all duration-300">
                                {leftFingerLabel}
                            </span>
                        </div>
                    </foreignObject>

                    {/* HAND SWITCHER (CENTER) */}
                    <foreignObject x="110" y="360" width="80" height="60">
                        <div className="flex flex-col items-center justify-center h-full pointer-events-auto">
                            <button 
                                onClick={() => setIsLeftHanded(!isLeftHanded)}
                                className="group flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform"
                                title="Сменить руку (Левша/Правша)"
                            >
                                <div className={`
                                    w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300
                                    ${isLeftHanded ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' : 'bg-cyan-500/20 border-cyan-500 text-cyan-400'}
                                `}>
                                    <i className={`fas fa-hand-paper text-xs ${isLeftHanded ? '-scale-x-100' : ''} transition-transform duration-300`}></i>
                                </div>
                                <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-wide group-hover:text-white transition-colors">
                                    {isLeftHanded ? 'Лев. Рука' : 'Пр. Рука'}
                                </span>
                            </button>
                        </div>
                    </foreignObject>

                    {/* RIGHT LOCK */}
                    <foreignObject x="190" y="350" width="80" height="90">
                        <div className="flex flex-col items-center justify-center h-full">
                            <MotionDiv 
                                animate={{
                                    borderColor: rightLockOpen ? rightState.color : 'rgba(255,255,255,0.05)',
                                    backgroundColor: rightLockOpen ? 'rgba(255,255,255,0.05)' : 'transparent',
                                    scale: rightLockOpen ? 1.1 : 1
                                }}
                                className={`
                                    w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300
                                    ${rightLockOpen ? 'text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'text-rose-500/50'}
                                `}
                            >
                                <i className={`fas fa-${rightLockOpen ? 'lock-open' : 'lock'} text-base`}></i>
                            </MotionDiv>
                            <span className="mt-3 text-[9px] font-bold uppercase text-zinc-500 tracking-widest transition-all duration-300">
                                {rightFingerLabel}
                            </span>
                        </div>
                    </foreignObject>

                </svg>

                {/* INFO TEXT */}
                <div className="absolute top-[35%] flex flex-col items-center z-50 pointer-events-none max-w-[120px] text-center">
                    <span className="text-7xl font-display font-bold text-white tabular-nums drop-shadow-2xl mb-2">
                        {Math.ceil(timeLeft)}
                    </span>
                    
                    <div className="flex flex-col items-center gap-2 w-full">
                        <MotionDiv 
                            animate={{ 
                                color: phase === BreathingPhase.HoldIn ? COLOR_HOLD : 
                                       (phase === BreathingPhase.Inhale ? COLOR_INHALE : COLOR_EXHALE) 
                            }}
                            className="text-xs font-bold tracking-wide uppercase leading-tight whitespace-normal break-words w-full"
                        >
                            {mainText}
                        </MotionDiv>
                        
                        <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-xl border border-white/10">
                            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                {subText}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnulomaVilomaInterface;