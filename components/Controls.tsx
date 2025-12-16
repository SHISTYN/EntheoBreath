import React from 'react';
import { BreathingPattern } from '../types';

interface ControlsProps {
  pattern: BreathingPattern;
  onChange: (newPattern: BreathingPattern) => void;
  rounds: number;
  onRoundsChange: (r: number) => void;
  readOnly?: boolean;
}

const PhaseControl: React.FC<{ label: string; value: number; min: number; max: number; step: number; onChange: (val: number) => void; color: string; unit?: string }> = ({ label, value, min, max, step, onChange, color, unit = 'c' }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
      onChange(isNaN(val) ? 0 : val);
  };

  return (
    <div className="flex flex-col items-center p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
        <div className="text-[10px] font-bold uppercase tracking-widest mb-2 opacity-70" style={{ color: color }}>
            {label}
        </div>
        
        <div className="flex items-center gap-3 w-full justify-between">
            <button 
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-black/20 text-gray-400 hover:text-white hover:bg-black/40 transition-colors"
                onClick={() => onChange(Math.max(min, Number((value - step).toFixed(1))))}
            >
                <i className="fas fa-minus text-[10px]"></i>
            </button>
            
            <div className="flex items-center">
                <input
                    type="number"
                    min="0"
                    step={step}
                    value={value}
                    onChange={handleInputChange}
                    className="w-12 bg-transparent text-center text-xl font-mono text-white font-bold focus:outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none translate-y-[1px]"
                />
                {unit && <span className="text-[10px] text-gray-500 font-mono ml-1">{unit}</span>}
            </div>

            <button 
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-black/20 text-gray-400 hover:text-white hover:bg-black/40 transition-colors"
                onClick={() => onChange(Math.min(max, Number((value + step).toFixed(1))))}
            >
                <i className="fas fa-plus text-[10px]"></i>
            </button>
        </div>
    </div>
  );
};

const Controls: React.FC<ControlsProps> = ({ pattern, onChange, rounds, onRoundsChange, readOnly = false }) => {
  
  const findCurrentPresetIndex = () => {
    if (!pattern.presets) return -1;
    // Simple equality check is tricky with breaths, but good enough for now
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
          breathCount: p.breathCount ?? pattern.breathCount
      });
  };

  const handlePrevLevel = () => {
      if (!pattern.presets) return;
      if (currentPresetIndex > 0) applyPreset(currentPresetIndex - 1);
      else if (currentPresetIndex === -1) applyPreset(0);
  };

  const handleNextLevel = () => {
      if (!pattern.presets) return;
      if (currentPresetIndex < pattern.presets.length - 1) applyPreset(currentPresetIndex + 1);
      else if (currentPresetIndex === -1) applyPreset(0);
  };

  if (readOnly) return null;

  return (
    <div className="w-full animate-fade-in flex flex-col items-center">
      
      {/* 1. Level / Preset Selector */}
      {pattern.presets && pattern.presets.length > 0 && (
          <div className="flex items-center justify-between bg-white/5 p-1.5 rounded-full mb-6 border border-white/5 w-full max-w-sm shadow-lg shadow-black/20">
              <button 
                onClick={handlePrevLevel}
                disabled={currentPresetIndex <= 0 && !isCustom}
                className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white disabled:opacity-30 transition-all"
              >
                  <i className="fas fa-chevron-left text-xs"></i>
              </button>

              <div className="text-center px-2 flex-1 overflow-hidden">
                  <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">Уровень</div>
                  <div className="font-bold text-white text-sm whitespace-nowrap overflow-x-auto no-scrollbar">
                      {isCustom ? 'Пользовательский' : pattern.presets[currentPresetIndex]?.name}
                  </div>
              </div>

              <button 
                onClick={handleNextLevel}
                disabled={currentPresetIndex >= (pattern.presets.length - 1)}
                className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white disabled:opacity-30 transition-all"
              >
                  <i className="fas fa-chevron-right text-xs"></i>
              </button>
          </div>
      )}

      {/* 2. Unified Control Panel */}
      <div className="bg-[#1c1c1e]/80 backdrop-blur-md rounded-3xl p-6 border border-white/5 shadow-2xl w-full max-w-2xl">
          <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Настройки цикла</h3>
              {/* Rounds Counter Inline */}
              <div className="flex items-center gap-3 bg-black/20 px-3 py-1 rounded-lg border border-white/5">
                    <span className="text-[10px] text-gray-500 font-bold uppercase">Раунды</span>
                    <button onClick={() => onRoundsChange(Math.max(0, rounds - 1))} className="text-gray-400 hover:text-white">-</button>
                    <span className="font-mono font-bold text-white min-w-[20px] text-center">{rounds === 0 ? '∞' : rounds}</span>
                    <button onClick={() => onRoundsChange(rounds + 1)} className="text-gray-400 hover:text-white">+</button>
              </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
             {pattern.mode === 'wim-hof' ? (
                 // Special controls for Wim Hof
                 <>
                    <PhaseControl 
                        label="Вдохов" 
                        color="#22d3ee" 
                        value={pattern.breathCount || 30} 
                        min={10} max={100} step={5} 
                        unit=""
                        onChange={(v) => onChange({ ...pattern, breathCount: v })} 
                    />
                    <PhaseControl 
                        label="Темп (сек)" 
                        color="#a1a1aa" 
                        value={pattern.inhale} 
                        min={0.8} max={4.0} step={0.1} 
                        unit=""
                        onChange={(v) => onChange({ ...pattern, inhale: v, exhale: v * 0.6 })} // Keep ratio roughly
                    />
                    <PhaseControl 
                        label="Задержка (База)" 
                        color="#ffffff" 
                        value={pattern.holdOut} 
                        min={15} max={300} step={15} 
                        onChange={(v) => onChange({ ...pattern, holdOut: v })} 
                    />
                    <PhaseControl 
                        label="Восстан." 
                        color="#818cf8" 
                        value={pattern.holdIn} 
                        min={10} max={60} step={5} 
                        onChange={(v) => onChange({ ...pattern, holdIn: v })} 
                    />
                 </>
             ) : (
                 // Standard controls
                 <>
                    <PhaseControl 
                        label="Вдох" 
                        color="#22d3ee" 
                        value={pattern.inhale} 
                        min={0} max={180} step={0.5} 
                        onChange={(v) => onChange({ ...pattern, inhale: v })} 
                    />
                    <PhaseControl 
                        label="Задержка" 
                        color="#ffffff" 
                        value={pattern.holdIn} 
                        min={0} max={300} step={0.5} 
                        onChange={(v) => onChange({ ...pattern, holdIn: v })} 
                    />
                    <PhaseControl 
                        label="Выдох" 
                        color="#818cf8" 
                        value={pattern.exhale} 
                        min={0} max={180} step={0.5} 
                        onChange={(v) => onChange({ ...pattern, exhale: v })} 
                    />
                    <PhaseControl 
                        label="Пауза" 
                        color="#9ca3af" 
                        value={pattern.holdOut} 
                        min={0} max={300} step={0.5} 
                        onChange={(v) => onChange({ ...pattern, holdOut: v })} 
                    />
                 </>
             )}
          </div>
      </div>

    </div>
  );
};

export default Controls;