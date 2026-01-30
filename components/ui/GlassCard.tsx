import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    variant?: 'base' | 'heavy' | 'light';
    hoverEffect?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({
    children,
    className = '',
    variant = 'base',
    hoverEffect = false,
    ...props
}) => {

    const variants = {
        base: 'bg-zinc-900/60 backdrop-blur-xl border-white/10',
        heavy: 'bg-zinc-950/80 backdrop-blur-2xl border-white/5',
        light: 'bg-white/10 backdrop-blur-lg border-white/20'
    };

    const hoverClasses = hoverEffect
        ? 'hover:bg-zinc-800/80 hover:border-white/20 transition-all duration-300'
        : '';

    return (
        <motion.div
            className={`
        rounded-2xl border shadow-xl
        ${variants[variant]} 
        ${hoverClasses}
        ${className}
      `}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export default GlassCard;
