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

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!divRef.current) return;
        const div = divRef.current;
        const rect = div.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        div.style.setProperty("--mouse-x", `${x}px`);
        div.style.setProperty("--mouse-y", `${y}px`);
    };

    return (
        <MotionDiv
            ref={divRef}
            onMouseMove={handleMouseMove}
            onClick={onClick}
            whileHover={{ y: -6, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`spotlight-card relative group rounded-[28px] overflow-hidden ${className}`}
        >
            {/* 1. Dynamic Border Gradient */}
            <div className="absolute inset-0 rounded-[28px] p-[1.5px] bg-gradient-to-br from-white/10 to-transparent group-hover:from-cyan-400/40 group-hover:to-purple-500/40 transition-all duration-500 z-0 pointer-events-none opacity-50 group-hover:opacity-100"></div>

            {/* 2. Glass Background */}
            <div className="absolute inset-[1.5px] rounded-[26.5px] bg-white/70 dark:bg-[#0f0f10]/70 backdrop-blur-2xl z-0 transition-colors duration-500 group-hover:bg-white/95 dark:group-hover:bg-[#18181b]/90"></div>

            {/* 3. Shine Reflection (Sheen) */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none z-0 bg-gradient-to-tr from-transparent via-white to-transparent -translate-x-[100%] group-hover:animate-shine"></div>

            {/* Content Container */}
            <div className={`relative z-10 h-full flex flex-col ${contentClassName}`}>
                {children}
            </div>
        </MotionDiv>
    );
};

export default SpotlightCard;