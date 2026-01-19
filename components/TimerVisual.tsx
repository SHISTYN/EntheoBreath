
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BreathingPhase } from '../types';

interface TimerVisualProps {
    phase: BreathingPhase;
    timeLeft: number;
    totalTimeForPhase: number;
    label: string;
    currentRound?: number;
    totalRounds?: number;
    currentBreath?: number;
    totalBreaths?: number;
    mode?: 'loop' | 'wim-hof' | 'stopwatch' | 'manual';
    isActive?: boolean;
    theme?: 'light' | 'dark'; // Added to fix TS error
}

const TimerVisual: React.FC<TimerVisualProps> = ({
    phase,
    timeLeft,
    totalTimeForPhase,
    label,
    currentRound = 1,
    totalRounds = 0,
    currentBreath = 0,
    currentBreath = 0,
    mode = 'loop',
    isActive = false,
    theme: appTheme // Destructure but rename to avoid conflict with internal theme
}) => {

    const isWimHof = mode === 'wim-hof';
    const isStopwatch = mode === 'stopwatch';
    const isWimHofBreathing = isWimHof && (phase === BreathingPhase.Inhale || phase === BreathingPhase.Exhale);
    const isWimHofRetention = isWimHof && phase === BreathingPhase.HoldOut;

    // --- 1. PALETTE ENGINE (Pure Light) ---
    const getTheme = () => {
        // Passive state (when paused or ready)
        if (!isActive) return {
            g1: '#18181b', g2: '#27272a', g3: '#09090b',
            ring: ['transparent', 'transparent'],
            accent: '#71717a',
            shadow: '0 0 0px rgba(0,0,0,0)'
        };

        switch (phase) {
            case BreathingPhase.Inhale:
                return {
                    g1: '#06b6d4', g2: '#3b82f6', g3: '#a5f3fc',
                    ring: ['#22d3ee', '#3b82f6'],
                    accent: '#22d3ee',
                    shadow: '0 0 80px rgba(34, 211, 238, 0.6)' // Stronger glow
                };
            case BreathingPhase.HoldIn:
                return {
                    g1: '#7c3aed', g2: '#db2777', g3: '#e879f9',
                    ring: ['#a855f7', '#d946ef'],
                    accent: '#d946ef',
                    shadow: '0 0 90px rgba(168, 85, 247, 0.6)'
                };
            case BreathingPhase.Exhale:
                return {
                    g1: '#ea580c', g2: '#f59e0b', g3: '#fbbf24',
                    ring: ['#fb923c', '#f59e0b'],
                    accent: '#fb923c',
                    shadow: '0 0 60px rgba(251, 146, 60, 0.5)'
                };
            case BreathingPhase.HoldOut:
                return {
                    g1: '#1e1b4b', g2: '#312e81', g3: '#4338ca',
                    ring: ['#6366f1', '#818cf8'],
                    accent: '#818cf8',
                    shadow: '0 0 60px rgba(99, 102, 241, 0.5)'
                };
            default:
                return {
                    g1: '#27272a', g2: '#3f3f46', g3: '#18181b',
                    ring: ['#52525b', '#71717a'],
                    accent: '#52525b',
                    shadow: '0 0 0 rgba(0,0,0,0)'
                };
        }
    };

    const theme = getTheme();

    // --- 2. PHYSICS & SHAPE ---
    const progress = totalTimeForPhase > 0
        ? Math.max(0, Math.min(1, (totalTimeForPhase - timeLeft) / totalTimeForPhase))
        : 0;

    const SIZE = 320;
    const STROKE = 3;
    const RADIUS = (SIZE / 2) - STROKE - 20;
    const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
    const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

    // Breathing Scale (Volume)
    let scale = 1.0;
    if (isActive && !isStopwatch) {
        if (phase === BreathingPhase.Inhale) scale = 0.88 + (progress * 0.24); // 0.88 -> 1.12 (Big expansion)
        else if (phase === BreathingPhase.HoldIn) scale = 1.12;
        else if (phase === BreathingPhase.Exhale) scale = 1.12 - (progress * 0.24);
        else scale = 0.88;
    } else {
        scale = 0.88;
    }

    // --- 3. FLUID SHAPE (The Egg Effect) ---
    // More aggressive values for "liquid" feel
    const liquidShapeVariants = {
        idle: {
            borderRadius: "50% 50% 50% 50%",
            transition: { duration: 1 }
        },
        active: {
            borderRadius: [
                "50% 50% 50% 50%",      // Circle
                "60% 40% 50% 50%",      // Wide top
                "50% 50% 60% 40%",      // Wide bottom
                "45% 55% 40% 60%",      // Asymmetric
                "50% 50% 50% 50%"       // Circle
            ],
            transition: {
                duration: 10, // Slow morph
                repeat: Infinity,
                ease: "easeInOut",
                repeatType: "mirror" as const
            }
        }
    };

    // --- 4. HUD VALUES ---
    let mainValue = "";
    if (isStopwatch) {
        const m = Math.floor(timeLeft / 60);
        const s = Math.floor(timeLeft % 60);
        mainValue = `${m}:${s.toString().padStart(2, '0')}`;
    } else if (isWimHof) {
        if (isWimHofBreathing) mainValue = `${currentBreath}`;
        else if (isWimHofRetention) {
            const m = Math.floor(timeLeft / 60);
            const s = Math.floor(timeLeft % 60);
            mainValue = timeLeft > 60 ? `${m}:${s.toString().padStart(2, '0')}` : timeLeft.toFixed(1);
        } else mainValue = Math.ceil(timeLeft).toString();
    } else {
        mainValue = Math.ceil(timeLeft).toString();
    }

    const transitionSettings = { duration: 3.0, ease: "easeInOut" };

    return (
        <div className="relative flex items-center justify-center select-none" style={{ width: SIZE, height: SIZE }}>

            {/* --- LAYER 1: PROGRESS RING --- */}
            <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
                <svg width={SIZE} height={SIZE} className="rotate-[-90deg] overflow-visible">
                    <defs>
                        <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={theme.ring[0]} />
                            <stop offset="100%" stopColor={theme.ring[1]} />
                        </linearGradient>
                    </defs>

                    {/* Active Ring */}
                    {isActive && (
                        <motion.circle
                            cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
                            fill="none"
                            stroke="url(#ringGradient)"
                            strokeWidth={STROKE}
                            strokeLinecap="round"
                            strokeDasharray={CIRCUMFERENCE}
                            animate={{ strokeDashoffset }}
                            transition={{ duration: 0.1, ease: "linear" }}
                            style={{ filter: `drop-shadow(0 0 10px ${theme.accent})` }}
                        />
                    )}
                </svg>
            </div>

            {/* --- LAYER 2: GLOW LAYER (BACK) --- */}
            {/* This layer handles the box-shadow. It has NO overflow-hidden, so the glow extends outward. */}
            <motion.div
                className="absolute z-10"
                style={{ width: SIZE * 0.75, height: SIZE * 0.75 }}
                variants={liquidShapeVariants}
                animate={isActive ? "active" : "idle"}
            >
                <motion.div
                    className="w-full h-full bg-black"
                    animate={{
                        scale: scale,
                        boxShadow: theme.shadow
                    }}
                    transition={{
                        scale: { duration: 0.8, ease: [0.25, 1, 0.5, 1] },
                        boxShadow: { duration: 1.5, ease: "easeInOut" } // Smooth fade for glow
                    }}
                    style={{ borderRadius: "inherit" }}
                />
            </motion.div>

            {/* --- LAYER 3: LIQUID CONTENT LAYER (FRONT) --- */}
            {/* This layer contains the internal animations. It HAS overflow-hidden to clip the 'smoke'. */}
            {/* It mimics the exact shape/scale of Layer 2 so they look like one object. */}
            <motion.div
                className="absolute z-20 overflow-hidden"
                style={{ width: SIZE * 0.75, height: SIZE * 0.75 }}
                variants={liquidShapeVariants}
                animate={isActive ? "active" : "idle"}
            >
                <motion.div
                    className="w-full h-full"
                    animate={{ scale: scale }}
                    transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
                    style={{
                        borderRadius: "inherit",
                        background: "black",
                        // Use translateZ to force hardware acceleration and fix Safari clipping artifacts
                        transform: "translateZ(0)"
                    }}
                >
                    {/* 3.1 Internal Smoke/Liquid */}
                    <div className="absolute inset-0 opacity-80 mix-blend-screen blur-[30px]">
                        {/* Orb 1: Primary */}
                        <motion.div
                            className="absolute top-[-10%] left-[-5%] w-[90%] h-[90%] rounded-full"
                            animate={{
                                backgroundColor: theme.g1,
                                x: [0, 20, -15, 0],
                                y: [0, -15, 20, 0],
                                scale: [1, 1.1, 0.95, 1]
                            }}
                            transition={{
                                backgroundColor: transitionSettings,
                                default: { duration: 12, repeat: Infinity, ease: "easeInOut" }
                            }}
                        />

                        {/* Orb 2: Secondary */}
                        <motion.div
                            className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] rounded-full"
                            animate={{
                                backgroundColor: theme.g2,
                                x: [0, -20, 15, 0],
                                y: [0, 10, -25, 0],
                            }}
                            transition={{
                                backgroundColor: transitionSettings,
                                default: { duration: 15, repeat: Infinity, ease: "easeInOut" }
                            }}
                        />

                        {/* Orb 3: Highlight */}
                        <motion.div
                            className="absolute top-[15%] left-[15%] w-[50%] h-[50%] rounded-full opacity-60"
                            animate={{
                                backgroundColor: theme.g3,
                                x: [0, 15, -15, 0],
                                y: [0, 10, -10, 0],
                            }}
                            transition={{
                                backgroundColor: transitionSettings,
                                default: { duration: 8, repeat: Infinity, ease: "easeInOut" }
                            }}
                        />
                    </div>

                    {/* 3.2 Glass Effects (No borders) */}
                    <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[60%] h-[30%] bg-gradient-to-b from-white/10 to-transparent rounded-full blur-[20px] pointer-events-none" />

                    <motion.div
                        className="absolute bottom-[-10%] inset-x-0 h-[40%] blur-[30px] opacity-50 mix-blend-screen"
                        animate={{ backgroundColor: theme.accent }}
                        transition={{ backgroundColor: transitionSettings }}
                    />

                </motion.div>
            </motion.div>

            {/* --- LAYER 4: HUD --- */}
            <div className="relative z-40 flex flex-col items-center justify-center pointer-events-none">

                <AnimatePresence mode="popLayout">
                    <motion.span
                        key={Math.floor(timeLeft)}
                        initial={{ opacity: 0.5, scale: 0.9, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, position: 'absolute', scale: 1.1 }}
                        transition={{ duration: 0.1 }}
                        className="font-display font-bold text-7xl md:text-8xl tabular-nums tracking-tighter text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
                    >
                        {mainValue}
                    </motion.span>
                </AnimatePresence>

                <div className="mt-4 flex flex-col items-center gap-2">
                    <motion.div
                        layout
                        className="px-6 py-2 rounded-full bg-black/10 backdrop-blur-md shadow-lg flex items-center justify-center min-w-[140px]"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <motion.span
                            className="text-[11px] font-black uppercase tracking-[0.25em]"
                            animate={{ color: theme.accent }}
                            transition={{ color: transitionSettings }}
                        >
                            {isWimHof ? (isWimHofBreathing ? 'Дыхание' : isWimHofRetention ? 'Задержка' : 'Отдых') : label}
                        </motion.span>
                    </motion.div>

                    {!isWimHof && !isStopwatch && (
                        <div className="px-3 py-1 rounded-full bg-transparent">
                            <span className="text-[10px] font-bold text-white/30 tracking-widest">
                                {currentRound} / {totalRounds === 0 ? '∞' : totalRounds}
                            </span>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default TimerVisual;
