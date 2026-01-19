
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BreathingPattern } from '../types';
import { Maximize2, Minimize2 } from 'lucide-react';

// Fix for Framer Motion type mismatch
const MotionPath = motion.path as any;
const MotionSpan = motion.span as any;
const MotionDiv = motion.div as any;

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
const HarmonicHexagon: React.FC<{
    state: 'inhale' | 'exhale' | 'hold' | 'static';
    speed: { inhale: number; exhale: number };
    label: string | number;
    subLabel?: string;
    scale?: number;
    color?: string;
    showLayers?: boolean;
}> = ({ state, speed, label, subLabel, scale = 1, color = '#48CFE1', showLayers = true }) => {

    const path = "M100 20 L170 60 L170 140 L100 180 L30 140 L30 60 Z";

    const tIn = { duration: speed.inhale, ease: [0.42, 0, 0.58, 1] as [number, number, number, number] };
    const tOut = { duration: speed.exhale, ease: [0.42, 0, 0.58, 1] as [number, number, number, number] };

    const layerVariants = {
        inhale: (i: number) => ({
            scale: 1 + (i * 0.18),
            opacity: 0.7 - (i * 0.15),
            transition: { ...tIn, delay: i * 0.06 }
        }),
        exhale: (i: number) => ({
            scale: 0.7 + (i * 0.04),
            opacity: 0.1 + (i * 0.1),
            transition: { ...tOut, delay: i * 0.04 }
        }),
        hold: { scale: 1, opacity: 0.5, transition: { duration: 0.5 } },
        static: { scale: 1, opacity: 0.3 }
    };

    const textVariants = {
        inhale: {
            scale: 1.4,
            opacity: 1,
            filter: "blur(0px)",
            textShadow: `0 0 30px ${color}80`,
            transition: tIn
        },
        exhale: {
            scale: 0.8,
            opacity: 0.5,
            filter: "blur(1px)",
            textShadow: `0 0 0px ${color}00`,
            transition: tOut
        },
        hold: { scale: 1, opacity: 1, filter: "blur(0px)", textShadow: "none" },
        static: { scale: 1, opacity: 1, filter: "blur(0px)", textShadow: "none" }
    };

    return (
        <div className="relative flex items-center justify-center w-[260px] h-[260px] md:w-[320px] md:h-[320px]" style={{ transform: `scale(${scale})` }}>
            <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full overflow-visible">
                <defs>
                    <filter id="glowHex">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                        <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                </defs>

                {showLayers && [2, 1, 0].map(i => (
                    <MotionPath
                        key={i}
                        custom={i}
                        d={path}
                        fill={i === 0 ? `${color}15` : "none"}
                        stroke={color}
                        strokeWidth={i === 0 ? 3 : 2}
                        variants={layerVariants}
                        animate={state}
                        style={{ originX: 0.5, originY: 0.5, filter: i === 0 ? 'url(#glowHex)' : 'none', opacity: 1 }} // Force base opacity
                    />
                ))}
            </svg>

            <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none">
                <MotionSpan
                    variants={textVariants}
                    animate={state}
                    className="font-display font-bold text-zinc-900 dark:text-white tabular-nums leading-none text-6xl md:text-8xl bg-gradient-to-b from-zinc-800 to-zinc-500 dark:from-white dark:via-white dark:to-gray-400 bg-[length:100%_200%] animate-shimmer-slow bg-clip-text text-transparent"
                >
                    {label}
                </MotionSpan>

                {subLabel && (
                    <MotionSpan
                        animate={{ opacity: state === 'inhale' || state === 'hold' ? 1 : 0.6 }}
                        className="mt-4 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600 dark:text-white/80 bg-white/80 dark:bg-black/30 px-4 py-1.5 rounded-full border border-zinc-200 dark:border-white/10 shadow-sm whitespace-nowrap"
                    >
                        {subLabel}
                    </MotionSpan>
                )}
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---

interface Props {
    pattern: BreathingPattern;
    onExit: () => void;
    isZenMode?: boolean;
    onToggleZen?: () => void;
}

const WimHofInterface: React.FC<Props> = ({ pattern, onExit, isZenMode, onToggleZen }) => {
    // --- BREATHING STATE ---
    const [phase, setPhase] = useState<WhmPhase>('SETUP');

    const [roundsTarget, setRoundsTarget] = useState(3);
    const [breathsTarget, setBreathsTarget] = useState(30);
    const [speedKey, setSpeedKey] = useState<SpeedKey>('normal');

    // Session Data
    const [currentRound, setCurrentRound] = useState(1);
    const [currentBreath, setCurrentBreath] = useState(1);
    const [timerVal, setTimerVal] = useState(0);

    // Refs
    const reqRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number>(0);

    // --- SETUP PREVIEW LOOP ---
    const [previewState, setPreviewState] = useState<'inhale' | 'exhale'>('inhale');
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

    // --- RETENTION LOGIC ---
    const startRetention = useCallback(() => {
        setPhase('RETENTION');
        setTimerVal(0);
        setBreathAnimState('static');
    }, []);

    // --- BREATHING LOGIC ---
    const [breathAnimState, setBreathAnimState] = useState<'inhale' | 'exhale' | 'static'>('static');

    useEffect(() => {
        if (phase !== 'BREATHING') return;

        let isMounted = true;
        const s = SPEEDS[speedKey];

        const delay = (ms: number) => new Promise<void>(resolve => {
            setTimeout(resolve, ms);
        });

        const cycle = async () => {
            setBreathAnimState('inhale');
            await delay(s.inhale * 1000);
            if (!isMounted || phase !== 'BREATHING') return;

            setBreathAnimState('exhale');
            await delay(s.exhale * 1000);
            if (!isMounted || phase !== 'BREATHING') return;

            setCurrentBreath(prev => {
                const nextCount = prev + 1;
                if (nextCount > breathsTarget) {
                    startRetention();
                    return prev;
                }
                return nextCount;
            });

            if (phase === 'BREATHING') {
                cycle();
            }
        };

        cycle();
        return () => { isMounted = false; };
    }, [phase, speedKey, breathsTarget, startRetention]);

    // --- AUTO TRANSITION ---
    const handleAutoTransition = useCallback(() => {
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
            if (roundsTarget <= 10 && currentRound >= roundsTarget) {
                setPhase('DONE');
            } else {
                setCurrentRound(r => r + 1);
                setPhase('PREP');
                setTimerVal(3);
            }
        }
    }, [phase, roundsTarget, currentRound]);

    // --- RAF LOOP ---
    const tick = useCallback((time: number) => {
        if (!lastTimeRef.current) lastTimeRef.current = time;
        const delta = (time - lastTimeRef.current) / 1000;
        lastTimeRef.current = time;

        if (phase === 'RETENTION') {
            setTimerVal(prev => prev + delta);
        } else if (['PREP', 'RECOVERY_PREP', 'RECOVERY', 'ROUND_WAIT'].includes(phase)) {
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
    }, [phase, handleAutoTransition]);

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
        if (onToggleZen && !isZenMode) onToggleZen(); // Auto-collapse menu on start
        setPhase('PREP');
        setCurrentRound(1);
        setTimerVal(3);
    };

    const handleDoubleTap = () => {
        if (phase === 'BREATHING') startRetention();
        else if (phase === 'RETENTION') {
            setPhase('RECOVERY_PREP');
            setTimerVal(3);
        }
    };

    const formatStopwatch = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    // --- RENDER ---
    return (
        <div className="w-full flex flex-col relative font-sans">
            {phase === 'SETUP' ? (
                // --- SETUP VIEW ---
                // FIX: Changed items-center to justify-start to allow top content flow in landscape
                <div className="w-full flex flex-col items-center justify-start pt-4 md:pt-0">

                    {/* VISUALIZER */}
                    <div className="w-full flex flex-col items-center justify-center animate-fade-in py-4 relative shrink-0">
                        <div className="text-[10px] font-bold text-zinc-400 dark:text-gray-500 uppercase tracking-widest mb-4 opacity-60">
                            Предпросмотр темпа
                        </div>
                        <HarmonicHexagon
                            state={previewState}
                            speed={SPEEDS[speedKey]}
                            label={previewCount}
                            scale={1}
                            color="#48CFE1"
                        />
                        {/* SPEED SELECTOR */}
                        <div className="flex gap-2 mt-6 bg-zinc-100 dark:bg-white/5 p-1 rounded-xl border border-zinc-200 dark:border-white/5 relative z-20">
                            {(['slow', 'normal', 'fast'] as SpeedKey[]).map(k => (
                                <button
                                    key={k}
                                    onClick={() => setSpeedKey(k)}
                                    className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all ${speedKey === k
                                        ? 'bg-[#48CFE1] text-black shadow-glow-cyan'
                                        : 'text-zinc-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {SPEEDS[k].label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* CONTROLS AREA */}
                    <div className="w-full max-w-md bg-white/50 dark:bg-[#050505]/50 backdrop-blur-md border border-zinc-200 dark:border-white/5 p-6 rounded-2xl mb-safe relative group shrink-0">

                        {/* Header of Card */}
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-200 dark:border-white/5">
                            <span className="text-xs font-bold uppercase text-zinc-400 tracking-widest flex items-center gap-2">
                                <i className="fas fa-sliders-h"></i> Настройки
                            </span>
                        </div>

                        <div className="flex flex-col gap-6">
                            {/* Inputs Row */}
                            <div className="flex flex-wrap items-center gap-4 md:gap-6 justify-between">
                                {/* Rounds */}
                                <div className="flex items-center gap-3 bg-zinc-100 dark:bg-white/5 rounded-xl p-1.5 border border-zinc-200 dark:border-white/5 shrink-0">
                                    <button onClick={() => setRoundsTarget(r => Math.max(1, r - 1))} className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white/10 text-gray-400 transition-colors"><i className="fas fa-minus text-xs"></i></button>
                                    <span className="font-display font-bold text-zinc-900 dark:text-white text-lg w-6 text-center">{roundsTarget > 10 ? '∞' : roundsTarget}</span>
                                    <button onClick={() => setRoundsTarget(r => r <= 10 ? r + 1 : 11)} className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white/10 text-gray-400 transition-colors"><i className="fas fa-plus text-xs"></i></button>
                                </div>

                                {/* Rounds Label - Mobile Hide/Small */}
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider hidden xs:inline">Раунды</span>

                                <div className="hidden xs:block flex-1"></div>

                                {/* Slider Section */}
                                <div className="flex flex-col items-end gap-1 ml-auto">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase">Вдохи: <span className="text-[#48CFE1] text-base">{breathsTarget}</span></span>
                                    <input
                                        type="range" min="5" max="60" step="5"
                                        value={breathsTarget}
                                        onChange={(e) => setBreathsTarget(Number(e.target.value))}
                                        className="w-24 h-1.5 bg-zinc-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#48CFE1]"
                                    />
                                </div>
                            </div>

                            {/* Start Button */}
                            <button onClick={startSession} className="w-full py-4 bg-gradient-to-r from-[#48CFE1] to-cyan-600 text-black dark:text-[#0B0E11] font-display font-bold text-lg uppercase tracking-widest rounded-xl shadow-glow-cyan hover:scale-[1.01] active:scale-95 transition-all">
                                Начать Практику
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                // --- ACTIVE SESSION VIEW (Fullscreen takeover) ---
                // CRITICAL FIX: Z-Index 200 to overlay Header (z-50) and Sidebar Button (z-50)
                <div className="fixed inset-0 z-[200] bg-[#050505] flex flex-col items-center justify-center p-4">
                    {/* Top Status - Use Safe Area + Offset */}
                    <div className="absolute top-0 left-0 right-0 pt-[calc(env(safe-area-inset-top)+20px)] w-full flex justify-between px-6 z-20">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Раунд</span>
                            <span className="text-2xl font-display font-bold text-white leading-none">{currentRound}/{roundsTarget}</span>
                        </div>
                        <button onClick={onExit} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"><i className="fas fa-times"></i></button>
                    </div>

                    <h2 className="absolute top-[20%] w-full text-center text-xl md:text-3xl font-display font-bold text-white px-4 animate-fade-in z-20 tracking-wide">
                        {phase === 'RETENTION' ? "ВЫДОХНИТЕ И ЗАДЕРЖИТЕ" :
                            phase === 'RECOVERY_PREP' ? "ПРИГОТОВЬТЕСЬ..." :
                                phase === 'RECOVERY' ? "ДЕРЖИТЕ ДЫХАНИЕ" :
                                    phase === 'BREATHING' ? "РИТМИЧНОЕ ДЫХАНИЕ" :
                                        phase === 'ROUND_WAIT' ? "ОТЛИЧНО!" :
                                            phase === 'PREP' ? "ПРИГОТОВЬТЕСЬ" : ""}
                    </h2>

                    <MotionDiv
                        className="relative z-10"
                        animate={phase === 'BREATHING' ? { scale: breathAnimState === 'inhale' ? 1.1 : 0.9 } : { scale: 1 }}
                        transition={{ duration: phase === 'BREATHING' ? (breathAnimState === 'inhale' ? SPEEDS[speedKey].inhale : SPEEDS[speedKey].exhale) : 0.5 }}
                    >
                        <HarmonicHexagon
                            state={
                                phase === 'BREATHING' ? breathAnimState :
                                    phase === 'RETENTION' ? 'static' :
                                        phase === 'RECOVERY_PREP' ? 'inhale' :
                                            phase === 'RECOVERY' ? 'hold' : 'static'
                            }
                            speed={SPEEDS[speedKey]}
                            label={
                                phase === 'BREATHING' ? currentBreath :
                                    phase === 'RETENTION' ? formatStopwatch(timerVal) :
                                        phase === 'DONE' ? "✓" : Math.ceil(timerVal)
                            }
                            subLabel={
                                phase === 'BREATHING' ? (breathAnimState === 'inhale' ? "ВДОХ" : "ВЫДОХ") :
                                    phase === 'RETENTION' ? "ЗАДЕРЖКА" :
                                        phase === 'RECOVERY' ? "ДЕРЖИТЕ" :
                                            phase === 'DONE' ? "ФИНИШ" : ""
                            }
                            color={
                                phase === 'RETENTION' ? "#F59E0B" :
                                    phase === 'RECOVERY' ? "#A855F7" : "#48CFE1"
                            }
                            showLayers={!['RETENTION', 'ROUND_WAIT', 'DONE'].includes(phase)}
                        />
                    </MotionDiv>

                    {phase === 'BREATHING' && (
                        <div className="absolute bottom-10 px-6 py-2 rounded-full bg-white/5 border border-white/5 backdrop-blur-md animate-pulse">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Двойной тап: стоп</span>
                        </div>
                    )}
                    {phase === 'RETENTION' && (
                        <div className="absolute bottom-10 px-6 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 backdrop-blur-md animate-pulse">
                            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Тапните для вдоха</span>
                        </div>
                    )}
                    {phase === 'DONE' && (
                        <div className="absolute bottom-10 w-full px-8 max-w-md">
                            <button onClick={onExit} className="w-full py-4 bg-white text-black font-bold rounded-xl shadow-lg uppercase tracking-widest">Завершить</button>
                        </div>
                    )}

                    {/* Click Handlers Layer */}
                    <div
                        className="absolute inset-0 z-0"
                        onDoubleClick={phase === 'BREATHING' || phase === 'RETENTION' ? handleDoubleTap : undefined}
                        onClick={phase === 'RETENTION' ? handleDoubleTap : undefined}
                    ></div>
                </div>
            )}
        </div>
    );
};

export default WimHofInterface;
