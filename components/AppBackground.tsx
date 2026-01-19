
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

            {/* --- DARK MODE: OPTIMIZED LIQUID GLASS --- */}
            <div
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`}
            >
                {/* 1. Deep Space Base */}
                <div className="absolute inset-0 bg-[#000000]"></div>

                {/* 2. Optimized Mesh Gradient (CSS Only, No JS Animation Loop) */}
                <div
                    className="absolute inset-0 opacity-40"
                    style={{
                        background: 'radial-gradient(circle at 50% 50%, rgba(34, 211, 238, 0.1), transparent 60%), radial-gradient(circle at 10% 10%, rgba(168, 85, 247, 0.08), transparent 50%), radial-gradient(circle at 90% 90%, rgba(59, 130, 246, 0.08), transparent 50%)',
                        filter: 'blur(40px)', // Reduced blur radius for performance
                    }}
                />

                {/* 3. Static God Ray (Subtle) */}
                <div
                    className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[120%] h-[80vh] opacity-20 pointer-events-none"
                    style={{
                        background: 'conic-gradient(from 180deg at 50% 0%, transparent 0deg, rgba(34, 211, 238, 0.15) 20deg, transparent 40deg)',
                        filter: 'blur(40px)',
                        mixBlendMode: 'screen'
                    }}
                />

                {/* 4. Bottom Glow */}
                <div
                    className="absolute bottom-[-10%] right-[-10%] w-[60vh] h-[60vh] rounded-full opacity-20 pointer-events-none"
                    style={{
                        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15), transparent 70%)',
                        filter: 'blur(50px)',
                        mixBlendMode: 'screen'
                    }}
                />
            </div>

            {/* --- LIGHT MODE: ZEN CLEAN --- */}
            <div
                className={`absolute inset-0 bg-[#F5F5F7] transition-opacity duration-1000 ease-in-out ${theme === 'light' ? 'opacity-100' : 'opacity-0'}`}
            >
                <div
                    className="absolute inset-0 opacity-40"
                    style={{
                        background: 'radial-gradient(circle at 50% 0%, #e0f2fe, transparent 80%)',
                        filter: 'blur(40px)',
                    }}
                />
            </div>

            {/* 5. Static Noise (Performance Optimized) */}
            <div
                className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
                style={{ backgroundImage: NOISE_SVG }}
            />
        </div>
    );
};

export default React.memo(AppBackground);
