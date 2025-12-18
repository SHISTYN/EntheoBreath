import React from 'react';
import { BreathingPhase } from '../types';

interface TimerVisualProps {
  phase: BreathingPhase;
  timeLeft: number;
  totalTimeForPhase: number;
  label: string;
  patternId?: string;
  currentRound?: number;
  currentBreath?: number;
  totalBreaths?: number;
  mode?: 'loop' | 'wim-hof' | 'stopwatch';
  theme?: 'dark' | 'light';
}

const TimerVisual: React.FC<TimerVisualProps> = ({ 
    phase, 
    timeLeft, 
    totalTimeForPhase, 
    label, 
    patternId, 
    currentRound = 1,
    currentBreath = 0,
    totalBreaths = 30,
    mode = 'loop',
    theme = 'dark'
}) => {
  
  // --- Mode Detection ---
  const isWimHof = mode === 'wim-hof';
  const isWimHofBreathing = isWimHof && (phase === BreathingPhase.Inhale || phase === BreathingPhase.Exhale);
  const isWimHofRetention = isWimHof && phase === BreathingPhase.HoldOut;
  const isWimHofRecovery = isWimHof && phase === BreathingPhase.HoldIn;

  // --- Progress Calculations ---
  // 1. Time Progress (Standard)
  const timeProgress = totalTimeForPhase > 0 ? (totalTimeForPhase - timeLeft) / totalTimeForPhase : 0;
  
  // 2. Breath Count Progress (Wim Hof Specific)
  const breathProgress = isWimHofBreathing ? (currentBreath / totalBreaths) : 0;

  // --- Color Logic ---
  let phaseColorClass = '';
  let glowColor = '';
  let strokeColor = '';

  if (isWimHof) {
      if (isWimHofBreathing) {
          // Cold / Energy Charge
          phaseColorClass = 'text-cyan-400';
          glowColor = '#22d3ee'; // Cyan-400
          strokeColor = '#22d3ee';
      } else if (isWimHofRetention) {
          // Fire / Retention
          phaseColorClass = 'text-orange-500';
          glowColor = '#f97316'; // Orange-500
          strokeColor = '#f97316';
      } else if (isWimHofRecovery) {
          // Recovery / Balance
          phaseColorClass = 'text-purple-400';
          glowColor = '#a855f7'; // Purple-500
          strokeColor = '#a855f7';
      } else {
          // Ready / Done
          phaseColorClass = 'text-white';
          glowColor = '#9ca3af';
          strokeColor = '#ffffff';
      }
  } else {
      // Standard Colors for other modes
      switch (phase) {
          case BreathingPhase.Inhale:
              phaseColorClass = 'text-zen-accent'; 
              glowColor = '#22d3ee';
              strokeColor = '#22d3ee';
              break;
          case BreathingPhase.Exhale:
              phaseColorClass = 'text-premium-purple'; 
              glowColor = '#7C3AED';
              strokeColor = '#7C3AED';
              break;
          case BreathingPhase.HoldIn:
              phaseColorClass = 'text-premium-gold'; 
              glowColor = '#F59E0B';
              strokeColor = '#F59E0B';
              break;
          case BreathingPhase.HoldOut:
              phaseColorClass = 'text-rose-400';
              glowColor = '#fb7185';
              strokeColor = '#fb7185';
              break;
          default:
              phaseColorClass = 'text-white';
              glowColor = '#9ca3af';
              strokeColor = '#9ca3af';
      }
  }

  // --- Display Value Logic ---
  let mainValue = timeLeft.toFixed(1);
  let subText = label;
  let bottomText = "";

  if (mode === 'stopwatch') {
      const totalSeconds = timeLeft;
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = Math.floor(totalSeconds % 60);
      const ms = Math.floor((totalSeconds % 1) * 10);
      mainValue = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms}`;
      subText = "Секундомер";
  } else if (isWimHof) {
      if (isWimHofBreathing) {
          mainValue = `${currentBreath}`;
          subText = phase === BreathingPhase.Inhale ? "ВДОХ" : "ВЫДОХ";
          bottomText = `РАУНД ${currentRound} • ЦЕЛЬ: ${totalBreaths}`;
      } else if (isWimHofRetention) {
          // Show timer for retention
          const m = Math.floor(timeLeft / 60);
          const s = Math.floor(timeLeft % 60);
          // If retention is long, show MM:SS, otherwise just SS.s
          if (timeLeft > 60) {
              mainValue = `${m}:${s.toString().padStart(2, '0')}`;
          } else {
              mainValue = timeLeft.toFixed(1);
          }
          subText = "ЗАДЕРЖКА";
          bottomText = `РАУНД ${currentRound} • РАССЛАБЛЕНИЕ`;
      } else if (isWimHofRecovery) {
          mainValue = timeLeft.toFixed(0);
          subText = "ВОССТАНОВЛЕНИЕ";
          bottomText = "ВДОХ И ДЕРЖАТЬ";
      } else {
           // Ready / Done
           mainValue = timeLeft.toFixed(0);
           subText = label;
      }
  } else if (Number.isInteger(timeLeft)) {
      mainValue = timeLeft.toString();
  }

  // --- Nose Logic (Legacy for Anuloma/Surya/Chandra) ---
  const isAnuloma = patternId === 'anuloma-viloma-base';
  const isSurya = patternId === 'surya-bhedana';
  const isChandra = patternId === 'chandra-bhedana';
  const isNoseTechnique = isAnuloma || isSurya || isChandra;
  let closeLeft = false;
  let closeRight = false;
  
  if (isNoseTechnique && !isWimHof) {
      const isOddRound = currentRound % 2 !== 0; 
      subText = label; // Reset subtext if nose logic overrides it
      if (isAnuloma) {
          if (phase === BreathingPhase.Inhale) {
              if (isOddRound) { closeRight = true; subText = "ВДОХ ЛЕВОЙ"; } 
              else { closeLeft = true; subText = "ВДОХ ПРАВОЙ"; }
          } else if (phase === BreathingPhase.Exhale) {
              if (isOddRound) { closeLeft = true; subText = "ВЫДОХ ПРАВОЙ"; } 
              else { closeRight = true; subText = "ВЫДОХ ЛЕВОЙ"; }
          } else { closeLeft = true; closeRight = true; subText = "ЗАДЕРЖКА"; }
      } else if (isSurya) {
          if (phase === BreathingPhase.Inhale) { closeLeft = true; subText = "ВДОХ ПРАВОЙ"; }
          else if (phase === BreathingPhase.Exhale) { closeRight = true; subText = "ВЫДОХ ЛЕВОЙ"; }
          else { closeLeft = true; closeRight = true; subText = "ЗАДЕРЖКА"; }
      } else if (isChandra) {
          if (phase === BreathingPhase.Inhale) { closeRight = true; subText = "ВДОХ ЛЕВОЙ"; }
          else if (phase === BreathingPhase.Exhale) { closeLeft = true; subText = "ВЫДОХ ПРАВОЙ"; }
          else { closeLeft = true; closeRight = true; subText = "ЗАДЕРЖКА"; }
      }
  }

  // --- Visual Scaling ---
  let scale = 1;
  // Subtle pulse on inhale/exhale for all modes
  if (!isWimHof && mode !== 'stopwatch') {
      if (phase === BreathingPhase.Inhale) scale = 1.05;
      if (phase === BreathingPhase.Exhale) scale = 0.95;
  }

  const containerSize = "w-[70vmin] h-[70vmin] max-w-[300px] max-h-[300px] md:w-[400px] md:h-[400px]";
  const orbSize = "w-[60vmin] h-[60vmin] max-w-[260px] max-h-[260px] md:w-[340px] md:h-[340px]";
  
  return (
    <div className={`relative ${containerSize} flex items-center justify-center flex-shrink-0`}>
        
        {/* 1. Ambient Glow (Pulsing) */}
        <div 
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] rounded-full blur-[80px] transition-all duration-1000 pointer-events-none ${isWimHofRetention ? 'opacity-50 animate-pulse' : 'opacity-30 animate-pulse-slow'}`}
            style={{ 
                backgroundColor: glowColor,
                transform: `translate(-50%, -50%) scale(${scale})` 
            }}
        />

        {/* 2. ORBITAL PARTICLES */}
        {mode !== 'stopwatch' && !isWimHofRetention && (
            <div className="absolute inset-[-20%] animate-orbit opacity-40 pointer-events-none z-0">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white blur-[2px] shadow-[0_0_10px_white]"></div>
            </div>
        )}

        {/* 3. PROGRESS RINGS (SVG LAYER) */}
        <svg 
            className={`absolute inset-0 w-full h-full rotate-[-90deg] pointer-events-none overflow-visible z-0`}
            viewBox="0 0 200 200"
        >
            {/* WIM HOF: BREATH COUNT RING (OUTER) */}
            {isWimHofBreathing && (
                <>
                    <circle cx="100" cy="100" r="98" fill="none" stroke={theme === 'light' ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.1)"} strokeWidth="2" />
                    <circle
                        cx="100"
                        cy="100"
                        r="98"
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 98}
                        strokeDashoffset={2 * Math.PI * 98 * (1 - breathProgress)}
                        className="transition-all duration-300 ease-linear"
                        style={{ filter: `drop-shadow(0 0 8px ${glowColor})`, opacity: 0.8 }}
                    />
                </>
            )}

            {/* WIM HOF: INDIVIDUAL BREATH TIME (INNER) or STANDARD TIME RING */}
            {/* Radius is smaller (84) for inner ring during WHM breathing, or normal (98) for others */}
            <circle
                cx="100"
                cy="100"
                r={isWimHofBreathing ? "84" : "98"}
                fill="none"
                stroke={theme === 'light' ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)"}
                strokeWidth={isWimHofBreathing ? "2" : "1"}
            />
            {mode !== 'stopwatch' && (
                <circle
                    cx="100"
                    cy="100"
                    r={isWimHofBreathing ? "84" : "98"}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={isWimHofBreathing ? "3" : "4"} 
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * (isWimHofBreathing ? 84 : 98)}
                    strokeDashoffset={2 * Math.PI * (isWimHofBreathing ? 84 : 98) * (1 - timeProgress)}
                    className="transition-all duration-100 ease-linear"
                    style={{ 
                        filter: `drop-shadow(0 0 10px ${glowColor})`,
                        opacity: isWimHofBreathing ? 0.6 : 1 
                    }}
                />
            )}
        </svg>

        {/* 4. THE ORB (Container) */}
        <div 
            className={`relative ${orbSize} rounded-full flex flex-col items-center justify-center transition-transform duration-[50ms] ease-linear z-10`}
            style={{ transform: `scale(${scale})` }}
        >
            {/* Background Glass */}
            <div className={`absolute inset-0 rounded-full border border-white/10 bg-[#0a0a0b]/80 backdrop-blur-2xl shadow-2xl transition-all duration-500 ${isWimHofRetention ? 'shadow-orange-500/20 bg-[#1a0a05]/90' : ''}`}></div>

            {/* Nose Viz (Legacy) */}
            {isNoseTechnique && !isWimHof && (
                <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-40">
                    <g className="stroke-gray-600 dark:stroke-gray-500" fill="none" strokeWidth="2" strokeLinecap="round">
                        <path d="M 100 40 L 100 110" />
                        <path d="M 90 125 Q 100 130 110 125" />
                        <path d="M 65 115 Q 75 105 90 125" />
                        <path d="M 135 115 Q 125 105 110 125" />
                    </g>
                    <path d="M 50 130 Q 60 90 95 115" className={`transition-all duration-300 ${closeLeft ? 'stroke-zen-accent opacity-100' : 'stroke-gray-800 opacity-20'}`} fill="none" strokeWidth="12" strokeLinecap="round" />
                    <path d="M 150 130 Q 140 90 105 115" className={`transition-all duration-300 ${closeRight ? 'stroke-zen-accent opacity-100' : 'stroke-gray-800 opacity-20'}`} fill="none" strokeWidth="12" strokeLinecap="round" />
                </svg>
            )}

            {/* --- CONTENT LAYER --- */}
            <div className="relative z-10 flex flex-col items-center justify-between h-full w-full py-8 md:py-12">
                
                {/* Top Spacer */}
                <div className="h-6"></div>

                {/* Main Value */}
                <div className="flex-1 flex flex-col items-center justify-center -mt-2">
                    <span className={`text-[18vmin] md:text-8xl font-display font-bold tabular-nums tracking-tighter ${phaseColorClass} drop-shadow-lg leading-none transition-colors duration-300`}>
                        {mainValue}
                    </span>
                    {/* Breath Counter Subtext for WHM Breathing */}
                    {isWimHofBreathing && (
                        <span className="text-gray-500 text-xs font-mono mt-2">
                            из {totalBreaths}
                        </span>
                    )}
                </div>

                {/* Status Pill */}
                <div className="mb-4 md:mb-6 flex flex-col items-center gap-2">
                    <div className={`px-4 md:px-6 py-2 rounded-full border border-white/10 bg-black/40 backdrop-blur-md shadow-lg transition-all duration-300 
                        ${isWimHofBreathing ? 'border-cyan-500/30 bg-cyan-900/20 shadow-glow-cyan' : ''}
                        ${isWimHofRetention ? 'border-orange-500/30 bg-orange-900/20 shadow-glow-gold' : ''}
                        ${isWimHofRecovery ? 'border-purple-500/30 bg-purple-900/20 shadow-glow-purple' : ''}
                    `}>
                         <span className={`text-[10px] md:text-sm font-bold uppercase tracking-[0.2em] whitespace-nowrap text-gray-200`}>
                            {subText}
                        </span>
                    </div>

                    {/* Bottom Info Text (Round info for WHM) */}
                    {bottomText && (
                        <div className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-gray-500 animate-fade-in">
                            {bottomText}
                        </div>
                    )}
                </div>

                {/* Legacy Nose Indicators */}
                {isNoseTechnique && !isWimHof && (
                    <>
                        <div className={`absolute bottom-6 md:bottom-10 left-6 md:left-12 text-[8px] md:text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${closeLeft ? 'text-zen-accent opacity-100' : 'text-gray-600 opacity-30'}`}>Безымянный</div>
                        <div className={`absolute bottom-6 md:bottom-10 right-6 md:left-auto md:right-12 text-[8px] md:text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${closeRight ? 'text-zen-accent opacity-100' : 'text-gray-600 opacity-30'}`}>Большой</div>
                    </>
                )}
            </div>
        </div>
    </div>
  );
};

export default TimerVisual;