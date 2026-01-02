
import React from 'react';
import { motion } from 'framer-motion';
import { BreathingPhase } from '../types';

const MotionCircle = motion.circle as any;
const MotionDiv = motion.div as any;

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
  const timeProgress = totalTimeForPhase > 0 ? Math.max(0, Math.min(1, (totalTimeForPhase - timeLeft) / totalTimeForPhase)) : 0;
  
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

  // Breathing Animation for container scale
  const breatheScale = !isStopwatch && isActive 
    ? (phase === BreathingPhase.Inhale ? 1.05 : phase === BreathingPhase.Exhale ? 0.95 : 1)
    : 1;

  // Responsive Container
  const containerSize = "w-[280px] h-[280px] md:w-[340px] md:h-[340px]";
  const radius = 130; 
  const circumference = 2 * Math.PI * radius;
  
  // Logic for the progress ring
  // Standard clockwise fill: offset starts at circumference (empty) and goes to 0 (full) OR vice versa depending on logic.
  // Here: We want it to "deplete" or "fill" smoothly.
  // Let's make it deplete: 0 offset = Full. Circumference offset = Empty.
  const strokeDashoffset = isStopwatch 
    ? 0 
    : circumference * timeProgress; // As timeProgress goes 0->1, offset goes 0->C (line disappears)

  // Wait, usually timers "empty". 
  // If timeProgress is 0 (start), we want full circle? Or empty circle filling up?
  // Let's stick to standard "Fan" effect:
  // Starts full (offset 0), ends empty (offset C)
  
  // Rotation for the Spark Particle
  // 0 progress = Top (-90deg).
  // 1 progress = Top (-90deg - 360deg).
  const rotationDeg = -90 - (timeProgress * 360);

  return (
    <div className={`relative ${containerSize} flex items-center justify-center flex-shrink-0 mx-auto transition-transform duration-[2000ms] ease-in-out`}
         style={{ transform: `scale(${breatheScale})` }}
    >
        {/* SVG PROGRESS RING */}
        <svg 
            className="absolute inset-0 w-full h-full drop-shadow-2xl overflow-visible"
            viewBox="0 0 300 300"
        >
            <defs>
                <filter id="neonGlowCircle" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Track (Background Ring) */}
            <circle
                cx="150"
                cy="150"
                r={radius}
                fill="none"
                stroke={theme === 'light' ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.08)"}
                strokeWidth="4" 
            />

            {/* Progress - The Active Line */}
            <MotionCircle
                cx="150"
                cy="150"
                r={radius}
                fill="none"
                strokeWidth="6" 
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                animate={{ stroke: strokeColor }}
                transition={{ duration: 0.5 }} // Smooth color change
                style={{ 
                    transform: 'rotate(-90deg)', 
                    transformOrigin: '50% 50%',
                    filter: isActive && !isStopwatch ? 'url(#neonGlowCircle)' : 'none'
                }}
            />

            {/* THE SPARK (Leading Particle) */}
            {/* We rotate a group containing a circle at the top position */}
            {!isStopwatch && isActive && timeLeft > 0 && (
                <g transform={`rotate(${rotationDeg}, 150, 150)`}>
                    {/* Glowy blob at the tip */}
                    <circle 
                        cx="150" 
                        cy={150 - radius} 
                        r="6" 
                        fill="white"
                        style={{ filter: 'drop-shadow(0 0 8px white)' }}
                    />
                    {/* Colored halo around the spark */}
                    <MotionCircle 
                        cx="150" 
                        cy={150 - radius} 
                        r="12" 
                        fill={strokeColor}
                        opacity="0.3"
                        animate={{ fill: strokeColor }}
                        style={{ filter: 'blur(4px)' }}
                    />
                </g>
            )}
        </svg>

        {/* CONTENT CENTER */}
        <div className="relative z-10 flex flex-col items-center justify-center">
            
            {/* Main Number */}
            <div className="relative">
                <MotionDiv 
                    key={phase} // Re-animate slightly on phase change
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="font-display font-bold text-8xl md:text-9xl tabular-nums tracking-tighter leading-none text-white drop-shadow-lg"
                >
                    {mainValue}
                </MotionDiv>
                
                {/* Milliseconds for stopwatch */}
                {isStopwatch && (
                    <span className="absolute -right-8 top-4 text-2xl font-mono font-medium text-white/40">
                        .{Math.floor((timeLeft % 1) * 10)}
                    </span>
                )}
            </div>

            {/* Cycle info & Phase Label */}
            <div className="mt-4 flex flex-col items-center gap-2 opacity-80">
                 {/* PHASE LABEL with Color Animation */}
                 <motion.span 
                    animate={{ color: strokeColor }}
                    className="text-sm font-black uppercase tracking-[0.2em]"
                 >
                    {isWimHof ? (isWimHofBreathing ? 'Дыхание' : isWimHofRetention ? 'Задержка' : 'Отдых') : label}
                 </motion.span>

                 {/* ROUND INFO */}
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
