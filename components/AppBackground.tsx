import React from 'react';
import { motion } from 'framer-motion';

interface Props {
    theme: 'dark' | 'light';
}

const MotionDiv = motion.div as any;

const AppBackground: React.FC<Props> = ({ theme }) => {
    // 🎞 NOISE TEXTURE (Stealth Grain)
    const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`;

    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden transition-colors duration-700 bg-[#000000]">
            
            {/* --- DARK MODE: LIQUID ATMOSPHERE --- */}
            <div 
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`}
            >
                 {/* 1. The "God Ray" (Main Light) - Breathing */}
                 <MotionDiv 
                    animate={{ 
                        opacity: [0.6, 0.8, 0.6],
                        scale: [1, 1.05, 1]
                    }}
                    transition={{ 
                        duration: 8, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                    }}
                    className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[140%] h-[800px]"
                    style={{
                        background: 'radial-gradient(ellipse 50% 50% at 50% 0%, rgba(34, 211, 238, 0.12), transparent 70%)',
                        filter: 'blur(90px)', 
                        transform: 'translateZ(0)',
                    }} 
                />

                {/* 2. Secondary Aurora (Purple Haze) - Moving */}
                <MotionDiv 
                    animate={{ 
                        x: [-20, 20, -20],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ 
                        duration: 15, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                    }}
                    className="absolute top-[10%] right-[-20%] w-[800px] h-[800px] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(124, 58, 237, 0.08), transparent 60%)',
                        filter: 'blur(100px)',
                        transform: 'translateZ(0)'
                    }}
                />

                {/* 3. Deep Void Vignette (Top Gradient) */}
                <div 
                    className="absolute top-0 left-0 right-0 h-[400px]"
                    style={{
                         background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.8), transparent)', 
                         maskImage: 'linear-gradient(to bottom, black, transparent)'
                    }}
                />
            </div>

            {/* --- LIGHT MODE: ZEN CLEAN --- */}
            <div 
                className={`absolute inset-0 bg-[#F8FAFC] transition-opacity duration-1000 ease-in-out ${theme === 'light' ? 'opacity-100' : 'opacity-0'}`}
            >
                 <MotionDiv 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-10%] left-0 right-0 h-[70vh] opacity-60"
                    style={{
                         background: 'radial-gradient(circle at 50% 0%, #ccfbf1, transparent 70%)', // Teal-50
                         filter: 'blur(80px)',
                         transform: 'translateZ(0)'
                    }}
                 />
            </div>

            {/* --- GLOBAL NOISE OVERLAY --- */}
            <div 
                className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none"
                style={{ backgroundImage: NOISE_SVG }}
            />
        </div>
    );
};

export default AppBackground;