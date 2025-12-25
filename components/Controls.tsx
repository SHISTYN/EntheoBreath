import React, { useEffect, useState } from 'react';
import { BreathingPattern } from '../types';
import { motion } from 'framer-motion';

// Fix for Framer Motion type mismatch
const MotionButton = motion.button as any;

interface ControlsProps {
  pattern: BreathingPattern;
  onChange: (newPattern: BreathingPattern) => void;
  rounds: number;
  onRoundsChange: (r: number) => void;
  readOnly?: boolean;
}

// Ultra-Compact Input (Glass Capsule Style)
const MinimalInput: React.FC<{ 
    label: string; 
    value: number; 
    step: number; 
    onChange: (val: number) => void; 
    color: string;
    subLabel?: string;
}> = ({ label, value, step, onChange, color, subLabel }) => {

    const [localValue, setLocalValue] = useState(value.toString());

    useEffect(() => {
        setLocalValue(value.toString());
    }, [value]);

    const handleBlur = () => {
        let val = parseFloat(localValue);
        if (isNaN(val)) val = 0;
        val = Math.round(val * 10) / 10;
        setLocalValue(val.toString());
        onChange(val);
    };

    return (
        <div className="flex flex-col items-center justify-center group p-1 w-full h-full">
            {/* Label */}
            <div className="flex flex-col items-center mb-1.5 opacity-80 transition-opacity group-hover:opacity-100">
                <span className="text-[10px] font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: color }}>
                    {label}
                </span>
                {subLabel && <span className="text-[8px] text-gray-500 mt-0.5">{subLabel}</span>}
            </div>

            {/* Controls Capsule */}
            <div className="flex items-center justify-between gap-1 w-full bg-white/5 border border-white/5 rounded-2xl p-1 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-lg">
                {/* Minus */}
                <MotionButton 
                    whileTap={{ scale: 0.8 }}
                    onClick={() => onChange(Math.max(0, Number((value - step).toFixed(1))))}
                    className="w-10 h-10 md:w-12 md:h-10 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <i className="fas fa-minus text-xs"></i>
                </MotionButton>

                {/* Value */}
                <div className="flex-1 text-center min-w-[40px]">
                    <input
                        type="number"
                        inputMode="decimal"
                        step={step}
                        value={localValue}
                        onChange={(e) => setLocalValue(e.target.value)}
                        onBlur={handleBlur}
                        className="w-full bg-transparent text-center text-xl font-display font-bold text-gray-900 dark:text-white outline-none p-0 appearance-none leading-none border-none focus:ring-0 drop-shadow-sm"
                        style={{ MozAppearance: 'textfield' }}
                    />
                </div>

                {/* Plus */}
                <MotionButton 
                    whileTap={{ scale: 0.8 }}
                    onClick={() => onChange(Number((value + step).toFixed(1)))}
                    className="w-10 h-10 md:w-12 md:h-10 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <i className="fas fa-plus text-xs"></i>
                </MotionButton>
            </div>
            
            <style>{`
                input[type=number]::-webkit-inner-spin-button, 
                input[type=number]::-webkit-outer-spin-button { 
                    -webkit-appearance: none; 
                    margin: 0; 
                }
            `}</style>
        </div>
    );
};

const Controls: React.FC<ControlsProps> = ({ pattern, onChange, rounds, onRoundsChange, readOnly = false }) => {
  
  // Logic to find presets
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
  };

  // Determine layout class based on number of active fields
  const activeFieldsCount = [
      true, // Inhale always visible
      pattern.holdIn > 0,
      true, // Exhale always visible
      pattern.holdOut > 0
  ].filter(Boolean).length;

  // If 3 or fewer items, use a single row (flex-nowrap). If more, grid or wrap.
  const layoutClass = pattern.mode === 'wim-hof' 
      ? 'grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4' 
      : activeFieldsCount <= 3 
          ? 'flex flex-row flex-nowrap items-stretch justify-between gap-3 w-full' 
          : 'flex flex-wrap items-center justify-center gap-3 md:gap-4';

  const itemClass = activeFieldsCount <= 3 
      ? 'flex-1 min-w-0' // stretch in row
      : 'w-[48%] md:flex-1 min-w-[120px]'; // standard wrap behavior

  if (readOnly) return null;

  return (
    <div className="w-full animate-fade-in flex flex-col gap-4">
      
      {/* 1. TOP BAR: Presets & Rounds (Glass Pill) */}
      <div className="flex flex-col sm:flex-row items-stretch justify-between gap-3 w-full">
          
          {/* Presets Selector */}
          {pattern.presets && pattern.presets.length > 0 && (
              <div className="flex items-center gap-2 bg-white/50 dark:bg-white/5 rounded-xl px-2 py-2 border border-gray-200 dark:border-white/5 flex-grow shadow-sm backdrop-blur-md">
                  <MotionButton 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => pattern.presets && applyPreset(currentPresetIndex > 0 ? currentPresetIndex - 1 : 0)}
                    disabled={currentPresetIndex <= 0 && !isCustom}
                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 text-gray-400 hover:text-white disabled:opacity-20 transition-all"
                  >
                      <i className="fas fa-chevron-left text-xs"></i>
                  </MotionButton>
                  <span className="text-sm font-bold text-gray-900 dark:text-white truncate text-center flex-1 tracking-wide">
                      {isCustom ? 'Свой' : pattern.presets[currentPresetIndex]?.name}
                  </span>
                  <MotionButton 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => pattern.presets && applyPreset(currentPresetIndex < pattern.presets.length - 1 ? currentPresetIndex + 1 : 0)}
                    disabled={currentPresetIndex >= (pattern.presets?.length || 0) - 1}
                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 text-gray-400 hover:text-white disabled:opacity-20 transition-all"
                  >
                      <i className="fas fa-chevron-right text-xs"></i>
                  </MotionButton>
              </div>
          )}

          {/* Rounds Selector (Full width on mobile if needed, or grouped) */}
          {pattern.mode !== 'stopwatch' && pattern.mode !== 'wim-hof' && (
              <div className="flex items-center justify-center gap-4 bg-white/50 dark:bg-white/5 rounded-xl px-4 py-2 border border-gray-200 dark:border-white/5 shadow-sm backdrop-blur-md min-w-[200px]">
                  <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Раунды</span>
                  <div className="w-px h-4 bg-gray-300 dark:bg-white/10 mx-1"></div>
                  <MotionButton whileTap={{ scale: 0.8 }} onClick={() => onRoundsChange(Math.max(0, rounds - 1))} className="text-gray-400 hover:text-white w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-lg transition-all"><i className="fas fa-minus text-xs"></i></MotionButton>
                  <span className="font-mono text-lg font-bold text-gray-900 dark:text-white w-8 text-center">{rounds === 0 ? '∞' : rounds}</span>
                  <MotionButton whileTap={{ scale: 0.8 }} onClick={() => onRoundsChange(rounds + 1)} className="text-gray-400 hover:text-white w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-lg transition-all"><i className="fas fa-plus text-xs"></i></MotionButton>
              </div>
          )}
      </div>

      {/* 2. MAIN CONTROLS GRID */}
      <div className="w-full bg-white/50 dark:bg-[#121212]/50 border border-gray-200 dark:border-white/5 rounded-2xl p-4 md:p-6 backdrop-blur-xl shadow-glass">
         {pattern.mode === 'stopwatch' ? (
             <div className="text-center text-xs text-gray-500 py-2">Режим секундомера</div> 
         ) : (
             <div className="flex flex-col gap-6">
                 {/* 
                     ADAPTIVE LAYOUT:
                     - Wim Hof: Fixed 3 columns
                     - Standard: Flexible Flexbox based on activeFieldsCount
                 */}
                 <div className={layoutClass}>
                     {pattern.mode === 'wim-hof' ? (
                         <>
                            <MinimalInput label="Вдохи" value={pattern.breathCount || 30} step={5} color="#22d3ee" onChange={(v) => onChange({ ...pattern, breathCount: v })} />
                            {/* Combined Pace Control */}
                            <MinimalInput 
                                label="Темп" 
                                subLabel="(Вдох)"
                                value={pattern.inhale} 
                                step={0.1} 
                                color="#94a3b8" 
                                onChange={(v) => onChange({ ...pattern, inhale: v, exhale: v * 0.6 })} // Auto-adjust exhale to keep ratio
                            />
                            {/* Recovery */}
                            <MinimalInput label="Восстан." value={pattern.holdIn} step={5} color="#7C3AED" onChange={(v) => onChange({ ...pattern, holdIn: v })} />
                         </>
                     ) : (
                         <>
                            {/* INHALE (Always visible) */}
                            <div className={itemClass}>
                                <MinimalInput label="Вдох" value={pattern.inhale} step={0.5} color="#22d3ee" onChange={(v) => onChange({ ...pattern, inhale: v })} />
                            </div>

                            {/* HOLD IN (Conditional) */}
                            {pattern.holdIn > 0 && (
                                <div className={itemClass}>
                                    <MinimalInput label="Задержка" value={pattern.holdIn} step={0.5} color="#F59E0B" onChange={(v) => onChange({ ...pattern, holdIn: v })} />
                                </div>
                            )}

                            {/* EXHALE (Always visible) */}
                            <div className={itemClass}>
                                <MinimalInput label="Выдох" value={pattern.exhale} step={0.5} color="#7C3AED" onChange={(v) => onChange({ ...pattern, exhale: v })} />
                            </div>

                            {/* HOLD OUT (Conditional) */}
                            {pattern.holdOut > 0 && (
                                <div className={itemClass}>
                                    <MinimalInput label="Пауза" value={pattern.holdOut} step={0.5} color="#fb7185" onChange={(v) => onChange({ ...pattern, holdOut: v })} />
                                </div>
                            )}
                         </>
                     )}
                 </div>
             </div>
         )}
      </div>

    </div>
  );
};

export default Controls;