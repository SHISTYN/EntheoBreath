
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

// --- LONG PRESS HOOK (TURBO MODE) ---
// Accelerates value change when holding button
const useLongPress = (callback: () => void, speed: number = 200) => {
    const [startLongPress, setStartLongPress] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const speedRef = useRef(speed);

    const start = useCallback(() => {
        callback(); // Immediate action on click
        speedRef.current = 400; // Start slow
        timerRef.current = setTimeout(() => {
            setStartLongPress(true);
            intervalRef.current = setInterval(() => {
                callback();
                // Accelerate down to 50ms
                if (speedRef.current > 50) {
                    speedRef.current = Math.max(50, speedRef.current - 50);
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    intervalRef.current = setInterval(callback, speedRef.current);
                }
            }, speedRef.current);
        }, 500); // Delay before turbo starts
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

// --- PREMIUM LIQUID INPUT 3.0 ---
// Features: Manual Text Input + Long Press Buttons + Dynamic Scaling
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

    // Font sizing for large numbers (keeps them inside box)
    const fontSize = value >= 100 ? 'text-3xl' : 'text-4xl';

    return (
        <div className="flex flex-col w-full gap-1.5 group">
            {/* Label */}
            <div className="flex justify-center items-center">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500 transition-colors group-hover:text-zinc-300">
                    {label}
                </span>
            </div>

            {/* Glass Container */}
            <div className="relative flex items-stretch w-full h-16 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 ring-1 ring-white/5 group-hover:ring-white/15 bg-[#0a0a0b]">
                
                {/* Glow */}
                <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 z-0 pointer-events-none"
                    style={{ background: `radial-gradient(circle at center, ${color}, transparent 70%)` }}
                ></div>

                {/* Minus Button */}
                <button 
                    {...minusLongPress}
                    className="relative z-10 w-12 flex items-center justify-center bg-white/5 hover:bg-white/10 active:bg-white/20 transition-colors border-r border-white/5"
                >
                    <Minus size={18} className="text-zinc-400 group-hover:text-white transition-colors" />
                </button>

                {/* Center Value (Editable Input) */}
                <div className="relative z-10 flex-1 flex flex-col items-center justify-center overflow-hidden">
                    <div className="flex items-baseline gap-1 relative z-20 w-full px-2">
                        {/* MANUAL INPUT FIELD */}
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
                    {subLabel && <span className="absolute bottom-1.5 text-[7px] font-bold text-zinc-600 uppercase pointer-events-none">{subLabel}</span>}
                </div>

                {/* Plus Button */}
                <button 
                    {...plusLongPress}
                    className="relative z-10 w-12 flex items-center justify-center bg-white/5 hover:bg-white/10 active:bg-white/20 transition-colors border-l border-white/5"
                >
                    <Plus size={18} className="text-zinc-400 group-hover:text-white transition-colors" />
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

  // HIDE LOGIC
  const showHoldIn = pattern.holdIn > 0 || pattern.mode === 'manual' || pattern.mode === 'wim-hof';
  const showHoldOut = pattern.holdOut > 0 || pattern.mode === 'manual';

  // --- RESPONSIVE GRID LOGIC ---
  // Mobile (default): grid-cols-1 (Vertical stack for large digits)
  // Tablet (sm): grid-cols-2
  // Desktop (lg): grid-cols-3 or 4 (Horizontal row for space usage)
  const getGridCols = () => {
      if (pattern.mode === 'wim-hof') return 'grid-cols-1 sm:grid-cols-3';
      
      let count = 2; 
      if (showHoldIn) count++;
      if (showHoldOut) count++;
      
      // If 4 items (In, Hold, Out, Hold): 1 col mobile -> 2 col tablet -> 4 col PC
      if (count === 4) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
      
      // If 3 items (In, Hold, Out): 1 col mobile -> 3 col PC
      if (count === 3) return 'grid-cols-1 sm:grid-cols-3';
      
      // If 2 items: 1 col mobile -> 2 col PC
      return 'grid-cols-1 sm:grid-cols-2';
  };

  return (
    <div className="w-full animate-fade-in flex flex-col gap-4">
      
      {/* 1. TOP BAR: Presets & Rounds */}
      <div className="flex items-stretch gap-3 w-full relative z-50">
          
          {/* Custom Presets Selector */}
          {pattern.presets && pattern.presets.length > 0 && (
              <div className="relative flex-grow min-w-0">
                  <div className="grid grid-cols-[40px_1fr_40px] items-center bg-[#0a0a0b] border border-white/10 rounded-xl h-12 hover:border-white/20 transition-colors shadow-lg">
                      
                      <button 
                          onClick={() => pattern.presets && applyPreset(currentPresetIndex > 0 ? currentPresetIndex - 1 : 0)}
                          disabled={currentPresetIndex <= 0 && !isCustom}
                          className="h-full flex items-center justify-center text-zinc-500 hover:text-white disabled:opacity-20 border-r border-white/5 active:bg-white/5"
                      >
                          <ChevronLeft size={18} />
                      </button>

                      {/* MAIN DROPDOWN TRIGGER */}
                      <button 
                        onClick={() => setPresetOpen(true)}
                        className="h-full flex flex-col items-center justify-center px-2 cursor-pointer w-full group overflow-hidden relative active:bg-white/5 transition-colors"
                      >
                          <div className="flex items-center gap-2 max-w-full">
                              <List size={12} className="text-zinc-500 shrink-0" />
                              <span className="text-[10px] font-bold text-zinc-300 group-hover:text-white uppercase tracking-widest truncate">
                                  {isCustom ? 'Свой режим' : pattern.presets[currentPresetIndex]?.name.split(' • ')[0]}
                              </span>
                              <ChevronDown size={10} className="text-zinc-500 shrink-0"/>
                          </div>
                          {/* Optional Subtitle if name has bullet */}
                          {!isCustom && pattern.presets[currentPresetIndex]?.name.includes(' • ') && (
                              <span className="text-[8px] text-cyan-500/70 font-bold uppercase tracking-wider absolute bottom-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {pattern.presets[currentPresetIndex]?.name.split(' • ')[1]}
                              </span>
                          )}
                      </button>

                      <button 
                          onClick={() => pattern.presets && applyPreset(currentPresetIndex < pattern.presets.length - 1 ? currentPresetIndex + 1 : 0)}
                          disabled={currentPresetIndex >= (pattern.presets?.length || 0) - 1}
                          className="h-full flex items-center justify-center text-zinc-500 hover:text-white disabled:opacity-20 border-l border-white/5 active:bg-white/5"
                      >
                          <ChevronRight size={18} />
                      </button>
                  </div>

                  {/* FIXED OVERLAY DROPDOWN */}
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
                                className="w-full max-w-sm bg-[#121212] border border-white/10 rounded-2xl shadow-2xl relative z-10 max-h-[60vh] flex flex-col overflow-hidden"
                            >
                                <div className="px-4 py-3 bg-white/5 border-b border-white/5 flex justify-between items-center">
                                    <span className="text-xs font-bold uppercase text-zinc-400 tracking-widest flex items-center gap-2">
                                        <Settings2 size={12} /> Выберите уровень
                                    </span>
                                    <button onClick={() => setPresetOpen(false)} className="p-1 hover:bg-white/10 rounded text-zinc-500 hover:text-white transition-colors">
                                        <ChevronUp size={16} />
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
                                                className={`w-full text-left px-3 py-3 rounded-lg mb-1 flex items-center justify-between transition-all group ${
                                                    isActive 
                                                    ? 'bg-white/10 text-cyan-400 border border-white/5' 
                                                    : 'hover:bg-white/5 text-zinc-400 border border-transparent'
                                                }`}
                                            >
                                                <div className="flex flex-col min-w-0">
                                                    <span className={`text-[10px] font-bold uppercase tracking-wide truncate ${isActive ? 'text-cyan-400' : 'text-zinc-300'}`}>
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

          {/* Rounds Selector (Compact) */}
          {pattern.mode !== 'stopwatch' && pattern.mode !== 'wim-hof' && (
              <div className="flex items-center gap-1 bg-[#0a0a0b] border border-white/10 rounded-xl px-1 h-12 hover:border-white/20 transition-colors shrink-0 shadow-lg">
                  <button onClick={() => onRoundsChange(Math.max(0, rounds - 1))} className="w-8 h-full flex items-center justify-center text-zinc-500 hover:text-white transition-colors active:scale-90"><Minus size={16} /></button>
                  <div className="flex flex-col items-center w-8 justify-center min-h-[20px]">
                      {rounds === 0 ? (
                          <Hourglass size={14} className="text-white rotate-90" />
                      ) : (
                          <span className="font-mono font-bold text-sm text-white leading-none">{rounds}</span>
                      )}
                      <span className="text-[7px] font-bold uppercase text-zinc-600 mt-0.5">Круги</span>
                  </div>
                  <button onClick={() => onRoundsChange(rounds + 1)} className="w-8 h-full flex items-center justify-center text-zinc-500 hover:text-white transition-colors active:scale-90"><Plus size={16} /></button>
              </div>
          )}
      </div>

      {/* 2. INPUTS GRID */}
      <div className="w-full bg-[#0a0a0b]/40 border border-white/5 rounded-2xl p-4 backdrop-blur-md relative z-10">
         {pattern.mode === 'stopwatch' ? (
             <div className="text-center flex flex-col items-center gap-2 py-2">
                 <div className="w-10 h-10 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500">
                    <Clock size={20} />
                 </div>
                 <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Свободный режим</div> 
             </div>
         ) : (
             <div className={`grid gap-3 ${getGridCols()}`}>
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

export default Controls;
