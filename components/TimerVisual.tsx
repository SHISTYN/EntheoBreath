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
  mode?: 'loop' | 'wim-hof';
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
    mode = 'loop'
}) => {
  // Calculate stroke dashoffset for SVG ring
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const progress = totalTimeForPhase > 0 ? (timeLeft / totalTimeForPhase) : 0;
  const dashoffset = circumference * (1 - progress);

  // Colors based on phase
  let color = '#64d2ff'; // Cyan (Inhale)
  let glowColor = 'rgba(100, 210, 255, 0.4)';
  
  if (phase === BreathingPhase.Exhale) {
    color = '#818cf8'; // Indigo
    glowColor = 'rgba(129, 140, 248, 0.4)';
  }
  if (phase === BreathingPhase.HoldIn || phase === BreathingPhase.HoldOut) {
    color = '#ffffff'; // White
    glowColor = 'rgba(255, 255, 255, 0.3)';
  }

  // Scale effect for the orb
  let scale = 1;
  const fraction = totalTimeForPhase > 0 ? (totalTimeForPhase - timeLeft) / totalTimeForPhase : 0;

  if (phase === BreathingPhase.Inhale) scale = 0.9 + (0.1 * fraction);
  else if (phase === BreathingPhase.Exhale) scale = 1.0 - (0.1 * fraction);
  else if (phase === BreathingPhase.HoldIn) scale = 1.0;
  else scale = 0.9;

  // --- Anuloma Viloma Logic ---
  const isAnuloma = patternId === 'anuloma-viloma-base';
  const isOddRound = currentRound % 2 !== 0; // Round 1, 3, 5 = Left In, Right Out
  
  // Logic: 
  // Odd Round INHALE -> Inhale Left (Close Right with Thumb)
  // Odd Round EXHALE -> Exhale Right (Close Left with Ring)
  // Even Round INHALE -> Inhale Right (Close Left with Ring)
  // Even Round EXHALE -> Exhale Left (Close Right with Thumb)
  
  let displayText = label;
  let closeRight = false; // Thumb active
  let closeLeft = false;  // Ring finger active
  
  if (isAnuloma) {
      if (phase === BreathingPhase.Inhale) {
          if (isOddRound) {
              displayText = "Вдох левой";
              closeRight = true; // Close right to inhale left
          } else {
              displayText = "Вдох правой";
              closeLeft = true; // Close left to inhale right
          }
      } else if (phase === BreathingPhase.Exhale) {
           if (isOddRound) {
              displayText = "Выдох правой";
              closeLeft = true; // Close left to exhale right
          } else {
              displayText = "Выдох левой";
              closeRight = true; // Close right to exhale left
          }
      } else if (phase === BreathingPhase.HoldIn || phase === BreathingPhase.HoldOut) {
          displayText = "Задержка";
          closeRight = true;
          closeLeft = true;
      }
  }

  // Override text for Wim Hof Breathing Phase
  let mainValue = timeLeft.toFixed(1);
  if (mode === 'wim-hof' && (phase === BreathingPhase.Inhale || phase === BreathingPhase.Exhale)) {
      // Don't show time, show breath count
      mainValue = `${currentBreath}/${totalBreaths}`;
      displayText = "Интенсивное дыхание";
  }

  return (
    <div className="relative w-[340px] h-[340px] md:w-[400px] md:h-[400px] flex items-center justify-center">
      
      {/* Background Glow */}
      <div 
        className="absolute inset-0 rounded-full pointer-events-none transition-transform duration-100 ease-linear"
        style={{ 
            background: `radial-gradient(circle, ${glowColor} 0%, transparent 65%)`,
            transform: `scale(${scale * 1.5})`, 
            opacity: 0.6,
        }}
      />

      {/* SVG Ring */}
      <svg className="absolute w-[280px] h-[280px] md:w-[320px] md:h-[320px] transform -rotate-90" style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}>
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="4"
          fill="transparent"
        />
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          stroke={color}
          strokeWidth="4"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          strokeLinecap="round"
          /* REMOVED transition-all duration-100 to fix lag on long durations. 
             State updates (timeLeft) are fast enough to drive animation smoothly without CSS interpolation fighting it. */
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>

      {/* Center Content */}
      <div className="absolute flex flex-col items-center justify-center z-10 w-full h-full p-8">
        {isAnuloma ? (
             <div className="flex flex-col items-center justify-between h-full py-10 w-full relative">
                 
                 {/* 1. TEXT SECTION (TOP) */}
                 <div className="flex flex-col items-center z-20 mt-4">
                    <div className="text-5xl font-bold font-mono text-white tabular-nums drop-shadow-md">
                        {timeLeft.toFixed(1)}
                    </div>
                     <div 
                        className="text-[10px] uppercase tracking-widest font-bold mt-1 px-3 py-1 rounded-full bg-[#0a0a0b]/80 border border-white/10 backdrop-blur-md shadow-lg transition-colors duration-300" 
                        style={{ color: color, borderColor: color }}
                     >
                        {displayText}
                    </div>
                 </div>

                 {/* 2. VISUAL SECTION (Abstract Face & Glow Fingers) */}
                 <div className="relative w-full h-40 mt-[-20px] opacity-100 flex items-center justify-center">
                     <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
                        <defs>
                            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="4" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                        </defs>

                        {/* --- NOSE CONTOUR (Elegant Line) --- */}
                        <path 
                            d="M 100 30 L 100 70 Q 100 95 100 100 M 80 105 Q 100 120 120 105" 
                            fill="none" 
                            stroke="rgba(255,255,255,0.15)" 
                            strokeWidth="2" 
                            strokeLinecap="round"
                        />
                        {/* Nostrils */}
                        <path 
                            d="M 80 105 Q 70 95 82 95 M 120 105 Q 130 95 118 95" 
                            fill="none" 
                            stroke="rgba(255,255,255,0.1)" 
                            strokeWidth="2" 
                            strokeLinecap="round"
                        />

                        {/* --- ACTIVE FINGERS (Glowing Capsules) --- */}

                        {/* RING FINGER (Left side) */}
                        <g 
                            className="transition-all duration-300 ease-out"
                            style={{ 
                                transform: closeLeft ? 'translate(10px, -10px) rotate(-5deg)' : 'translate(-5px, 5px)',
                                transformOrigin: '60px 150px',
                                opacity: closeLeft ? 1 : 0.3
                            }}
                        >
                            <path 
                                d="M 50 160 Q 40 120 78 102" 
                                stroke={closeLeft ? color : 'rgba(255,255,255,0.1)'} 
                                strokeWidth={closeLeft ? "16" : "10"} 
                                fill="none" 
                                strokeLinecap="round"
                                filter={closeLeft ? "url(#glow)" : ""}
                                className="transition-colors duration-200"
                            />
                        </g>

                        {/* THUMB (Right side) */}
                        <g 
                            className="transition-all duration-300 ease-out"
                            style={{ 
                                transform: closeRight ? 'translate(-10px, -10px) rotate(5deg)' : 'translate(5px, 5px)',
                                transformOrigin: '140px 150px',
                                opacity: closeRight ? 1 : 0.3
                            }}
                        >
                             <path 
                                d="M 150 160 Q 160 120 122 102" 
                                stroke={closeRight ? color : 'rgba(255,255,255,0.1)'} 
                                strokeWidth={closeRight ? "16" : "10"} 
                                fill="none" 
                                strokeLinecap="round"
                                filter={closeRight ? "url(#glow)" : ""}
                                className="transition-colors duration-200"
                            />
                        </g>
                        
                        {/* Labels - Moved DOWN (y=180) and increased size */}
                        <text x="30" y="180" fill="rgba(255,255,255,0.5)" fontSize="11" textAnchor="middle" className={`font-mono font-bold tracking-wider transition-opacity duration-300 ${closeLeft ? 'opacity-100 fill-white' : 'opacity-30'}`}>БЕЗЫМЯННЫЙ</text>
                        <text x="170" y="180" fill="rgba(255,255,255,0.5)" fontSize="11" textAnchor="middle" className={`font-mono font-bold tracking-wider transition-opacity duration-300 ${closeRight ? 'opacity-100 fill-white' : 'opacity-30'}`}>БОЛЬШОЙ</text>

                     </svg>
                 </div>
             </div>
        ) : (
             // --- STANDARD VISUALIZATION ---
            <div 
                className="w-40 h-40 md:w-48 md:h-48 rounded-full flex flex-col items-center justify-center transition-all duration-500 ease-in-out bg-[#0a0a0b] border border-white/5"
                style={{ 
                    boxShadow: phase !== BreathingPhase.Ready && phase !== BreathingPhase.Done 
                        ? `inset 0 0 40px ${glowColor.replace('0.4', '0.1')}` 
                        : 'none',
                }}
            >
                <div className={`font-bold font-mono tracking-tighter text-white tabular-nums ${mode === 'wim-hof' && (phase === BreathingPhase.Inhale || phase === BreathingPhase.Exhale) ? 'text-6xl' : 'text-5xl'}`}>
                    {mainValue}
                </div>
                <div className="text-[10px] uppercase tracking-[0.3em] font-bold mt-2 text-gray-500 transition-colors duration-300" style={{ color: phase !== BreathingPhase.Ready ? color : undefined }}>
                    {displayText}
                </div>
                {/* Additional context for Wim Hof */}
                {mode === 'wim-hof' && (phase === BreathingPhase.HoldOut || phase === BreathingPhase.HoldIn) && (
                     <div className="text-[10px] text-gray-500 mt-2">
                         Раунд {currentRound}
                     </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default TimerVisual;