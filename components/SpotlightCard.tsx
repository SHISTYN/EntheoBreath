import React, { useRef } from 'react';
import { motion } from 'framer-motion';

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
        <motion.div 
            ref={divRef}
            onMouseMove={handleMouseMove}
            onClick={onClick}
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className={`spotlight-card relative group rounded-[24px] overflow-hidden ${className}`}
        >
            {/* Glass Border Gradient */}
            <div className="absolute inset-0 rounded-[24px] p-[1px] bg-gradient-to-br from-white/10 to-transparent group-hover:from-premium-purple/40 group-hover:to-zen-accent/40 transition-all duration-500 z-0 pointer-events-none"></div>
            
            {/* Background & Blur */}
            <div className="absolute inset-[1px] rounded-[23px] bg-white/80 dark:bg-[#0f0f10]/80 backdrop-blur-xl z-0 transition-colors duration-500 group-hover:bg-white/90 dark:group-hover:bg-[#151516]/90"></div>

            {/* Content Container */}
            <div className={`relative z-10 h-full flex flex-col ${contentClassName}`}>
                {children}
            </div>
        </motion.div>
    );
};

export default SpotlightCard;