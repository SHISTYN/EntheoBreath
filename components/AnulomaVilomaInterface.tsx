import React from 'react';
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
    
    const isOddRound = currentRound % 2 !== 0; 

    // --- CONFIGURATION ---
    const STROKE_WIDTH = 24; 
    const PATH_LENGTH = 350; 
    
    // SVG Paths (Рисуются СНИЗУ ВВЕРХ)
    const leftPath = "M 70 380 C 70 180 70 60 150 60";
    const rightPath = "M 230 380 C 230 180 230 60 150 60";

    // --- MATHEMATICS (0.0 -> 1.0) ---
    const rawProgress = totalTime > 0 ? (totalTime - timeLeft) / totalTime : 1;
    const progress = Math.min(Math.max(rawProgress, 0), 1);

    // Colors
    const COLOR_INHALE = "#22d3ee"; // Cyan
    const COLOR_HOLD = "#a855f7";   // Purple
    const COLOR_EXHALE = "#fb923c"; // Orange
    
    // Logic Variables
    let leftDash = 0; // The active moving part
    let rightDash = 0;
    
    // Base Dash (Background layer for HOLD phase)
    // Когда идет задержка, трубка должна быть уже "полной" голубым цветом,
    // а поверх нее ползет фиолетовый.
    let leftBaseDash = 0;
    let rightBaseDash = 0;

    let leftColor = COLOR_INHALE;
    let rightColor = COLOR_INHALE;
    
    let leftLockOpen = false;
    let rightLockOpen = false;
    
    let mainText = "";
    let subText = "";

    switch (phase) {
        case BreathingPhase.Inhale:
            if (isOddRound) {
                // ВДОХ ЛЕВОЙ
                mainText = "ВДОХ ЛЕВОЙ";
                subText = "ПРАВАЯ ЗАКРЫТА";
                leftLockOpen = true;
                
                // Левая наполняется СНИЗУ ВВЕРХ
                leftDash = progress * PATH_LENGTH;
                leftColor = COLOR_INHALE;
                // База не нужна, мы рисуем саму жидкость
            } else {
                // ВДОХ ПРАВОЙ
                mainText = "ВДОХ ПРАВОЙ";
                subText = "ЛЕВАЯ ЗАКРЫТА";
                rightLockOpen = true;

                // Правая наполняется СНИЗУ ВВЕРХ
                rightDash = progress * PATH_LENGTH;
                rightColor = COLOR_INHALE;
            }
            break;

        case BreathingPhase.HoldIn:
            mainText = "ЗАДЕРЖКА";
            subText = "ДЕРЖИТЕ"; 
            leftLockOpen = false;
            rightLockOpen = false;
            
            // --- LOGIC FIX: FILL THE *SAME* TUBE PURPLE ---
            
            if (isOddRound) {
                // Вдохнули левой -> Держим в Левой
                // Левая трубка полностью голубая (Base), и поверх нее ползет Фиолетовый (Active)
                leftBaseDash = PATH_LENGTH; // Full Cyan Background
                
                leftDash = progress * PATH_LENGTH; // Purple rising
                leftColor = COLOR_HOLD;
                
                // Правая пустая
            } else {
                // Вдохнули Правой -> Держим в Правой
                rightBaseDash = PATH_LENGTH; // Full Cyan Background
                
                rightDash = progress * PATH_LENGTH; // Purple rising
                rightColor = COLOR_HOLD;
                
                // Левая пустая
            }
            break;

        case BreathingPhase.Exhale:
            // Выдох идет СВЕРХУ ВНИЗ (уменьшение Dash)
            const drain = (1 - progress) * PATH_LENGTH;

            if (isOddRound) {
                // Выдох ПРАВОЙ (Смена стороны произошла)
                mainText = "ВЫДОХ ПРАВОЙ";
                subText = "ЛЕВАЯ ЗАКРЫТА";
                rightLockOpen = true;

                // Правая полная и опускается
                rightDash = drain;
                rightColor = COLOR_EXHALE;
            } else {
                // Выдох ЛЕВОЙ
                mainText = "ВЫДОХ ЛЕВОЙ";
                subText = "ПРАВАЯ ЗАКРЫТА";
                leftLockOpen = true;

                leftDash = drain;
                leftColor = COLOR_EXHALE;
            }
            break;
            
        default: // Ready / Done
            mainText = "ГОТОВНОСТЬ";
            leftLockOpen = true;
            rightLockOpen = true;
            break;
    }

    return (
        <div className="w-full flex flex-col items-center justify-center relative min-h-[500px]">
            <div className="relative w-[340px] h-[500px] flex items-center justify-center">
                
                <svg viewBox="-40 -40 380 550" className="absolute inset-0 w-full h-full overflow-visible z-10 pointer-events-none">
                    <defs>
                        <filter id="liquidGlow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                        
                        <linearGradient id="tubeBg" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="rgba(255,255,255,0.02)" />
                            <stop offset="100%" stopColor="rgba(255,255,255,0.08)" />
                        </linearGradient>
                    </defs>

                    {/* 1. GLASS TUBES (Empty Structure) */}
                    <path d={leftPath} stroke="url(#tubeBg)" strokeWidth={STROKE_WIDTH} fill="none" strokeLinecap="round" />
                    <path d={rightPath} stroke="url(#tubeBg)" strokeWidth={STROKE_WIDTH} fill="none" strokeLinecap="round" />
                    
                    {/* 2. BASE LIQUID (Used during Hold to show Cyan background behind Purple) */}
                    {/* Left Base */}
                    <MotionPath
                        d={leftPath}
                        fill="none"
                        strokeWidth={STROKE_WIDTH}
                        strokeLinecap="round"
                        stroke={COLOR_INHALE} // Always Cyan base
                        animate={{ 
                            strokeDasharray: `${leftBaseDash} ${PATH_LENGTH}`,
                            opacity: leftBaseDash > 0 ? 1 : 0
                        }}
                        transition={{ duration: 0 }}
                        style={{ filter: 'url(#liquidGlow)' }}
                    />
                    {/* Right Base */}
                    <MotionPath
                        d={rightPath}
                        fill="none"
                        strokeWidth={STROKE_WIDTH}
                        strokeLinecap="round"
                        stroke={COLOR_INHALE} // Always Cyan base
                        animate={{ 
                            strokeDasharray: `${rightBaseDash} ${PATH_LENGTH}`,
                            opacity: rightBaseDash > 0 ? 1 : 0
                        }}
                        transition={{ duration: 0 }}
                        style={{ filter: 'url(#liquidGlow)' }}
                    />

                    {/* 3. ACTIVE LIQUID ANIMATION (Foreground) */}
                    {/* Left Active */}
                    <MotionPath
                        d={leftPath}
                        fill="none"
                        strokeWidth={STROKE_WIDTH}
                        strokeLinecap="round"
                        filter="url(#liquidGlow)"
                        animate={{ 
                            stroke: leftColor,
                            strokeDasharray: `${leftDash} ${PATH_LENGTH}`,
                            opacity: leftDash > 0 ? 1 : 0
                        }}
                        transition={{ 
                            stroke: { duration: 0.2 },
                            strokeDasharray: { duration: 0 },
                            opacity: { duration: 0.1 }
                        }}
                    />

                    {/* Right Active */}
                    <MotionPath
                        d={rightPath}
                        fill="none"
                        strokeWidth={STROKE_WIDTH}
                        strokeLinecap="round"
                        filter="url(#liquidGlow)"
                        animate={{ 
                            stroke: rightColor,
                            strokeDasharray: `${rightDash} ${PATH_LENGTH}`,
                            opacity: rightDash > 0 ? 1 : 0
                        }}
                        transition={{ 
                            stroke: { duration: 0.2 },
                            strokeDasharray: { duration: 0 },
                            opacity: { duration: 0.1 }
                        }}
                    />

                    {/* 4. CENTER CONNECTOR */}
                    <circle cx="150" cy="60" r="6" fill="rgba(255,255,255,0.1)" />
                    
                    {/* Pulsing indicator during Hold */}
                    {phase === BreathingPhase.HoldIn && (
                        <MotionDiv
                            className="origin-center"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: [1, 1.3, 1], opacity: 1 }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        >
                            <circle cx="150" cy="60" r="14" fill={COLOR_HOLD} filter="url(#liquidGlow)" opacity="0.4" />
                            <circle cx="150" cy="60" r="6" fill="white" />
                        </MotionDiv>
                    )}

                    {/* 5. LOCKS (ICONS) */}
                    {/* LEFT LOCK */}
                    <foreignObject x="30" y="350" width="80" height="80">
                        <div className="flex flex-col items-center justify-center h-full">
                            <MotionDiv 
                                animate={{
                                    borderColor: leftLockOpen ? leftColor : 'rgba(255,255,255,0.05)',
                                    boxShadow: leftLockOpen ? `0 0 20px ${leftColor}40` : 'none'
                                }}
                                transition={{ duration: 0.5 }}
                                className={`
                                    w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all
                                    ${leftLockOpen 
                                        ? `text-white bg-white/10` 
                                        : 'text-rose-500/50 bg-transparent'
                                    }
                                `}
                            >
                                <i className={`fas fa-${leftLockOpen ? 'lock-open' : 'lock'} text-xl`}></i>
                            </MotionDiv>
                            <span className="mt-2 text-[9px] font-bold uppercase text-zinc-600 dark:text-zinc-500 tracking-widest">Безымянный</span>
                        </div>
                    </foreignObject>

                    {/* RIGHT LOCK */}
                    <foreignObject x="190" y="350" width="80" height="80">
                        <div className="flex flex-col items-center justify-center h-full">
                            <MotionDiv 
                                animate={{
                                    borderColor: rightLockOpen ? rightColor : 'rgba(255,255,255,0.05)',
                                    boxShadow: rightLockOpen ? `0 0 20px ${rightColor}40` : 'none'
                                }}
                                transition={{ duration: 0.5 }}
                                className={`
                                    w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all
                                    ${rightLockOpen 
                                        ? `text-white bg-white/10` 
                                        : 'text-rose-500/50 bg-transparent'
                                    }
                                `}
                            >
                                <i className={`fas fa-${rightLockOpen ? 'lock-open' : 'lock'} text-xl`}></i>
                            </MotionDiv>
                            <span className="mt-2 text-[9px] font-bold uppercase text-zinc-600 dark:text-zinc-500 tracking-widest">Большой</span>
                        </div>
                    </foreignObject>

                </svg>

                {/* INFO - FIXED OVERLAP */}
                {/* 
                   Changed max-w to 120px to force text wrapping if needed,
                   preventing it from hitting the tubes.
                */}
                <div className="absolute top-[35%] flex flex-col items-center z-20 pointer-events-none max-w-[120px] text-center">
                    <span className="text-8xl font-display font-bold text-white tabular-nums drop-shadow-2xl mb-2">
                        {Math.ceil(timeLeft)}
                    </span>
                    
                    <div className="flex flex-col items-center gap-2 w-full">
                        <MotionDiv 
                            animate={{ color: phase === BreathingPhase.HoldIn ? COLOR_HOLD : (phase === BreathingPhase.Inhale ? COLOR_INHALE : COLOR_EXHALE) }}
                            transition={{ duration: 0.5 }}
                            className="text-xs font-bold tracking-wide uppercase leading-tight whitespace-normal"
                        >
                            {mainText}
                        </MotionDiv>
                        
                        <div className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/5">
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
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