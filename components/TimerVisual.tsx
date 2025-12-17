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
  
  // --- Visual Logic ---
  let scale = 1;
  const progress = totalTimeForPhase > 0 ? (totalTimeForPhase - timeLeft) / totalTimeForPhase : 0;

  if (mode === 'stopwatch') {
      scale = 1.0;
  } else if (phase === BreathingPhase.Inhale) {
      scale = 1.0; 
  } else if (phase === BreathingPhase.Exhale) {
      scale = 1.0;
  }

  // Colors
  let phaseColorClass = '';
  let glowColor = '';
  
  switch (phase) {
      case BreathingPhase.Inhale:
          phaseColorClass = 'text-zen-accent'; // Cyan
          glowColor = '#22d3ee';
          break;
      case BreathingPhase.Exhale:
          phaseColorClass = 'text-premium-purple'; // Purple
          glowColor = '#7C3AED';
          break;
      case BreathingPhase.HoldIn:
          phaseColorClass = 'text-premium-gold'; // Gold
          glowColor = '#F59E0B';
          break;
      case BreathingPhase.HoldOut:
          phaseColorClass = 'text-rose-400';
          glowColor = '#fb7185';
          break;
      default:
          phaseColorClass = 'text-white';
          glowColor = '#9ca3af';
  }

  // --- PRANAYAMA LOGIC ---
  const isAnuloma = patternId === 'anuloma-viloma-base';
  const isSurya = patternId === 'surya-bhedana';
  const isChandra = patternId === 'chandra-bhedana';
  const isNoseTechnique = isAnuloma || isSurya || isChandra;

  let closeLeft = false; // Ring finger active
  let closeRight = false; // Thumb active
  let noseInstruction = label;

  if (isNoseTechnique) {
      const isOddRound = currentRound % 2 !== 0; 
      
      if (isAnuloma) {
          if (phase === BreathingPhase.Inhale) {
              if (isOddRound) {
                  closeRight = true; noseInstruction = "ВДОХ ЛЕВОЙ";
              } else {
                  closeLeft = true; noseInstruction = "ВДОХ ПРАВОЙ";
              }
          } else if (phase === BreathingPhase.Exhale) {
              if (isOddRound) {
                  closeLeft = true; noseInstruction = "ВЫДОХ ПРАВОЙ";
              } else {
                  closeRight = true; noseInstruction = "ВЫДОХ ЛЕВОЙ";
              }
          } else if (phase === BreathingPhase.HoldIn || phase === BreathingPhase.HoldOut) {
              closeLeft = true; closeRight = true; noseInstruction = "ЗАДЕРЖКА";
          }
      } else if (isSurya) {
          if (phase === BreathingPhase.Inhale) { closeLeft = true; noseInstruction = "ВДОХ ПРАВОЙ"; }
          else if (phase === BreathingPhase.Exhale) { closeRight = true; noseInstruction = "ВЫДОХ ЛЕВОЙ"; }
          else { closeLeft = true; closeRight = true; noseInstruction = "ЗАДЕРЖКА"; }
      } else if (isChandra) {
          if (phase === BreathingPhase.Inhale) { closeRight = true; noseInstruction = "ВДОХ ЛЕВОЙ"; }
          else if (phase === BreathingPhase.Exhale) { closeLeft = true; noseInstruction = "ВЫДОХ ПРАВОЙ"; }
          else { closeLeft = true; closeRight = true; noseInstruction = "ЗАДЕРЖКА"; }
      }
  }

  // Value Display
  let mainValue = timeLeft.toFixed(1);
  let subText = isNoseTechnique && phase !== BreathingPhase.Ready && phase !== BreathingPhase.Done ? noseInstruction : label;

  if (mode === 'stopwatch') {
      const totalSeconds = timeLeft;
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = Math.floor(totalSeconds % 60);
      const ms = Math.floor((totalSeconds % 1) * 10);
      mainValue = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms}`;
      subText = "Секундомер";
  } else if (mode === 'wim-hof' && (phase === BreathingPhase.Inhale || phase === BreathingPhase.Exhale)) {
      mainValue = `${currentBreath}/${totalBreaths}`;
      subText = phase === BreathingPhase.Inhale ? "Вдох" : "Выдох";
  } else if (Number.isInteger(timeLeft)) {
      mainValue = timeLeft.toString();
  }

  const containerSize = "w-[70vmin] h-[70vmin] max-w-[300px] max-h-[300px] md:w-[400px] md:h-[400px]";
  const orbSize = "w-[60vmin] h-[60vmin] max-w-[260px] max-h-[260px] md:w-[340px] md:h-[340px]";
  
  return (
    <div className={`relative ${containerSize} flex items-center justify-center flex-shrink-0`}>
        
        {/* 1. Ambient Glow (Pulsing) */}
        <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] rounded-full blur-[100px] transition-all duration-1000 opacity-30 pointer-events-none animate-pulse-slow"
            style={{ 
                backgroundColor: glowColor,
                transform: `translate(-50%, -50%) scale(${scale})` 
            }}
        />

        {/* 2. ORBITAL PARTICLES (NEW) */}
        {mode !== 'stopwatch' && (
            <div className="absolute inset-[-20%] animate-orbit opacity-40 pointer-events-none z-0">
                 {/* Particle 1 */}
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white blur-[2px] shadow-[0_0_10px_white]"></div>
            </div>
        )}
         {mode !== 'stopwatch' && (
            <div className="absolute inset-[-10%] animate-orbit-reverse opacity-30 pointer-events-none z-0">
                 {/* Particle 2 */}
                 <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-zen-accent blur-[1px]"></div>
            </div>
        )}

        {/* 3. Progress Ring (Back Layer) */}
        <svg 
            className={`absolute inset-0 w-full h-full rotate-[-90deg] pointer-events-none overflow-visible z-0`}
            viewBox="0 0 200 200"
        >
            <circle
                cx="100"
                cy="100"
                r="98"
                fill="none"
                stroke={theme === 'light' ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)"}
                strokeWidth="1"
            />
            {mode !== 'stopwatch' && (
                <circle
                    cx="100"
                    cy="100"
                    r="98"
                    fill="none"
                    stroke={glowColor}
                    strokeWidth="4" // Thicker stroke
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 98}
                    strokeDashoffset={2 * Math.PI * 98 * (1 - progress)}
                    className="transition-all duration-100 ease-linear"
                    style={{ 
                        filter: `drop-shadow(0 0 10px ${glowColor})`,
                        opacity: 1 
                    }}
                />
            )}
        </svg>

        {/* 4. The Orb (Container) */}
        <div 
            className={`relative ${orbSize} rounded-full flex flex-col items-center justify-center transition-transform duration-[50ms] ease-linear z-10`}
            style={{ transform: `scale(${scale})` }}
        >
            {/* Background Glass */}
            <div className="absolute inset-0 rounded-full border border-white/10 bg-[#0a0a0b]/80 backdrop-blur-2xl shadow-2xl"></div>

            {/* --- NOSE VISUALIZATION --- */}
            {isNoseTechnique && (
                <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-40">
                    <g className="stroke-gray-600 dark:stroke-gray-500" fill="none" strokeWidth="2" strokeLinecap="round">
                        <path d="M 100 40 L 100 110" />
                        <path d="M 90 125 Q 100 130 110 125" />
                        <path d="M 65 115 Q 75 105 90 125" />
                        <path d="M 135 115 Q 125 105 110 125" />
                    </g>
                    <path 
                        d="M 50 130 Q 60 90 95 115"
                        className={`transition-all duration-300 ${closeLeft ? 'stroke-zen-accent opacity-100 filter drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]' : 'stroke-gray-800 opacity-20'}`}
                        fill="none" strokeWidth="12" strokeLinecap="round"
                    />
                    <path 
                        d="M 150 130 Q 140 90 105 115"
                        className={`transition-all duration-300 ${closeRight ? 'stroke-zen-accent opacity-100 filter drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]' : 'stroke-gray-800 opacity-20'}`}
                        fill="none" strokeWidth="12" strokeLinecap="round"
                    />
                </svg>
            )}

            {/* --- CONTENT LAYER --- */}
            <div className="relative z-10 flex flex-col items-center justify-between h-full w-full py-8 md:py-12">
                <div className="flex-1 flex items-center justify-center mt-2">
                    <span className={`text-[18vmin] md:text-8xl font-display font-bold tabular-nums tracking-tighter ${phaseColorClass} drop-shadow-lg leading-none transition-colors duration-300`}>
                        {mainValue}
                    </span>
                </div>
                <div className="mb-2 md:mb-4">
                    <div className={`px-4 md:px-6 py-2 rounded-full border border-white/10 bg-black/40 backdrop-blur-md shadow-lg transition-all duration-300 ${isNoseTechnique && (phase === BreathingPhase.Inhale || phase === BreathingPhase.Exhale) ? 'border-zen-accent/50 bg-zen-accent/10 shadow-glow-cyan' : ''}`}>
                         <span className={`text-[10px] md:text-sm font-bold uppercase tracking-[0.2em] whitespace-nowrap text-gray-200`}>
                            {subText}
                        </span>
                    </div>
                </div>
                {isNoseTechnique && (
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