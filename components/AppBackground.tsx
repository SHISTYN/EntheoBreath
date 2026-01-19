
import React from 'react';
import { motion } from 'framer-motion';

interface Props {
    theme: 'dark' | 'light';
}

const MotionDiv = motion.div as any;

const AppBackground: React.FC<Props> = ({ theme }) => {
    const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`;

    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden transition-colors duration-1000 bg-[#000000]">

            {/* --- DARK MODE: LIQUID GLASS ATMOSPHERE --- */}
            <div
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`}
            >
                {/* 1. Deep Space Base */}
                <div className="absolute inset-0 bg-[#000000]"></div>

                {/* 2. Fluid Mesh Gradient (Organic Movement) */}
                <MotionDiv
                    animate={{
                        backgroundPosition: ['0% 0%', '100% 100%', '0% 100%', '0% 0%'],
                    }}
                    transition={{
                        duration: 40,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute inset-0 opacity-30"
                    style={{
                        background: 'radial-gradient(circle at 50% 50%, rgba(34, 211, 238, 0.15), transparent 50%), radial-gradient(circle at 0% 0%, rgba(168, 85, 247, 0.1), transparent 50%), radial-gradient(circle at 100% 100%, rgba(59, 130, 246, 0.1), transparent 50%)',
                        filter: 'blur(80px)',
                        backgroundSize: '200% 200%'
                    }}
                />

                {/* 3. God Ray (Breathing Light) */}
                <MotionDiv
                    animate={{
                        opacity: [0.3, 0.6, 0.3],
                        scale: [1, 1.1, 1],
                        rotate: [-5, 5, -5]
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[140%] h-[1000px]"
                    style={{
                        background: 'conic-gradient(from 180deg at 50% 0%, transparent 0deg, rgba(34, 211, 238, 0.1) 20deg, transparent 40deg)',
                        filter: 'blur(60px)',
                        transform: 'translateZ(0)',
                        mixBlendMode: 'screen'
                    }}
                />

                {/* 4. Drifting Nebula (Purple) */}
                <MotionDiv
                    animate={{
                        x: [0, 100, -50, 0],
                        y: [0, -50, 50, 0],
                        opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15), transparent 70%)',
                        filter: 'blur(100px)',
                        transform: 'translateZ(0)',
                        mixBlendMode: 'screen'
                    }}
                />

                {/* 5. Vignette & Grain Overlay handled by global noise below */}
            </div>

            {/* --- LIGHT MODE: ZEN CLEAN (WARMER TINT) --- */}
            <div
                className={`absolute inset-0 bg-[#F5F5F7] transition-opacity duration-1000 ease-in-out ${theme === 'light' ? 'opacity-100' : 'opacity-0'}`}
            >
                <MotionDiv
                    animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 opacity-40"
                    style={{
                        background: 'radial-gradient(circle at 50% 0%, #e0f2fe, transparent 80%)',
                        filter: 'blur(60px)',
                    }}
                />
                {/* Warm ambient glow bottom right */}
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-amber-100/30 blur-[80px] rounded-full pointer-events-none"></div>
            </div>

            {/* Глобальный шум (Cinematic Grain) */}
            <div
                className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none"
                style={{ backgroundImage: NOISE_SVG }}
            />
        </div>
    );
};

export default React.memo(AppBackground);
