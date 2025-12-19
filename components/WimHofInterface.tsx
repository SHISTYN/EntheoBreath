import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BreathingPattern } from '../types';
import WimHofGuide from './techniques/WimHofGuide'; // Import Guide

// --- TYPES & CONSTANTS ---

type WhmPhase = 'SETUP' | 'PREP' | 'BREATHING' | 'RETENTION' | 'RECOVERY_PREP' | 'RECOVERY' | 'ROUND_WAIT' | 'DONE';
type SpeedKey = 'slow' | 'normal' | 'fast';
type TabKey = 'practice' | 'guide'; // Reordered logic

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
    
    // Hexagon Path (Centered in 200x200 viewbox)
    const path = "M100 20 L170 60 L170 140 L100 180 L30 140 L30 60 Z";

    // Animation Variants
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
            scale: 1.6, 
            opacity: 1, 
            filter: "blur(0px)",
            textShadow: `0 0 30px ${color}80`,
            transition: tIn 
        },
        exhale: { 
            scale: 0.6, 
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
    // --- TABS STATE ---
    // UX DECISION: Default to 'practice' for immediate action
    const [activeTab, setActiveTab] = useState<TabKey>('practice');

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
    const [previewState, setPreviewState] = useState<'inhale'|'exhale'>('inhale');
    const [previewCount, setPreviewCount] = useState(1);

    useEffect(() => {
        if (phase !== 'SETUP' || activeTab !== 'practice') return;
        
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
    }, [speedKey, phase, activeTab]);

    // --- RETENTION LOGIC ---
    const startRetention = useCallback(() => {
        setPhase('RETENTION');
        setTimerVal(0);
        setBreathAnimState('static');
    }, []);

    // --- BREATHING LOGIC ---
    const [breathAnimState, setBreathAnimState] = useState<'inhale'|'exhale'|'static'>('static');

    useEffect(() => {
        if (phase !== 'BREATHING' || activeTab !== 'practice') return;

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
    }, [phase, speedKey, breathsTarget, startRetention, activeTab]);

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
        if (activeTab !== 'practice' || phase === 'SETUP' || phase === 'BREATHING' || phase === 'DONE') {
             if (reqRef.current) cancelAnimationFrame(reqRef.current);
             lastTimeRef.current = 0;
             return;
        }
        reqRef.current = requestAnimationFrame(tick);
        return () => { if (reqRef.current) cancelAnimationFrame(reqRef.current); };
    }, [phase, tick, activeTab]);

    // --- INTERACTIONS ---
    const startSession = () => {
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
        <div className="w-full h-full flex flex-col bg-[#0B0E11] text-white relative overflow-hidden font-sans">
            
            {/* 1. UNIFIED HEADER */}
            <div className="w-full p-4 md:p-6 flex flex-col gap-4 z-20 bg-gradient-to-b from-[#0B0E11] to-[#0B0E11]/0 shrink-0">
                <div className="flex justify-between items-center">
                    
                    {/* Left: Round Info */}
                    <div className="flex flex-col w-12">
                         <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Раунд</span>
                         <span className="text-xl font-display font-bold text-white">
                            {currentRound} <span className="text-gray-600 text-sm">/ {roundsTarget > 10 ? '∞' : roundsTarget}</span>
                         </span>
                    </div>

                    {/* Center: CONSISTENT TABS (Matches Sidebar Style) */}
                    <div className="bg-white/5 p-1 rounded-xl border border-white/5 flex relative w-full max-w-[260px]">
                        {/* Tab Background Logic with AnimatePresence/layoutId */}
                        {['practice', 'guide'].map((tab) => (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(tab as TabKey)}
                                className={`flex-1 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-lg relative z-10 transition-colors duration-300 ${activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                {activeTab === tab && (
                                    <motion.div 
                                        layoutId="activeWhmTab"
                                        className="absolute inset-0 bg-white/10 rounded-lg shadow-sm"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                {tab === 'guide' ? '📹 Руководство' : '🧘 Практика'}
                            </button>
                        ))}
                    </div>
                    
                    {/* Right: Close Button */}
                    <div className="w-12 flex justify-end">
                        <button 
                            onClick={onExit}
                            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* 3. CONTENT AREA */}
            <div className="flex-1 relative w-full overflow-hidden">
                
                {/* TAB: GUIDE */}
                {activeTab === 'guide' && (
                    <div className="absolute inset-0 animate-fade-in">
                        <WimHofGuide onStartPractice={() => setActiveTab('practice')} />
                    </div>
                )}

                {/* TAB: PRACTICE */}
                {activeTab === 'practice' && (
                    <div 
                        className="absolute inset-0 flex flex-col items-center animate-fade-in"
                        onDoubleClick={phase === 'BREATHING' || phase === 'RETENTION' ? handleDoubleTap : undefined}
                        onClick={phase === 'RETENTION' ? handleDoubleTap : undefined}
                    >
                        {phase === 'SETUP' ? (
                            <div className="w-full h-full flex flex-col items-center justify-center p-4">
                                {/* PREVIEW HEXAGON */}
                                <div className="flex-1 flex flex-col items-center justify-center w-full min-h-[250px] relative">
                                    <div className="absolute top-0 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">
                                        Предпросмотр темпа
                                    </div>
                                    <HarmonicHexagon 
                                        state={previewState}
                                        speed={SPEEDS[speedKey]}
                                        label={previewCount}
                                        scale={0.9}
                                        color="#48CFE1"
                                    />
                                    {/* SPEED */}
                                    <div className="flex gap-2 mt-8 bg-white/5 p-1 rounded-xl border border-white/5 relative z-20">
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

                                {/* CONTROLS */}
                                <div className="w-full max-w-md space-y-6 pb-8">
                                    <div className="flex items-center justify-between px-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Раунды</label>
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => setRoundsTarget(r => Math.max(1, r - 1))} className="w-10 h-10 rounded-full bg-white/5 text-white flex items-center justify-center hover:bg-white/10"><i className="fas fa-minus text-xs"></i></button>
                                            <span className="w-8 text-center font-bold text-xl text-[#48CFE1]">{roundsTarget > 10 ? '∞' : roundsTarget}</span>
                                            <button onClick={() => setRoundsTarget(r => r <= 10 ? r + 1 : 11)} className="w-10 h-10 rounded-full bg-white/5 text-white flex items-center justify-center hover:bg-white/10"><i className="fas fa-plus text-xs"></i></button>
                                        </div>
                                    </div>

                                    <div className="px-2">
                                        <div className="flex justify-between mb-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Вдохи</label>
                                            <span className="text-sm font-bold text-[#48CFE1]">{breathsTarget}</span>
                                        </div>
                                        <input 
                                            type="range" min="5" max="60" step="5" 
                                            value={breathsTarget} 
                                            onChange={(e) => setBreathsTarget(Number(e.target.value))}
                                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#48CFE1]"
                                        />
                                    </div>

                                    <button onClick={startSession} className="w-full py-4 bg-gradient-to-r from-[#48CFE1] to-cyan-600 text-[#0B0E11] font-display font-bold text-lg uppercase tracking-widest rounded-2xl shadow-glow-cyan hover:scale-[1.02] transition-all">
                                        Начать
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // ACTIVE SESSION UI
                            <div className="w-full h-full flex flex-col items-center justify-center relative">
                                <h2 className="absolute top-[10%] w-full text-center text-2xl md:text-3xl font-display font-bold text-white px-4 animate-fade-in">
                                    {phase === 'RETENTION' ? "ВЫДОХНИТЕ И ЗАДЕРЖИТЕ" : 
                                     phase === 'RECOVERY_PREP' ? "ПРИГОТОВЬТЕСЬ..." :
                                     phase === 'RECOVERY' ? "ДЕРЖИТЕ ДЫХАНИЕ" :
                                     phase === 'BREATHING' ? "РИТМИЧНОЕ ДЫХАНИЕ" : 
                                     phase === 'ROUND_WAIT' ? "ОТЛИЧНО!" : 
                                     phase === 'PREP' ? "ПРИГОТОВЬТЕСЬ" : ""}
                                </h2>

                                <motion.div 
                                    className="relative z-10"
                                    animate={phase === 'BREATHING' ? { scale: breathAnimState === 'inhale' ? 1.2 : 0.9 } : { scale: 1 }}
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
                                </motion.div>
                                
                                {phase === 'BREATHING' && (
                                    <div className="absolute bottom-10 px-5 py-2 rounded-full bg-white/5 border border-white/5 backdrop-blur-md animate-pulse">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Двойной тап: завершить</span>
                                    </div>
                                )}
                                {phase === 'RETENTION' && (
                                    <div className="absolute bottom-10 px-5 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 backdrop-blur-md animate-pulse">
                                        <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Тапните для вдоха</span>
                                    </div>
                                )}
                                {phase === 'DONE' && (
                                     <div className="absolute bottom-10">
                                         <button onClick={onExit} className="px-8 py-3 bg-white text-black font-bold rounded-xl shadow-glow-cyan">В меню</button>
                                     </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};

export default WimHofInterface;