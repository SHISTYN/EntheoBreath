import React from 'react';

interface Props {
    theme: 'dark' | 'light';
}

const AppBackground: React.FC<Props> = ({ theme }) => {
    // 🎞 NOISE TEXTURE (Stealth Grain)
    // Opacity 0.05 is the sweet spot for "Stealth" UI on OLED screens.
    const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`;

    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden transition-colors duration-700 bg-[#000000]">
            
            {/* --- DARK MODE: RAYCAST/LINEAR STAGE LIGHT --- */}
            <div 
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`}
            >
                 {/* 1. Main Stage Light (The God Ray)
                     A cold, sharp light hitting the center stage from above. 
                     Uses a specific Cyan tint (rgba 34, 211, 238, 0.15) fading to transparent.
                 */}
                 <div 
                    className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[120%] h-[700px]"
                    style={{
                        background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(34, 211, 238, 0.15), transparent 70%)',
                        filter: 'blur(80px)', 
                        transform: 'translateZ(0)',
                    }} 
                />

                {/* 2. Secondary Atmosphere (Volume)
                    Adds a slight "thickness" to the air at the very top using Slate colors.
                    Linear gradient from top to bottom.
                */}
                <div 
                    className="absolute top-0 left-0 right-0 h-[500px] opacity-40"
                    style={{
                         background: 'linear-gradient(to bottom, #0f172a, transparent)', // Slate-900 to transparent
                         maskImage: 'linear-gradient(to bottom, black, transparent)' // Smooth fade out
                    }}
                />
            </div>

            {/* --- LIGHT MODE: ZEN CLEAN --- */}
            <div 
                className={`absolute inset-0 bg-[#F8FAFC] transition-opacity duration-1000 ease-in-out ${theme === 'light' ? 'opacity-100' : 'opacity-0'}`}
            >
                 <div 
                    className="absolute top-0 left-0 right-0 h-[60vh] opacity-60"
                    style={{
                         background: 'radial-gradient(circle at 50% -20%, #ccfbf1, transparent 70%)', // Teal-50
                         filter: 'blur(80px)',
                         transform: 'translateZ(0)'
                    }}
                 />
            </div>

            {/* --- GLOBAL NOISE OVERLAY --- */}
            <div 
                className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none"
                style={{ backgroundImage: NOISE_SVG }}
            />
        </div>
    );
};

export default AppBackground;