import React, { useRef } from 'react';
import { motion } from 'framer-motion';

const MotionDiv = motion.div as any;

const SpotlightCard: React.FC<{
    children: React.ReactNode;
    className?: string;
    contentClassName?: string;
    onClick?: () => void
}> = ({ children, className = "", contentClassName = "p-6", onClick }) => {
    const divRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = React.useState(false);
    const [position, setPosition] = React.useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = React.useState(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!divRef.current) return;
        const div = divRef.current;
        const rect = div.getBoundingClientRect();
        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const handleFocus = () => {
        setIsFocused(true);
        setOpacity(1);
    };

    const handleBlur = () => {
        setIsFocused(false);
        setOpacity(0);
    };

    const handleMouseEnter = () => {
        setOpacity(1);
    };

    const handleMouseLeave = () => {
        setOpacity(0);
    };

    return (
        <MotionDiv
            ref={divRef}
            onMouseMove={handleMouseMove}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`relative group rounded-[24px] overflow-hidden border border-white/10 dark:border-white/5 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl transition-colors duration-500 hover:border-white/20 ${className}`}
        >
            {/* 1. MOUSE SPOTLIGHT (The "Pro" Glow) */}
            <div
                className="pointer-events-none absolute -inset-px transition opacity duration-300"
                style={{
                    opacity,
                    background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(34, 211, 238, 0.1), transparent 40%)`,
                }}
            />

            {/* 2. BORDER SPOTLIGHT (Subtle rim movement) */}
            <div
                className="pointer-events-none absolute -inset-px rounded-[24px] transition opacity duration-300"
                style={{
                    opacity,
                    background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, rgba(255, 255, 255, 0.2), transparent 40%)`,
                    maskImage: 'linear-gradient(black, black) content-box, linear-gradient(black, black)',
                    WebkitMaskImage: 'linear-gradient(black, black) content-box, linear-gradient(black, black)',
                    maskComposite: 'exclude',
                    WebkitMaskComposite: 'xor',
                    padding: '1px' // Border width
                }}
            />

            {/* Content */}
            <div className={`relative z-10 h-full flex flex-col ${contentClassName}`}>
                {children}
            </div>
        </MotionDiv>
    );
};

export default SpotlightCard;