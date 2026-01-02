
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BreathingPhase } from '../types';

interface BoxTimerProps {
    phase: BreathingPhase;
    timeLeft: number;
    totalTimeForPhase: number;
    currentRound: number;
    totalRounds: number;
    label: string;
}

const BoxTimerVisual: React.FC<BoxTimerProps> = ({ 
    phase, 
    timeLeft, 
    totalTimeForPhase, 
    currentRound,
    totalRounds,
    label
}) => {

    // --- 1. CONFIGURATION ---
    // Canvas size
    const SIZE = 400;
    const PADDING = 60; 
    
    // Coordinates (Sharp Square)
    // 0,0 is top left of SVG.
    const min = PADDING;
    const max = SIZE - PADDING;
    
    // --- 2. PATH DEFINITION (CLOCKWISE STARTING BOTTOM-LEFT) ---
    // M x y (Move to Bottom-Left)
    // L x y (Line to Top-Left) -> UP (Inhale)
    // L x y (Line to Top-Right) -> RIGHT (Hold)
    // L x y (Line to Bottom-Right) -> DOWN (Exhale)
    // L x y (Line to Bottom-Left) -> LEFT (Hold Empty)
    const boxPath = useMemo(() => `
        M ${min} ${max}
        L ${min} ${min}
        L ${max} ${min}
        L ${max} ${max}
        L ${min} ${max}
    `, [min, max]);

    // --- 3. PROGRESS LOGIC ---
    // Normalize time to 0..1 for current phase
    const phaseProgress = totalTimeForPhase > 0 ? (1 - timeLeft / totalTimeForPhase) : 0;

    let totalPathProgress = 0;
    let activeColor = "#9ca3af"; // Default gray
    let glowColor = "rgba(156, 163, 175, 0.5)";
    let phaseLabel = "";

    switch (phase) {
        case BreathingPhase.Inhale:
            // 0% -> 25% (Side 1: Up)
            totalPathProgress = 0 + (phaseProgress * 0.25);
            activeColor = "#22d3ee"; // Cyan
            glowColor = "rgba(34, 211, 238, 0.6)";
            phaseLabel = "ВДОХ";
            break;
        case BreathingPhase.HoldIn:
            // 25% -> 50% (Side 2: Right)
            totalPathProgress = 0.25 + (phaseProgress * 0.25);
            activeColor = "#8b5cf6"; // Violet
            glowColor = "rgba(139, 92, 246, 0.6)";
            phaseLabel = "ЗАДЕРЖКА";
            break;
        case BreathingPhase.Exhale:
            // 50% -> 75% (Side 3: Down)
            totalPathProgress = 0.5 + (phaseProgress * 0.25);
            activeColor = "#fb923c"; // Orange
            glowColor = "rgba(251, 146, 60, 0.6)";
            phaseLabel = "ВЫДОХ";
            break;
        case BreathingPhase.HoldOut:
            // 75% -> 100% (Side 4: Left)
            totalPathProgress = 0.75 + (phaseProgress * 0.25);
            activeColor = "#52525b"; // Zinc/Gray
            glowColor = "rgba(82, 82, 91, 0.4)";
            phaseLabel = "ПАУЗА";
            break;
        default:
            totalPathProgress = 0;
            phaseLabel = "ГОТОВНОСТЬ";
            activeColor = "#52525b";
    }

    // --- 4. RENDER ---
    return (
        <div className="relative w-full max-w-[280px] md:max-w-[360px] lg:max-w-[45vh] aspect-square flex items-center justify-center">
            
            {/* SVG CANVAS */}
            <svg 
                viewBox={`0 0 ${SIZE} ${SIZE}`} 
                className="w-full h-full overflow-visible"
            >
                <defs>
                    <filter id="sharpGlow">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* LAYER 1: TRACK (Dim Guide) */}
                {/* Thin, barely visible track to show the structure */}
                <path 
                    d={boxPath} 
                    fill="none" 
                    stroke="rgba(255,255,255,0.1)" 
                    strokeWidth="1" 
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                />

                {/* LAYER 2: ACTIVE PROGRESS (Neon) */}
                <motion.path 
                    d={boxPath} 
                    fill="none" 
                    strokeWidth="4" 
                    strokeLinecap="butt" // Butt ensures precise length match without rounding over corners prematurely
                    strokeLinejoin="miter" // Sharp corners
                    stroke={activeColor}
                    initial={{ pathLength: 0 }}
                    animate={{ 
                        pathLength: totalPathProgress,
                        stroke: activeColor
                    }}
                    transition={{ 
                        pathLength: { duration: 0, ease: "linear" }, // Controlled strictly by time state
                        stroke: { duration: 0.5 } // Smooth color transition
                    }}
                    style={{ 
                        filter: `drop-shadow(0 0 10px ${activeColor})`
                    }}
                />

                {/* LAYER 3: PARTICLE (The Dot) */}
                {/* 
                    CSS offset-path allows the dot to follow the exact SVG geometry including sharp corners.
                    We use a small circle with a strong glow.
                */}
                <circle 
                    r="5" 
                    fill="white"
                    style={{
                        offsetPath: `path('${boxPath.replace(/\n/g, ' ').trim()}')`,
                        offsetDistance: `${totalPathProgress * 100}%`,
                        filter: `drop-shadow(0 0 8px ${activeColor})`
                    }}
                />
            </svg>

            {/* CENTER INFO */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
                {/* Timer */}
                <div className="flex flex-col items-center justify-center">
                    <span 
                        className="text-7xl md:text-8xl lg:text-[10vh] font-mono font-bold text-white tabular-nums drop-shadow-2xl"
                        style={{ textShadow: `0 0 30px ${glowColor}` }}
                    >
                        {Math.ceil(timeLeft)}
                    </span>
                    
                    {/* Label Pill - Boxier Look */}
                    <motion.div 
                        className="mt-6 px-4 py-1 border-x-2 border-white/10 bg-black/60 backdrop-blur-md"
                        animate={{ 
                            borderColor: activeColor,
                            backgroundColor: phase === BreathingPhase.HoldOut ? 'rgba(82, 82, 91, 0.5)' : `${activeColor}15` 
                        }}
                    >
                        <span 
                            className="text-xs md:text-sm font-bold uppercase tracking-[0.3em]"
                            style={{ color: activeColor }}
                        >
                            {phaseLabel}
                        </span>
                    </motion.div>

                    {/* Round Info */}
                    <div className="mt-2 opacity-60">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                            {currentRound} / {totalRounds === 0 ? '∞' : totalRounds}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BoxTimerVisual;
