import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface LiquidButtonProps extends HTMLMotionProps<"button"> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'glass';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    glowColor?: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
}

export const LiquidButton: React.FC<LiquidButtonProps> = ({
    variant = 'primary',
    size = 'md',
    glowColor = 'rgba(6,182,212,0.5)', // Cyan default
    icon,
    children,
    className = '',
    ...props
}) => {
    // Base Styles
    const baseStyles = "relative overflow-hidden rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none";

    // Sizes
    const sizes = {
        sm: "px-4 py-2 text-xs",
        md: "px-6 py-3.5 text-sm",
        lg: "px-8 py-4 text-base",
        icon: "w-10 h-10 p-0"
    };

    // Variants
    const variants = {
        primary: "bg-white text-black shadow-[0_0_20px_-5px_rgba(255,255,255,0.4)] hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.6)] border border-transparent",
        secondary: "bg-zinc-800 text-white border border-zinc-700 hover:bg-zinc-700",
        ghost: "bg-transparent text-zinc-400 hover:text-white hover:bg-white/5",
        glass: "bg-white/5 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10 hover:border-white/20 shadow-lg"
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.96, y: 0 }}
            className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
            {...props}
        >
            {/* Glow Effect on Hover (Primary/Glass only) */}
            {(variant === 'primary' || variant === 'glass') && (
                <motion.div
                    className="absolute inset-0 z-0 opacity-0 hover:opacity-100 transition-opacity duration-500"
                    style={{
                        background: `radial-gradient(circle at center, ${glowColor}, transparent 70%)`,
                        filter: 'blur(15px)'
                    }}
                />
            )}

            <span className="relative z-10 flex items-center gap-2">
                {icon}
                {children}
            </span>
        </motion.button>
    );
};
