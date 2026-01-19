
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { BreathingPattern } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Settings2, List, Clock, Hourglass } from 'lucide-react';

const MotionDiv = motion.div as any;

interface ControlsProps {
    pattern: BreathingPattern;
    onChange: (newPattern: BreathingPattern) => void;
    rounds: number;
    onRoundsChange: (r: number) => void;
    readOnly?: boolean;
}

// --- LONG PRESS HOOK ---
const useLongPress = (callback: () => void, speed: number = 200) => {
    const [startLongPress, setStartLongPress] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const speedRef = useRef(speed);

    const start = useCallback(() => {
        callback();
        speedRef.current = 400;
        timerRef.current = setTimeout(() => {
            setStartLongPress(true);
            intervalRef.current = setInterval(() => {
                callback();
                if (speedRef.current > 50) {
                    speedRef.current = Math.max(50, speedRef.current - 50);
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    intervalRef.current = setInterval(callback, speedRef.current);
                }
            }, speedRef.current);
        }, 500);
    }, [callback]);

    const stop = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (intervalRef.current) clearInterval(intervalRef.current);
        setStartLongPress(false);
        speedRef.current = speed;
    }, [speed]);

    return {
        onMouseDown: start,
        onMouseUp: stop,
        onMouseLeave: stop,
        onTouchStart: start,
        onTouchEnd: stop,
    };
};

// --- PREMIUM LIQUID INPUT 4.0 (ISLAND STYLE) ---
const LiquidInput: React.FC<{
    label: string;
    value: number;
    step?: number;
    onChange: (val: number) => void;
    color: string;
    subLabel?: string;
}> = ({ label, value, step = 1, onChange, color, subLabel }) => {

    const handleIncrement = () => onChange(Number((value + step).toFixed(1)));
    const handleDecrement = () => onChange(Math.max(0, Number((value - step).toFixed(1))));

    const plusLongPress = useLongPress(handleIncrement);
    const minusLongPress = useLongPress(handleDecrement);

    const fontSize = value >= 100 ? 'text-3xl' : 'text-4xl';

    return (
        <div className="flex flex-col w-full gap-2 group">
            {/* Label - Floating outside */}
            <div className="flex justify-center items-center">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 transition-colors group-hover:text-zinc-300">
                    {label}
                </span>
            </div>

            {/* Glass Island Container */}
            <div className="relative flex items-stretch w-full h-16 md:h-20 rounded-2xl md:rounded-3xl overflow-hidden shadow-lg transition-all duration-300 bg-white/40 dark:bg-[#0a0a0b]/60 backdrop-blur-2xl group-hover:shadow-[0_0_30px_-10px_rgba(34,211,238,0.15)] border border-black/5 dark:border-white/10 ring-1 ring-black/5 dark:ring-white/5">

                {/* Glow */}
                <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 z-0 pointer-events-none"
                    style={{ background: `radial-gradient(circle at center, ${color}, transparent 70%)` }}
                ></div>

                {/* Minus Button */}
                <button
                    {...minusLongPress}
                    className="relative z-10 w-12 md:w-14 flex items-center justify-center bg-transparent hover:bg-white/5 active:bg-white/10 transition-colors border-r border-white/5"
                >
                    <Minus size={16} className="text-zinc-400 group-hover:text-white transition-colors" />
                </button>

                {/* Center Value */}
                <div className="relative z-10 flex-1 flex flex-col items-center justify-center overflow-hidden">
                    <div className="flex items-baseline gap-1 relative z-20 w-full px-2">
                        <input
                            type="number"
                            inputMode="decimal"
                            value={value === 0 ? '' : value.toString()}
                            placeholder="0"
                            onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                if (!isNaN(val)) onChange(val);
                                else if (e.target.value === '') onChange(0);
                            }}
                            className={`
                                bg-transparent text-center w-full focus:outline-none 
                                font-mono font-bold ${fontSize} tracking-tighter tabular-nums leading-none text-white 
                                drop-shadow-md transition-all appearance-none m-0 p-0
                                placeholder-white/20
                                [&::-webkit-inner-spin-button]:appearance-none
                            `}
                            style={{ textShadow: value > 0 ? `0 0 15px ${color}60` : 'none' }}
                        />
                    </div>
                    {subLabel && <span className="absolute bottom-1.5 text-[8px] font-bold text-zinc-500 uppercase pointer-events-none">{subLabel}</span>}
                </div>

                {/* Plus Button */}
                <button
                    {...plusLongPress}
                    className="relative z-10 w-12 md:w-14 flex items-center justify-center bg-transparent hover:bg-white/5 active:bg-white/10 transition-colors border-l border-white/5"
                >
                    <Plus size={16} className="text-zinc-400 group-hover:text-white transition-colors" />
                </button>
            </div>
        </div>
    );
};

const Controls: React.FC<ControlsProps> = ({ pattern, onChange, rounds, onRoundsChange, readOnly = false }) => {
    const [isPresetOpen, setPresetOpen] = useState(false);
    const listRef = useRef<HTMLDivElement>(null);

    const findCurrentPresetIndex = () => {
        if (!pattern.presets) return -1;
        return pattern.presets.findIndex(p =>
            p.inhale === pattern.inhale &&
            p.holdIn === pattern.holdIn &&
            p.exhale === pattern.exhale &&
            p.holdOut === pattern.holdOut &&
            (pattern.mode === 'wim-hof' ? p.breathCount === pattern.breathCount : true)
        );
    };

    const currentPresetIndex = findCurrentPresetIndex();
    const isCustom = currentPresetIndex === -1 && (pattern.presets?.length || 0) > 0;

    useEffect(() => {
        if (isPresetOpen && listRef.current && currentPresetIndex !== -1) {
            const item = listRef.current.children[currentPresetIndex] as HTMLElement;
            if (item) item.scrollIntoView({ block: 'center', behavior: 'auto' });
        }
    }, [isPresetOpen, currentPresetIndex]);

    const applyPreset = (index: number) => {
        if (!pattern.presets || !pattern.presets[index]) return;
        const p = pattern.presets[index];
        onChange({
            ...pattern,
            inhale: p.inhale,
            holdIn: p.holdIn,
            exhale: p.exhale,
            holdOut: p.holdOut,
            breathCount: p.breathCount ?? pattern.breathCount,
            retentionProfile: p.retentionProfile ?? pattern.retentionProfile
        });
        setPresetOpen(false);
    };

    if (readOnly) return null;

    const showHoldIn = pattern.holdIn > 0 || pattern.mode === 'manual' || pattern.mode === 'wim-hof';
    const showHoldOut = pattern.holdOut > 0 || pattern.mode === 'manual';

    const getGridCols = () => {
        if (pattern.mode === 'wim-hof') return 'grid-cols-1 sm:grid-cols-3';
        let count = 2;
        if (showHoldIn) count++;
        if (showHoldOut) count++;
        if (count === 4) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
        if (count === 3) return 'grid-cols-1 sm:grid-cols-3';
        return 'grid-cols-1 sm:grid-cols-2';
    };

    return (
        <div className="w-full animate-fade-in flex flex-col gap-6">

            {/* 1. TOP BAR: Presets & Rounds (Floating Islands) */}
            <div className="flex items-stretch gap-4 w-full relative z-50">

                {/* Custom Presets Selector */}
                {pattern.presets && pattern.presets.length > 0 && (
                    <div className="relative flex-grow min-w-0">
                        <div className="grid grid-cols-[44px_1fr_44px] items-center bg-white/40 dark:bg-[#0a0a0b]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-2xl h-14 hover:border-black/10 dark:hover:border-white/20 transition-colors shadow-lg ring-1 ring-black/5 dark:ring-white/5">

                            <button
                                onClick={() => pattern.presets && applyPreset(currentPresetIndex > 0 ? currentPresetIndex - 1 : 0)}
                                disabled={currentPresetIndex <= 0 && !isCustom}
                                className="h-full flex items-center justify-center text-zinc-500 hover:text-white disabled:opacity-20 border-r border-white/5 active:bg-white/5"
                            >
                                <ChevronLeft size={20} />
                            </button>

                            <button
                                onClick={() => setPresetOpen(true)}
                                className="h-full flex flex-col items-center justify-center px-2 cursor-pointer w-full group overflow-hidden relative active:bg-white/5 transition-colors"
                            >
                                <div className="flex items-center gap-2 max-w-full">
                                    <List size={14} className="text-zinc-500 shrink-0" />
                                    <span className="text-[11px] font-bold text-zinc-300 group-hover:text-white uppercase tracking-widest truncate">
                                        {isCustom ? 'Свой режим' : pattern.presets[currentPresetIndex]?.name.split(' • ')[0]}
                                    </span>
                                    <ChevronDown size={12} className="text-zinc-500 shrink-0" />
                                </div>
                                {!isCustom && pattern.presets[currentPresetIndex]?.name.includes(' • ') && (
                                    <span className="text-[9px] text-cyan-500/70 font-bold uppercase tracking-wider absolute bottom-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {pattern.presets[currentPresetIndex]?.name.split(' • ')[1]}
                                    </span>
                                )}
                            </button>

                            <button
                                onClick={() => pattern.presets && applyPreset(currentPresetIndex < pattern.presets.length - 1 ? currentPresetIndex + 1 : 0)}
                                disabled={currentPresetIndex >= (pattern.presets?.length || 0) - 1}
                                className="h-full flex items-center justify-center text-zinc-500 hover:text-white disabled:opacity-20 border-l border-white/5 active:bg-white/5"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        {/* PRESET DROPDOWN */}
                        <AnimatePresence>
                            {isPresetOpen && (
                                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                                    <MotionDiv
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onClick={() => setPresetOpen(false)}
                                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                                    />

                                    <MotionDiv
                                        initial={{ scale: 0.95, opacity: 0, y: 10 }}
                                        animate={{ scale: 1, opacity: 1, y: 0 }}
                                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                                        className="w-full max-w-sm bg-[#121212] border border-white/10 rounded-3xl shadow-2xl relative z-10 max-h-[60vh] flex flex-col overflow-hidden"
                                    >
                                        <div className="px-5 py-4 bg-white/5 border-b border-white/5 flex justify-between items-center">
                                            <span className="text-xs font-bold uppercase text-zinc-400 tracking-widest flex items-center gap-2">
                                                <Settings2 size={14} /> Выберите уровень
                                            </span>
                                            <button onClick={() => setPresetOpen(false)} className="p-1 hover:bg-white/10 rounded-full text-zinc-500 hover:text-white transition-colors">
                                                <ChevronUp size={18} />
                                            </button>
                                        </div>

                                        <div ref={listRef} className="overflow-y-auto custom-scrollbar flex-1 p-2">
                                            {pattern.presets?.map((p, idx) => {
                                                const isActive = idx === currentPresetIndex;
                                                const parts = p.name.split(' • ');
                                                return (
                                                    <button
                                                        key={idx}
                                                        onClick={() => applyPreset(idx)}
                                                        className={`w-full text-left px-4 py-3 rounded-2xl mb-1 flex items-center justify-between transition-all group ${isActive
                                                            ? 'bg-white/10 text-cyan-400 border border-white/5'
                                                            : 'hover:bg-white/5 text-zinc-400 border border-transparent'
                                                            }`}
                                                    >
                                                        <div className="flex flex-col min-w-0">
                                                            <span className={`text-[11px] font-bold uppercase tracking-wide truncate ${isActive ? 'text-cyan-400' : 'text-zinc-300'}`}>
                                                                {parts[0]}
                                                            </span>
                                                            {parts[1] && (
                                                                <span className={`text-[9px] font-medium mt-0.5 ${isActive ? 'text-cyan-500/60' : 'text-zinc-600'}`}>
                                                                    {parts[1]}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {isActive && <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_cyan] shrink-0 ml-2"></div>}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </MotionDiv>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {/* Rounds Selector */}
                {pattern.mode !== 'stopwatch' && pattern.mode !== 'wim-hof' && (
                    <div className="flex items-center gap-1 bg-white/40 dark:bg-[#0a0a0b]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-2xl px-1 h-14 hover:border-black/10 dark:hover:border-white/20 transition-colors shrink-0 shadow-lg ring-1 ring-black/5 dark:ring-white/5">
                        <button onClick={() => onRoundsChange(Math.max(0, rounds - 1))} className="w-10 h-full flex items-center justify-center text-zinc-500 hover:text-white transition-colors active:scale-90"><Minus size={18} /></button>
                        <div className="flex flex-col items-center w-10 justify-center min-h-[20px]">
                            {rounds === 0 ? (
                                <Hourglass size={16} className="text-white rotate-90" />
                            ) : (
                                <span className="font-mono font-bold text-lg text-white leading-none">{rounds}</span>
                            )}
                            <span className="text-[7px] font-bold uppercase text-zinc-600 mt-0.5">Круги</span>
                        </div>
                        <button onClick={() => onRoundsChange(rounds + 1)} className="w-10 h-full flex items-center justify-center text-zinc-500 hover:text-white transition-colors active:scale-90"><Plus size={18} /></button>
                    </div>
                )}
            </div>

            {/* 2. INPUTS GRID (REMOVED BACKGROUND CONTAINER - AIR UI) */}
            <div className="w-full relative z-10">
                {pattern.mode === 'stopwatch' ? (
                    <div className="text-center flex flex-col items-center gap-3 py-4">
                        <div className="w-12 h-12 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-500 shadow-inner">
                            <Clock size={24} />
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Свободный режим</div>
                    </div>
                ) : (
                    <div className={`grid gap-4 ${getGridCols()}`}>
                        {pattern.mode === 'wim-hof' ? (
                            <>
                                <LiquidInput label="Вдохи" value={pattern.breathCount || 30} step={5} color="#22d3ee" onChange={(v) => onChange({ ...pattern, breathCount: v })} />
                                <LiquidInput label="Темп" subLabel="с" value={pattern.inhale} step={0.1} color="#94a3b8" onChange={(v) => onChange({ ...pattern, inhale: v, exhale: v * 0.6 })} />
                                <LiquidInput label="Восстан." subLabel="с" value={pattern.holdIn} step={1} color="#7C3AED" onChange={(v) => onChange({ ...pattern, holdIn: v })} />
                            </>
                        ) : (
                            <>
                                <LiquidInput label="Вдох" value={pattern.inhale} step={1} color="#22d3ee" onChange={(v) => onChange({ ...pattern, inhale: v })} />

                                {showHoldIn && (
                                    <LiquidInput label="Задержка" value={pattern.holdIn} step={1} color="#F59E0B" onChange={(v) => onChange({ ...pattern, holdIn: v })} />
                                )}

                                <LiquidInput label="Выдох" value={pattern.exhale} step={1} color="#7C3AED" onChange={(v) => onChange({ ...pattern, exhale: v })} />

                                {showHoldOut && (
                                    <LiquidInput label="Пауза" value={pattern.holdOut} step={1} color="#fb7185" onChange={(v) => onChange({ ...pattern, holdOut: v })} />
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

        </div>
    );
};

export default React.memo(Controls);
