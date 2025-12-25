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

  const timeProgress = totalTimeForPhase > 0 ? (totalTimeForPhase - timeLeft) / totalTimeForPhase : 0;
  
  let glowColor = '';
  let strokeColor = '';

  if (isWimHof) {
      if (isWimHofBreathing) {
          glowColor = '#22d3ee'; 
          strokeColor = '#22d3ee';
      } else if (isWimHofRetention) {
          glowColor = '#f97316'; 
          strokeColor = '#f97316';
      } else if (isWimHofRecovery) {
          glowColor = '#a855f7'; 
          strokeColor = '#a855f7';
      } else {
          glowColor = '#9ca3af';
          strokeColor = '#ffffff';
      }
  } else if (isStopwatch) {
      glowColor = isActive ? '#ffffff' : '#52525b';
      strokeColor = isActive ? '#ffffff' : '#52525b';
  } else {
      switch (phase) {
          case BreathingPhase.Inhale:
              glowColor = '#22d3ee'; // Cyan
              strokeColor = '#22d3ee';
              break;
          case BreathingPhase.Exhale:
              glowColor = '#818cf8'; // Indigo/Purple mix
              strokeColor = '#818cf8';
              break;
          case BreathingPhase.HoldIn:
              glowColor = '#fbbf24'; // Amber
              strokeColor = '#fbbf24';
              break;
          case BreathingPhase.HoldOut:
              glowColor = '#fb7185'; // Rose
              strokeColor = '#fb7185';
              break;
          default:
              glowColor = '#9ca3af';
              strokeColor = '#9ca3af';
      }
  }

  // Value Logic
  let mainValue = "";
  let subText = label;

  if (isStopwatch) {
      const totalSeconds = timeLeft;
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = Math.floor(totalSeconds % 60);
      mainValue = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      subText = isActive ? "СЕКУНДОМЕР" : "ПАУЗА";
  } else if (isWimHof) {
      if (isWimHofBreathing) {
          mainValue = `${currentBreath}`;
          subText = phase === BreathingPhase.Inhale ? "ВДОХ" : "ВЫДОХ";
      } else if (isWimHofRetention) {
          const m = Math.floor(timeLeft / 60);
          const s = Math.floor(timeLeft % 60);
          if (timeLeft > 60) {
              mainValue = `${m}:${s.toString().padStart(2, '0')}`;
          } else {
              mainValue = timeLeft.toFixed(1);
          }
          subText = "ЗАДЕРЖКА";
      } else if (isWimHofRecovery) {
          mainValue = Math.ceil(timeLeft).toString();
          subText = "ВОССТАНОВЛЕНИЕ";
      } else {
           mainValue = Math.ceil(timeLeft).toString();
           subText = label;
      }
  } else {
      mainValue = Math.ceil(timeLeft).toString();
  }

  // Breathing Animation for container
  const breatheScale = !isStopwatch && isActive 
    ? (phase === BreathingPhase.Inhale ? 1.05 : phase === BreathingPhase.Exhale ? 0.95 : 1)
    : 1;

  // Responsive Container
  const containerSize = "w-[260px] h-[260px] md:w-[300px] md:h-[300px]";
  const radius = 120; // Internal SVG radius
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = isStopwatch 
    ? (circumference * 0.25) // Static ring for stopwatch
    : circumference * (1 - timeProgress);

  return (
    <div className={`relative ${containerSize} flex items-center justify-center flex-shrink-0 mx-auto transition-transform duration-[2000ms] ease-in-out`}
         style={{ transform: `scale(${breatheScale})` }}
    >
        {/* 1. OUTER GLOW (Ambient Light) */}
        <div 
            className="absolute inset-0 rounded-full blur-[50px] transition-opacity duration-700"
            style={{ 
                background: `radial-gradient(circle, ${glowColor}40 0%, transparent 70%)`,
                opacity: isActive ? 0.6 : 0.2
            }}
        />

        {/* 2. GLASS ORB BACKGROUND (Apple Liquid Style) */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/10 to-transparent dark:from-white/5 dark:to-black/20 backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_10px_30px_rgba(0,0,0,0.2)] border border-white/10 ring-1 ring-black/5"></div>

        {/* 3. SVG PROGRESS RING */}
        <svg 
            className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-lg"
            viewBox="0 0 300 300"
        >
            {/* Track */}
            <circle
                cx="150"
                cy="150"
                r={radius}
                fill="none"
                stroke={theme === 'light' ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)"}
                strokeWidth="12"
                strokeLinecap="round"
            />
            {/* Progress - Liquid Neon */}
            <circle
                cx="150"
                cy="150"
                r={radius}
                fill="none"
                stroke={strokeColor}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-300 ease-linear"
                style={{ 
                    filter: `drop-shadow(0 0 6px ${glowColor})`
                }}
            />
        </svg>

        {/* 4. CONTENT (Inside the Glass) */}
        <div className="relative z-10 flex flex-col items-center justify-center">
            
            {/* Main Number - Super Clean Typography */}
            <div className="relative">
                <span 
                    className="font-display font-bold text-7xl md:text-8xl tabular-nums tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 drop-shadow-sm"
                    style={{ 
                        fontVariantNumeric: 'tabular-nums',
                        textShadow: `0 4px 20px ${glowColor}40`
                    }}
                >
                    {mainValue}
                </span>
                
                {/* Milliseconds for stopwatch */}
                {isStopwatch && (
                    <span className="absolute -right-6 top-2 text-xl font-mono font-medium text-white/50">
                        .{Math.floor((timeLeft % 1) * 10)}
                    </span>
                )}
            </div>

            {/* Label - Tight Spacing */}
            <div className="mt-1 flex flex-col items-center gap-1">
                 {/* Mini Pill Label */}
                 <div 
                    className="px-3 py-1 rounded-full bg-white/10 border border-white/5 backdrop-blur-md shadow-sm transition-colors duration-500"
                    style={{ backgroundColor: `${glowColor}15`, borderColor: `${glowColor}30` }}
                 >
                    <span 
                        className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/90"
                        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                    >
                        {subText}
                    </span>
                 </div>
                 
                 {/* Secondary Info (seconds left in standard mode) */}
                 {!isWimHof && !isStopwatch && isActive && (
                     <span className="text-[10px] font-mono text-white/40 font-medium">
                        {timeLeft.toFixed(1)}s
                     </span>
                 )}
            </div>
        </div>
    </div>
  );
};

export default TimerVisual;