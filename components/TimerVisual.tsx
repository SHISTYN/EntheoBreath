
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
  // For standard timer: 1 -> 0. For stopwatch: we keep ring full or specific animation.
  let timeProgress = totalTimeForPhase > 0 ? (totalTimeForPhase - timeLeft) / totalTimeForPhase : 0;
  
  // Override for Wim Hof Retention (Stopwatch mode) -> Always full ring (pulsing)
  if (isWimHofRetention) {
      timeProgress = 0; // Keep full ring
  }

  // --- Color Logic ---
  let phaseColorClass = '';
  let glowColor = '';
  let strokeColor = '';

  if (isWimHof) {
      if (isWimHofBreathing) {
          phaseColorClass = 'text-cyan-400';
          glowColor = '#22d3ee'; 
          strokeColor = '#22d3ee';
      } else if (isWimHofRetention) {
          phaseColorClass = 'text-white'; // White for stopwatch clarity
          glowColor = '#f97316'; // Orange glow
          strokeColor = '#f97316';
      } else if (isWimHofRecovery) {
          phaseColorClass = 'text-purple-400';
          glowColor = '#a855f7'; 
          strokeColor = '#a855f7';
      } else {
          phaseColorClass = 'text-white';
          glowColor = '#9ca3af';
          strokeColor = '#ffffff';
      }
  } else {
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
  let phaseTimerText = ""; 

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
          phaseTimerText = `${timeLeft.toFixed(1)}с`;
      } else if (isWimHofRetention) {
          // STRICT STOPWATCH FORMAT (MM:SS)
          const m = Math.floor(timeLeft / 60);
          const s = Math.floor(timeLeft % 60);
          mainValue = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
          
          subText = "ЗАДЕРЖКА";
          bottomText = `РАУНД ${currentRound} • РАССЛАБЛЕНИЕ`;
      } else if (isWimHofRecovery) {
          mainValue = timeLeft.toFixed(0);
          subText = "ВОССТАНОВЛЕНИЕ";
          bottomText = "ВДОХ И ДЕРЖАТЬ";
      } else {
           mainValue = timeLeft.toFixed(0);
           subText = label;
      }
  } else {
      if (Number.isInteger(timeLeft)) {
          mainValue = timeLeft.toString();
      }
      phaseTimerText = "";
  }

  // --- Nose Logic (Legacy) ---
  const isAnuloma = patternId === 'anuloma-viloma-base';
  const isSurya = patternId === 'surya-bhedana';
  const isChandra = patternId === 'chandra-bhedana';
  const isNoseTechnique = isAnuloma || isSurya || isChandra;
  let closeLeft = false;
  let closeRight = false;
  
  if (isNoseTechnique && !isWimHof) {
      const isOddRound = currentRound % 2 !== 0; 
      subText = label; 
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

  // --- Visual Scaling (Breathing Animation) ---
  let scale = 1;

  if (mode !== 'stopwatch') {
      if (phase === BreathingPhase.Inhale) {
          scale = 1.15;
      } else if (phase === BreathingPhase.Exhale) {
          scale = 0.85;
      }
      
      if (isWimHofBreathing) {
          scale = phase === BreathingPhase.Inhale ? 1.1 : 0.9;
      }
  }

  const containerSize = "w-[70vmin] h-[70vmin] max-w-[300px] max-h-[300px] md:w-[400px] md:h-[400px]";
  const orbSize = "w-[60vmin] h-[60vmin] max-w-[260px] max-h-[260px] md:w-[340px] md:h-[340px]";
  
  return (
    <div className={`relative ${containerSize} flex items-center justify-center flex-shrink-0`}>
        
        {/* 1. Ambient Glow (Pulsing) */}
        <div 
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] rounded-full blur-[80px] pointer-events-none transition-all ease-out ${isWimHofRetention ? 'opacity-60 animate-pulse' : 'opacity-30'}`}
            style={{ 
                backgroundColor: glowColor,
                transform: `translate(-50%, -50%) scale(${scale})`,
                transitionDuration: '1s'
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
            {/* STANDARD RING */}
            <circle
                cx="100"
                cy="100"
                r="98"
                fill="none"
                stroke={theme === 'light' ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)"}
                strokeWidth="2"
            />
            {/* ACTIVE RING */}
            {mode !== 'stopwatch' && (
                <circle
                    cx="100"
                    cy="100"
                    r="98"
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="4" 
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 98}
                    // If Retention, keep full ring (offset 0), otherwise normal progress
                    strokeDashoffset={isWimHofRetention ? 0 : 2 * Math.PI * 98 * (1 - timeProgress)}
                    className={`transition-all ease-linear ${isWimHofRetention ? 'opacity-100' : 'duration-100'}`}
                    style={{ 
                        filter: `drop-shadow(0 0 10px ${glowColor})`
                    }}
                />
            )}
        </svg>

        {/* 4. THE ORB (Container) */}
        <div 
            className={`relative ${orbSize} rounded-full flex flex-col items-center justify-center transition-transform ease-out z-10`}
            style={{ 
                transform: `scale(${scale})`,
                transitionDuration: '1000ms' // Smooth breathing animation
            }}
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
                        <div className="flex flex-col items-center mt-2">
                            <span className="text-gray-500 text-xs font-mono">
                                из {totalBreaths}
                            </span>
                            <span className="text-white/50 text-xs font-bold mt-1 bg-white/10 px-2 py-0.5 rounded">
                                {phaseTimerText}
                            </span>
                        </div>
                    )}
                    
                    {/* Explicit Phase Timer for Standard Modes */}
                    {!isWimHof && mode !== 'stopwatch' && (
                        <div className="mt-2 text-gray-400 text-xs font-bold uppercase tracking-widest bg-black/20 px-3 py-1 rounded-full border border-white/5">
                            {phase === BreathingPhase.Inhale ? 'Вдох' : phase === BreathingPhase.Exhale ? 'Выдох' : phase === BreathingPhase.HoldIn ? 'Задержка' : phase === BreathingPhase.HoldOut ? 'Пауза' : ''}
                            <span className="ml-2 text-white">{timeLeft.toFixed(1)}с</span>
                        </div>
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
            </div>
        </div>
    </div>
  );
};

export default TimerVisual;
