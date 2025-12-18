import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BreathingPattern } from '../types';

// --- TYPES & CONSTANTS ---

type WhmPhase = 'SETUP' | 'PREP' | 'BREATHING' | 'RETENTION' | 'RECOVERY_PREP' | 'RECOVERY' | 'ROUND_WAIT' | 'DONE';
type SpeedKey = 'slow' | 'normal' | 'fast';

interface SpeedProfile {
    label: string;
    inhale: number;
    exhale: number;
    total: number;
}

const SPEEDS: Record<SpeedKey, SpeedProfile> = {
  slow: { label: 'Медленно', inhale: 2.5, exhale: 2.0, total: 4.5 },
  normal: { label: 'Обычно', inhale: 1.8, exhale: 1.4, total: 3.2 },
  fast: { label: 'Быстро', inhale: 1.2, exhale: 1.2, total: 2.4 },
};

// --- SUB-COMPONENT: HARMONIC HEXAGON ---
// Renders the breathing visual with 3 layered paths for the "organic" effect
const HarmonicHexagon: React.FC<{
    state: 'inhale' | 'exhale' | 'hold' | 'static';
    speed: { inhale: number; exhale: number };
    label: string | number;
    subLabel?: string;
    scale?: number;
    color?: string;
    showLayers?: boolean;
}> = ({ state, speed, label, subLabel, scale = 1, color = '#48CFE1', showLayers = true }) => {
    
    // Hexagon Path (Centered in 200x200 viewbox)
    const path = "M100 20 L170 60 L170 140 L100 180 L30 140 L30 60 Z";

    // Animation Variants
    // FIXED: Explicitly type the ease array as a tuple for Framer Motion compatibility
    const tIn = { duration: speed.inhale, ease: [0.42, 0, 0.58, 1] as [number, number, number, number] };
    const tOut = { duration: speed.exhale, ease: [0.42, 0, 0.58, 1] as [number, number, number, number] };
    
    // Staggered Layers
    const layerVariants = {
        inhale: (i: number) => ({
            scale: 1 + (i * 0.12), // Layers expand outward
            opacity: 0.6 - (i * 0.15),
            transition: { ...tIn, delay: i * 0.06 } // Stagger delay
        }),
        exhale: (i: number) => ({
            scale: 0.75 + (i * 0.04), // Layers collapse
            opacity: 0.1 + (i * 0.1),
            transition: { ...tOut, delay: i * 0.04 }
        }),
        hold: { scale: 1, opacity: 0.5, transition: { duration: 0.5 } },
        static: { scale: 1, opacity: 0.3 }
    };

    // Text Sync
    const textVariants = {
        inhale: { 
            scale: 1.5, 
            opacity: 1, 
            filter: "blur(0px)",
            textShadow: `0 0 20px ${color}80`,
            transition: tIn 
        },
        exhale: { 
            scale: 0.7, 
            opacity: 0.4, 
            filter: "blur(1px)",
            textShadow: `0 0 0px ${color}00`,
            transition: tOut 
        },
        hold: { scale: 1, opacity: 1, filter: "blur(0px)", textShadow: "none" },
        static: { scale: 1, opacity: 1, filter: "blur(0px)", textShadow: "none" }
    };

    return (
        <div className="relative flex items-center justify-center w-[300px] h-[300px]" style={{ transform: `scale(${scale})` }}>
            <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full overflow-visible">
                <defs>
                    <filter id="glowHex">
                         <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                         <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                </defs>
                
                {showLayers && [2, 1, 0].map(i => (
                    <motion.path
                        key={i}
                        custom={i}
                        d={path}
                        fill={i === 0 ? `${color}15` : "none"} 
                        stroke={color}
                        strokeWidth={i === 0 ? 3 : 1.5}
                        variants={layerVariants}
                        animate={state}
                        style={{ originX: 0.5, originY: 0.5, filter: i === 0 ? 'url(#glowHex)' : 'none' }}
                    />
                ))}
            </svg>

            {/* Central Digits */}
            <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none">
                <motion.span 
                    variants={textVariants}
                    animate={state}
                    className="font-display font-bold text-white tabular-nums leading-none text-7xl md:text-8xl"
                >
                    {label}
                </motion.span>
                
                {subLabel && (
                    <motion.span 
                        animate={{ opacity: state === 'inhale' || state === 'hold' ? 1 : 0.6 }}
                        className="mt-4 text-[10px] font-bold uppercase tracking-[0.3em] text-white/70 bg-black/40 px-3 py-1 rounded-full backdrop-blur-md border border-white/5"
                    >
                        {subLabel}
                    </motion.span>
                )}
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---

interface Props {
    pattern: BreathingPattern;
    onExit: () => void;
}

const WimHofInterface: React.FC<Props> = ({ pattern, onExit }) => {
    // --- STATE ---
    const [phase, setPhase] = useState<WhmPhase>('SETUP');
    
    // Settings
    const [roundsTarget, setRoundsTarget] = useState(3); // 0 or 11 = Infinity in UI logic
    const [breathsTarget, setBreathsTarget] = useState(30);
    const [speedKey, setSpeedKey] = useState<SpeedKey>('normal');
    
    // Session Data
    const [currentRound, setCurrentRound] = useState(1);
    const [currentBreath, setCurrentBreath] = useState(1);
    const [timerVal, setTimerVal] = useState(0);
    
    // Refs for Timing
    const reqRef = useRef<number>();
    const lastTimeRef = useRef<number>(0);

    // --- SETUP PREVIEW LOOP (Runs only in SETUP) ---
    const [previewState, setPreviewState] = useState<'inhale'|'exhale'>('inhale');
    const [previewCount, setPreviewCount] = useState(1);

    useEffect(() => {
        if (phase !== 'SETUP') return;
        
        let t1: any, t2: any;
        const s = SPEEDS[speedKey];
        
        const loop = () => {
            setPreviewState('inhale');
            t1 = setTimeout(() => {
                setPreviewState('exhale');
                t2 = setTimeout(() => {
                    setPreviewCount(c => (c >= 9 ? 1 : c + 1));
                    loop();
                }, s.exhale * 1000);
            }, s.inhale * 1000);
        };
        loop();
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, [speedKey, phase]);

    // --- BREATHING LOGIC (The Core Loop) ---
    // We use a separate state 'breathAnimState' to drive the Hexagon during the active phase
    const [breathAnimState, setBreathAnimState] = useState<'inhale'|'exhale'>('inhale');

    useEffect(() => {
        if (phase !== 'BREATHING') return;

        let isMounted = true;
        const s = SPEEDS[speedKey];
        
        const cycle = async () => {
             // 1. INHALE
             setBreathAnimState('inhale');
             await new Promise<void>(r => setTimeout(r, s.inhale * 1000));
             if (!isMounted || phase !== 'BREATHING') return;

             // 2. EXHALE
             setBreathAnimState('exhale');
             await new Promise<void>(r => setTimeout(r, s.exhale * 1000));
             if (!isMounted || phase !== 'BREATHING') return;

             // 3. COUNT UPDATE
             setCurrentBreath(prev => prev + 1);
             // Note: We do NOT auto-stop at target. WHM usually allows user to go deeper.
             // Visual guidance stops expanding, but count continues until double tap.
             
             cycle();
        };

        cycle();
        return () => { isMounted = false; };
    }, [phase, speedKey]);

    // --- STOPWATCH & COUNTDOWN LOGIC (RAF) ---
    const tick = useCallback((time: number) => {
        if (!lastTimeRef.current) lastTimeRef.current = time;
        const delta = (time - lastTimeRef.current) / 1000;
        lastTimeRef.current = time;

        if (phase === 'RETENTION') {
            // Count UP
            setTimerVal(prev => prev + delta);
        } else if (['PREP', 'RECOVERY_PREP', 'RECOVERY', 'ROUND_WAIT'].includes(phase)) {
            // Count DOWN
            setTimerVal(prev => {
                const next = prev - delta;
                if (next <= 0) {
                    handleAutoTransition();
                    return 0;
                }
                return next;
            });
        }
        reqRef.current = requestAnimationFrame(tick);
    }, [phase]); // Dependency on phase ensures handleAutoTransition has correct closure

    // Auto Transition Logic used inside Tick
    const handleAutoTransition = () => {
        if (phase === 'PREP') {
            setPhase('BREATHING');
            setCurrentBreath(1);
        } else if (phase === 'RECOVERY_PREP') {
            setPhase('RECOVERY');
            setTimerVal(15);
        } else if (phase === 'RECOVERY') {
            setPhase('ROUND_WAIT');
            setTimerVal(3);
        } else if (phase === 'ROUND_WAIT') {
             // Check Rounds (10 is max in UI, >10 is Infinity)
            if (roundsTarget <= 10 && currentRound >= roundsTarget) {
                setPhase('DONE');
            } else {
                setCurrentRound(r => r + 1);
                setPhase('PREP');
                setTimerVal(3);
            }
        }
    };

    // Start/Stop RAF
    useEffect(() => {
        if (phase === 'SETUP' || phase === 'BREATHING' || phase === 'DONE') {
             if (reqRef.current) cancelAnimationFrame(reqRef.current);
             lastTimeRef.current = 0;
             return;
        }
        reqRef.current = requestAnimationFrame(tick);
        return () => { if (reqRef.current) cancelAnimationFrame(reqRef.current); };
    }, [phase, tick]);


    // --- INTERACTIONS ---
    const startSession = () => {
        setPhase('PREP');
        setCurrentRound(1);
        setTimerVal(3);
    };

    const handleDoubleTap = () => {
        if (phase === 'BREATHING') {
            setPhase('RETENTION');
            setTimerVal(0);
        } else if (phase === 'RETENTION') {
            setPhase('RECOVERY_PREP');
            setTimerVal(3);
        }
    };

    const formatStopwatch = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    // --- RENDER HELPERS ---
    
    // 1. SETUP UI
    if (phase === 'SETUP') {
        const isMaxRounds = roundsTarget > 10;
        
        return (
            <div className="w-full h-full flex flex-col bg-[#0B0E11] text-white p-4 md:p-8 animate-fade-in font-sans">
                
                {/* PREVIEW BLOCK (TOP) */}
                <div className="flex-1 flex flex-col items-center justify-center relative min-h-[250px] mb-8">
                     <div className="absolute top-0 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                         Предпросмотр темпа
                     </div>
                     <HarmonicHexagon 
                        state={previewState}
                        speed={SPEEDS[speedKey]}
                        label={previewCount}
                        scale={0.9}
                        color="#48CFE1"
                     />
                     
                     {/* SPEED CONTROLS */}
                     <div className="flex gap-2 mt-8 bg-white/5 p-1 rounded-xl border border-white/5">
                        {(['slow', 'normal', 'fast'] as SpeedKey[]).map(k => (
                            <button
                                key={k}
                                onClick={() => setSpeedKey(k)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                                    speedKey === k 
                                    ? 'bg-[#48CFE1] text-black shadow-[0_0_15px_rgba(72,207,225,0.4)]' 
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                {SPEEDS[k].label}
                            </button>
                        ))}
                     </div>
                </div>

                {/* SETTINGS BLOCK (BOTTOM) */}
                <div className="w-full max-w-md mx-auto space-y-8">
                    
                    {/* A. ROUNDS STEPPER */}
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Раунды</label>
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => setRoundsTarget(r => r > 1 ? r - 1 : 1)}
                                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-all active:scale-95"
                            >
                                <i className="fas fa-minus text-xs"></i>
                            </button>
                            
                            <div className="w-12 text-center font-display font-bold text-xl text-[#48CFE1]">
                                {isMaxRounds ? '∞' : roundsTarget}
                            </div>
                            
                            <button 
                                onClick={() => setRoundsTarget(r => r <= 10 ? r + 1 : 11)}
                                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-all active:scale-95"
                            >
                                <i className="fas fa-plus text-xs"></i>
                            </button>
                        </div>
                    </div>

                    {/* B. BREATHS SLIDER */}
                    <div>
                        <div className="flex justify-between mb-4">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Вдохи</label>
                            <span className="text-sm font-bold text-[#48CFE1]">{breathsTarget}</span>
                        </div>
                        
                        <div className="relative h-12 w-full flex items-center">
                            {/* Track Background */}
                            <div className="absolute left-0 right-0 h-2 bg-white/10 rounded-full overflow-hidden">
                                {/* Fill */}
                                <div 
                                    className="h-full bg-[#48CFE1] transition-all duration-150" 
                                    style={{ width: `${((breathsTarget - 5) / 55) * 100}%` }}
                                ></div>
                            </div>

                            {/* Center Marker (30) */}
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-4 bg-white/30 rounded-full pointer-events-none"></div>

                            {/* The Input */}
                            <input 
                                type="range" min="5" max="60" step="5" 
                                value={breathsTarget}
                                onChange={(e) => setBreathsTarget(Number(e.target.value))}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                            />

                            {/* Custom Thumb Visual (Follows input) */}
                            <div 
                                className="absolute h-6 w-6 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)] pointer-events-none transition-all duration-150 border-2 border-[#0B0E11] z-10"
                                style={{ 
                                    left: `${((breathsTarget - 5) / 55) * 100}%`, 
                                    transform: 'translateX(-50%)' 
                                }}
                            ></div>
                        </div>
                        <div className="flex justify-between px-1 mt-1 text-[9px] text-gray-600 font-bold font-mono">
                            <span>5</span>
                            <span className="text-gray-500">30</span>
                            <span>60</span>
                        </div>
                    </div>

                    {/* START BUTTON */}
                    <button 
                        onClick={startSession}
                        className="w-full py-4 bg-gradient-to-r from-[#48CFE1] to-cyan-600 text-[#0B0E11] font-display font-bold text-lg uppercase tracking-widest rounded-2xl shadow-[0_0_20px_rgba(72,207,225,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        Начать практику
                    </button>
                </div>
            </div>
        );
    }

    // 2. ACTIVE PHASES UI
    // Determine props for Hexagon based on phase
    let visState: 'inhale' | 'exhale' | 'hold' | 'static' = 'static';
    let visLabel: string | number = "";
    let visSub = "";
    let visColor = "#48CFE1"; // Default Cyan
    let hintText = "";
    let isClickable = false;

    if (phase === 'PREP') {
        visLabel = Math.ceil(timerVal);
        visSub = "ПРИГОТОВЬТЕСЬ";
    } 
    else if (phase === 'BREATHING') {
        visState = breathAnimState;
        visLabel = currentBreath;
        visSub = visState === 'inhale' ? "ВДОХ" : "ВЫДОХ";
        hintText = "Двойной тап для завершения";
        isClickable = true;
    } 
    else if (phase === 'RETENTION') {
        visState = 'static';
        visLabel = formatStopwatch(timerVal);
        visSub = "ЗАДЕРЖКА";
        visColor = "#F59E0B"; // Orange
        hintText = "Тап для вдоха";
        isClickable = true;
    } 
    else if (phase === 'RECOVERY_PREP') {
        visState = 'inhale';
        visLabel = Math.ceil(timerVal);
        visSub = "ГЛУБОКИЙ ВДОХ";
        visColor = "#A855F7"; // Purple
    } 
    else if (phase === 'RECOVERY') {
        visState = 'hold';
        visLabel = Math.ceil(timerVal);
        visSub = "ДЕРЖИТЕ";
        visColor = "#A855F7";
    } 
    else if (phase === 'ROUND_WAIT') {
        visLabel = Math.ceil(timerVal);
        visSub = "ОТДЫХ";
    } 
    else if (phase === 'DONE') {
        visLabel = "✓";
        visSub = "ФИНИШ";
    }

    return (
        <div 
            className="w-full h-full flex flex-col bg-[#0B0E11] text-white relative overflow-hidden select-none"
            onDoubleClick={isClickable ? handleDoubleTap : undefined}
            onClick={phase === 'RETENTION' ? handleDoubleTap : undefined} // Also single click for retention finish
        >
            {/* TOP BAR */}
            <div className="absolute top-0 w-full p-6 flex justify-between items-center z-20">
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Раунд</span>
                    <span className="text-xl font-display font-bold text-white">
                        {currentRound} <span className="text-gray-600 text-sm">/ {roundsTarget > 10 ? '∞' : roundsTarget}</span>
                    </span>
                </div>
                <button 
                    onClick={onExit}
                    className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10"
                >
                    <i className="fas fa-times text-xs"></i>
                </button>
            </div>

            {/* MAIN VISUAL AREA */}
            <div className="flex-1 flex flex-col items-center justify-center relative w-full">
                
                {/* Phase Title */}
                <h2 className="absolute top-[15%] w-full text-center text-2xl md:text-3xl font-display font-bold text-white px-4 animate-fade-in">
                    {phase === 'RETENTION' ? "ВЫДОХНИТЕ И ЗАДЕРЖИТЕ" : 
                     phase === 'RECOVERY_PREP' ? "ПРИГОТОВЬТЕСЬ..." :
                     phase === 'RECOVERY' ? "ДЕРЖИТЕ ДЫХАНИЕ" :
                     phase === 'BREATHING' ? "РИТМИЧНОЕ ДЫХАНИЕ" : 
                     phase === 'ROUND_WAIT' ? "ОТЛИЧНО!" : ""}
                </h2>

                {/* THE HEXAGON */}
                <div className="mt-8 transition-transform duration-500 scale-100 md:scale-125">
                    <HarmonicHexagon 
                        state={visState}
                        speed={SPEEDS[speedKey]}
                        label={visLabel}
                        subLabel={visSub}
                        color={visColor}
                        showLayers={phase !== 'RETENTION' && phase !== 'ROUND_WAIT' && phase !== 'DONE'}
                    />
                </div>

                {/* BOTTOM HINT */}
                <div className="absolute bottom-[10%] w-full flex justify-center">
                    {hintText && (
                        <div className="px-5 py-2 rounded-full bg-white/5 border border-white/5 backdrop-blur-md animate-pulse">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                {hintText}
                            </span>
                        </div>
                    )}
                    
                    {phase === 'DONE' && (
                        <button 
                            onClick={onExit}
                            className="px-8 py-3 bg-white text-black font-bold rounded-xl shadow-glow-cyan hover:scale-105 transition-transform"
                        >
                            В меню
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WimHofInterface;