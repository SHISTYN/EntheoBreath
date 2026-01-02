
import React from 'react';
import { BreathingPhase } from '../types';

interface TimerVisualProps {
  phase: BreathingPhase;
  timeLeft: number;
  totalTimeForPhase: number;
  label: string;
  patternId?: string;
  currentRound?: number;
  totalRounds?: number;
  currentBreath?: number;
  totalBreaths?: number;
  mode?: 'loop' | 'wim-hof' | 'stopwatch' | 'manual';
  theme?: 'dark' | 'light';
  isActive?: boolean;
}

const TimerVisual: React.FC<TimerVisualProps> = ({ 
    phase, 
    timeLeft, 
    totalTimeForPhase, 
    label, 
    currentRound = 1,
    totalRounds = 0,
    currentBreath = 0,
    mode = 'loop',
    theme = 'dark',
    isActive = false
}) => {
  
  const isWimHof = mode === 'wim-hof';
  const isStopwatch = mode === 'stopwatch';
  
  const isWimHofBreathing = isWimHof && (phase === BreathingPhase.Inhale || phase === BreathingPhase.Exhale);
  const isWimHofRetention = isWimHof && phase === BreathingPhase.HoldOut;
  const isWimHofRecovery = isWimHof && phase === BreathingPhase.HoldIn;

  // Calculate progress (0 to 1)
  const timeProgress = totalTimeForPhase > 0 ? (totalTimeForPhase - timeLeft) / totalTimeForPhase : 0;
  
  let strokeColor = '';

  if (isWimHof) {
      if (isWimHofBreathing) strokeColor = '#22d3ee'; 
      else if (isWimHofRetention) strokeColor = '#f97316'; 
      else if (isWimHofRecovery) strokeColor = '#a855f7'; 
      else strokeColor = '#9ca3af';
  } else if (isStopwatch) {
      strokeColor = isActive ? '#ffffff' : '#52525b';
  } else {
      switch (phase) {
          case BreathingPhase.Inhale: strokeColor = '#22d3ee'; break; // Cyan
          case BreathingPhase.Exhale: strokeColor = '#818cf8'; break; // Indigo
          case BreathingPhase.HoldIn: strokeColor = '#fbbf24'; break; // Amber
          case BreathingPhase.HoldOut: strokeColor = '#fb7185'; break; // Rose
          default: strokeColor = '#52525b'; // Zinc
      }
  }

  // Value Logic
  let mainValue = "";

  if (isStopwatch) {
      const totalSeconds = timeLeft;
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = Math.floor(totalSeconds % 60);
      mainValue = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else if (isWimHof) {
      if (isWimHofBreathing) {
          mainValue = `${currentBreath}`;
      } else if (isWimHofRetention) {
          const m = Math.floor(timeLeft / 60);
          const s = Math.floor(timeLeft % 60);
          mainValue = timeLeft > 60 ? `${m}:${s.toString().padStart(2, '0')}` : timeLeft.toFixed(1);
      } else {
           mainValue = Math.ceil(timeLeft).toString();
      }
  } else {
      mainValue = Math.ceil(timeLeft).toString();
  }

  // Breathing Animation for container
  const breatheScale = !isStopwatch && isActive 
    ? (phase === BreathingPhase.Inhale ? 1.05 : phase === BreathingPhase.Exhale ? 0.95 : 1)
    : 1;

  // Responsive Container
  const containerSize = "w-[280px] h-[280px] md:w-[340px] md:h-[340px]";
  const radius = 130; // Internal SVG radius
  const circumference = 2 * Math.PI * radius;
  // Standard clockwise fill
  const strokeDashoffset = isStopwatch 
    ? 0 // Stopwatch just shows ring
    : circumference * (1 - timeProgress);

  return (
    <div className={`relative ${containerSize} flex items-center justify-center flex-shrink-0 mx-auto transition-transform duration-[2000ms] ease-in-out`}
         style={{ transform: `scale(${breatheScale})` }}
    >
        {/* SVG PROGRESS RING - MINIMALIST */}
        <svg 
            className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-xl"
            viewBox="0 0 300 300"
        >
            {/* Track (Darker, Thinner) */}
            <circle
                cx="150"
                cy="150"
                r={radius}
                fill="none"
                stroke={theme === 'light' ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.08)"}
                strokeWidth="4" 
            />
            {/* Progress - Clean Solid Line */}
            <circle
                cx="150"
                cy="150"
                r={radius}
                fill="none"
                stroke={strokeColor}
                strokeWidth="6" 
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-200 ease-linear"
            />
        </svg>

        {/* CONTENT */}
        <div className="relative z-10 flex flex-col items-center justify-center">
            
            {/* Main Number */}
            <div className="relative">
                <span 
                    className="font-display font-bold text-8xl md:text-9xl tabular-nums tracking-tighter leading-none text-white drop-shadow-lg"
                >
                    {mainValue}
                </span>
                
                {/* Milliseconds for stopwatch */}
                {isStopwatch && (
                    <span className="absolute -right-8 top-4 text-2xl font-mono font-medium text-white/40">
                        .{Math.floor((timeLeft % 1) * 10)}
                    </span>
                )}
            </div>

            {/* Cycle info & Phase Label */}
            <div className="mt-4 flex flex-col items-center gap-2 opacity-80">
                 {/* PHASE LABEL */}
                 <span className="text-sm font-black uppercase tracking-[0.2em] text-white/90" style={{ color: strokeColor }}>
                    {isWimHof ? (isWimHofBreathing ? 'Дыхание' : isWimHofRetention ? 'Задержка' : 'Отдых') : label}
                 </span>

                 {/* ROUND INFO - Integrated */}
                 {!isWimHof && !isStopwatch && (
                     <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
                        Раунд {currentRound} / {totalRounds === 0 ? '∞' : totalRounds}
                     </span>
                 )}
            </div>
        </div>
    </div>
  );
};

export default TimerVisual;
