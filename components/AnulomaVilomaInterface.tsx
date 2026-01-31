
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BreathingPhase } from '../types';

const MotionPath = motion.path as any;
const MotionDiv = motion.div as any;
const MotionCircle = motion.circle as any;

interface Props {
    phase: BreathingPhase;
    timeLeft: number;
    totalTime: number;
    currentRound: number;
    totalRounds: number;
    isActive?: boolean;
}

// Утилита для смешивания цветов
const lerpColor = (a: string, b: string, amount: number) => {
    const ah = parseInt(a.replace(/#/g, ''), 16),
        ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
        bh = parseInt(b.replace(/#/g, ''), 16),
        br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
        rr = ar + amount * (br - ar),
        rg = ag + amount * (bg - ag),
        rb = ab + amount * (bb - ab);
    return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
}

const AnulomaVilomaInterface: React.FC<Props> = ({
    phase,
    timeLeft,
    totalTime,
    currentRound,
    totalRounds,
    isActive
}) => {
    const [isLeftHanded, setIsLeftHanded] = useState(false);

    const isOddRound = currentRound % 2 !== 0;
    const STROKE_WIDTH = 24;

    // Единый путь: 0.0 (Низ Лев) -> 0.5 (Верх Центр) -> 1.0 (Низ Прав)
    const combinedPath = "M 70 380 C 70 180 70 60 150 60 C 230 60 230 180 230 380";

    // Прогресс фазы: 0 -> 1
    const p = totalTime > 0 ? Math.min(Math.max((totalTime - timeLeft) / totalTime, 0), 1) : 1;

    // Цвета
    const COLOR_INHALE = "#22d3ee"; // Cyan
    const COLOR_HOLD = "#a855f7";   // Purple
    const COLOR_EXHALE = "#fbbf24"; // Yellow/Orange
    const COLOR_GLASS = "rgba(255, 255, 255, 0.05)";

    // --- Логика Цвета ---
    let activeColor = COLOR_INHALE;
    if (phase === BreathingPhase.Exhale) activeColor = COLOR_EXHALE;
    else if (phase === BreathingPhase.HoldIn) {
        // Плавный переход цвета в последние 2 секунды задержки
        if (timeLeft <= 2) {
            const morph = 1 - (timeLeft / 2);
            activeColor = lerpColor(COLOR_HOLD, COLOR_EXHALE, morph);
        } else {
            activeColor = COLOR_HOLD;
        }
    }

    // --- МАТЕМАТИКА ЗМЕЙКИ ---
    const TOP_START = 0.45;
    const TOP_END = 0.55;

    let pathOffset = 0;
    let pathLength = 0;

    let mainText = "";
    let subText = "";

    let leftLockOpen = false;
    let rightLockOpen = false;

    const isReadyState = phase === BreathingPhase.Ready;
    const isDoneState = phase === BreathingPhase.Done;
    let liquidOpacity = 1;

    // Спец. переменные для пре-анимации (Ready Phase)
    let readyProgress = 0;

    if (isOddRound) {
        // === РАУНД 1, 3, 5: СЛЕВА -> НАПРАВО ===
        if (phase === BreathingPhase.Inhale) {
            mainText = "Вдох левой";
            subText = "Правая закрыта";
            leftLockOpen = true;
            pathOffset = 0;
            pathLength = 0.5 * p;
        }
        else if (phase === BreathingPhase.HoldIn) {
            mainText = "Задержка";
            subText = "Держите";
            const startPos = 0 + (TOP_START * p);
            const endPos = 0.5 + ((TOP_END - 0.5) * p);
            pathOffset = startPos;
            pathLength = endPos - startPos;
        }
        else if (phase === BreathingPhase.Exhale) {
            mainText = "Выдох правой";
            subText = "Левая закрыта";
            rightLockOpen = true;
            const startPos = TOP_START + ((1.0 - TOP_START) * p);
            const endPos = TOP_END + ((1.0 - TOP_END) * p);
            pathOffset = startPos;
            pathLength = Math.max(0, endPos - startPos);
        }
    } else {
        // === РАУНД 2, 4, 6: СПРАВА -> НАЛЕВО ===
        if (phase === BreathingPhase.Inhale) {
            mainText = "Вдох правой";
            subText = "Левая закрыта";
            rightLockOpen = true;
            pathOffset = 1.0 - (0.5 * p);
            pathLength = 0.5 * p;
        }
        else if (phase === BreathingPhase.HoldIn) {
            mainText = "Задержка";
            subText = "Держите";
            const startPos = 0.5 - ((0.5 - TOP_START) * p);
            const endPos = 1.0 - ((1.0 - TOP_END) * p);
            pathOffset = startPos;
            pathLength = endPos - startPos;
        }
        else if (phase === BreathingPhase.Exhale) {
            mainText = "Выдох левой";
            subText = "Правая закрыта";
            leftLockOpen = true;
            const startPos = TOP_START - (TOP_START * p);
            const endPos = TOP_END - (TOP_END * p);
            pathOffset = startPos;
            pathLength = Math.max(0, endPos - startPos);
        }
    }

    // Сброс в нейтраль для Готовности
    if (isReadyState || isDoneState) {
        mainText = isReadyState ? "Готовность" : "Завершено";
        subText = isReadyState ? "Приготовьтесь" : "Отличная работа";
        pathLength = 0;
        liquidOpacity = 0; // Основную линию скрываем, но шарик оставим

        // Вычисляем прогресс готовности (от 0 до 1 за 3 секунды)
        if (isReadyState) {
            // timeLeft идет 3 -> 0. Нам нужно 0 -> 1.
            readyProgress = Math.min(Math.max((3 - timeLeft) / 3, 0), 1);
        }
    }

    // Хелпер для стилизации замков
    const getLockStyle = (isLeft: boolean, isOpen: boolean) => {
        // В фазе готовности подсвечиваем ту ноздрю, с которой начнем
        if (isReadyState) {
            const targetIsLeft = isOddRound; // Нечетные раунды начинаем слева
            const isTarget = isLeft === targetIsLeft;

            if (isTarget) {
                // Плавно разгорается
                const opacity = 0.2 + (readyProgress * 0.3);
                return {
                    borderColor: `rgba(34, 211, 238, ${opacity})`,
                    bg: `rgba(34, 211, 238, ${opacity * 0.2})`,
                    textColor: "text-cyan-400",
                    scale: 1 + (readyProgress * 0.05),
                    icon: 'lock'
                };
            } else {
                return {
                    borderColor: "rgba(255,255,255,0.05)",
                    bg: "transparent",
                    textColor: "text-zinc-700",
                    scale: 1,
                    icon: 'lock'
                };
            }
        }

        if (isDoneState) {
            return {
                borderColor: "rgba(255,255,255,0.1)",
                bg: "rgba(255,255,255,0.02)",
                textColor: "text-zinc-600",
                scale: 1,
                icon: 'lock'
            };
        }

        if (isOpen) {
            return {
                borderColor: "rgba(255,255,255,0.8)",
                bg: "rgba(255,255,255,0.1)",
                textColor: "text-white",
                scale: 1.1,
                icon: 'lock-open'
            };
        }
        return {
            borderColor: "rgba(225,29,72,0.4)",
            bg: "rgba(225,29,72,0.1)",
            textColor: "text-rose-500",
            scale: 1,
            icon: 'lock'
        };
    };

    const leftStyle = getLockStyle(true, leftLockOpen);
    const rightStyle = getLockStyle(false, rightLockOpen);

    const leftFingerLabel = isLeftHanded ? "БОЛЬШОЙ" : "БЕЗЫМЯННЫЙ";
    const rightFingerLabel = isLeftHanded ? "БЕЗЫМЯННЫЙ" : "БОЛЬШОЙ";

    // --- ЛОГИКА БЕСШОВНОГО ШАРА ---
    const startNodeX = isOddRound ? 70 : 230;

    let circleScale = 0;
    let circleOpacity = 0;

    if (isReadyState) {
        circleScale = readyProgress * 1.2;
        circleOpacity = readyProgress;
    } else if (phase === BreathingPhase.Inhale) {
        circleScale = 1;
        circleOpacity = 1;
    } else {
        circleScale = 0;
        circleOpacity = 0;
    }

    return (
        <div className="w-full flex flex-col items-center justify-center relative min-h-[320px]">
            {/* Reduced container height to pull graphics closer to top label */}
            <div className="relative w-[300px] h-[320px] flex items-center justify-center">

                {/* Updated viewBox: Cropped top from 20 to 40 to bring Third Eye closer to edge */}
                <svg viewBox="-20 40 340 380" className="absolute inset-0 w-full h-full overflow-visible z-10 pointer-events-none">
                    <defs>
                        <filter id="neonGlowAV" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Стеклянная трубка (фон) */}
                    <path d={combinedPath} stroke={COLOR_GLASS} strokeWidth={STROKE_WIDTH} fill="none" strokeLinecap="round" />

                    {/* === СТАРТОВЫЙ ШАР === */}
                    <MotionCircle
                        cx={startNodeX}
                        cy="380"
                        r={STROKE_WIDTH / 2}
                        fill={COLOR_INHALE}
                        animate={{
                            opacity: circleOpacity,
                            scale: circleScale,
                            filter: isReadyState ? `blur(${10 - readyProgress * 10}px)` : 'blur(0px)'
                        }}
                        transition={{
                            duration: 0.1,
                            ease: "linear"
                        }}
                        style={{ filter: 'url(#neonGlowAV)', originX: '50%', originY: '50%' }}
                    />

                    {/* === ОСНОВНАЯ АНИМАЦИЯ === */}
                    <MotionPath
                        d={combinedPath}
                        fill="none"
                        strokeLinecap="round"
                        filter="url(#neonGlowAV)"
                        animate={{
                            stroke: activeColor,
                            pathLength: pathLength,
                            pathOffset: pathOffset,
                            opacity: liquidOpacity
                        }}
                        transition={{
                            duration: 0.1,
                            ease: "linear"
                        }}
                        style={{ strokeWidth: STROKE_WIDTH }}
                    />

                    {/* Маркер Третьего Глаза */}
                    <circle cx="150" cy="60" r="4" fill="white" opacity="0.3" />

                    {/* Левый замок */}
                    <foreignObject x="30" y="350" width="80" height="90">
                        <div className="flex flex-col items-center justify-center h-full">
                            <MotionDiv
                                animate={{
                                    borderColor: leftStyle.borderColor,
                                    backgroundColor: leftStyle.bg,
                                    scale: leftStyle.scale
                                }}
                                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${leftStyle.textColor} transition-colors duration-300`}
                            >
                                <i className={`fas fa-${leftStyle.icon}`}></i>
                            </MotionDiv>
                            <span className="mt-2 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{leftFingerLabel}</span>
                        </div>
                    </foreignObject>

                    {/* Свитчер рук - Fades out when active */}
                    <foreignObject x="110" y="360" width="80" height="60">
                        <AnimatePresence>
                            {(!isActive || isReadyState) && (
                                <MotionDiv
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="flex flex-col items-center justify-center h-full pointer-events-auto"
                                >
                                    <button onClick={() => setIsLeftHanded(!isLeftHanded)} className="flex flex-col items-center gap-1 group">
                                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${isLeftHanded ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10' : 'border-cyan-500 text-cyan-400 bg-cyan-500/10'}`}>
                                            <i className={`fas fa-hand-paper text-xs ${isLeftHanded ? '-scale-x-100' : ''}`}></i>
                                        </div>
                                        <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-wide">{isLeftHanded ? 'Левша' : 'Правша'}</span>
                                    </button>
                                </MotionDiv>
                            )}
                        </AnimatePresence>
                    </foreignObject>

                    {/* Правый замок */}
                    <foreignObject x="190" y="350" width="80" height="90">
                        <div className="flex flex-col items-center justify-center h-full">
                            <MotionDiv
                                animate={{
                                    borderColor: rightStyle.borderColor,
                                    backgroundColor: rightStyle.bg,
                                    scale: rightStyle.scale
                                }}
                                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${rightStyle.textColor} transition-colors duration-300`}
                            >
                                <i className={`fas fa-${rightStyle.icon}`}></i>
                            </MotionDiv>
                            <span className="mt-2 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{rightFingerLabel}</span>
                        </div>
                    </foreignObject>
                </svg>

                {/* Центр таймер */}
                <div className="absolute top-[18%] flex flex-col items-center z-50 pointer-events-none">
                    <span className="text-7xl font-display font-bold text-white tabular-nums mb-4 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                        {Math.ceil(timeLeft)}
                    </span>

                    <div className="flex flex-col items-center gap-2">
                        {/* PHASE PILL */}
                        <div className="px-5 py-2 rounded-full bg-[#0a0a0b]/80 backdrop-blur-xl border border-white/10 shadow-[0_0_20px_-5px_rgba(0,0,0,0.5)]">
                            <span className="text-[11px] font-black text-gray-100 uppercase tracking-widest">{mainText}</span>
                        </div>

                        {/* ROUND COUNTER - MOVED INSIDE */}
                        {!isReadyState && !isDoneState && (
                            <motion.div
                                className="flex items-center gap-1 opacity-50 mt-1"
                                animate={{ opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 4, repeat: Infinity }}
                            >
                                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                                    Раунд {currentRound} / {totalRounds === 0 ? '∞' : totalRounds}
                                </span>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnulomaVilomaInterface;
