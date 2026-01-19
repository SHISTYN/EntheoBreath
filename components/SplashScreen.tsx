
import React from 'react';
import EntheoForest from './EntheoForest';

const SplashScreen: React.FC<{ isLoading: boolean }> = ({ isLoading }) => {
    if (!isLoading) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center transition-opacity duration-1000 animate-fade-in overflow-hidden"
            style={{ background: 'linear-gradient(to bottom, #0f0518, #2e1065)' }}
        >

            {/* --- VISUAL LAYER: PIXEL FOREST --- */}
            <div className="absolute inset-0 w-full h-full z-0">
                <EntheoForest className="w-full h-full" />

                {/* Vignette for cinematic focus */}
                <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/20 to-black/80 pointer-events-none"></div>
            </div>

            {/* --- UI LAYER: TYPOGRAPHY --- */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full pb-32 space-y-4 pointer-events-none">

                {/* Main Title - Retro Glow */}
                <h1 className="text-4xl md:text-6xl font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] text-center px-4">
                    ENTHEOBREATH
                </h1>

                {/* Subtitle - Monospace for retro feel */}
                <div className="flex flex-col items-center gap-4">
                    <p className="text-cyan-500/80 text-[10px] md:text-xs font-mono font-bold uppercase tracking-[0.4em] text-center animate-pulse">
                        ЗАГРУЗКА СОЗНАНИЯ...
                    </p>

                    {/* Pixel Loader Bar */}
                    <div className="flex gap-1">
                        <div className="w-2 h-2 bg-cyan-500 animate-pulse"></div>
                        <div className="w-2 h-2 bg-purple-500 animate-pulse [animation-delay:0.1s]"></div>
                        <div className="w-2 h-2 bg-rose-500 animate-pulse [animation-delay:0.2s]"></div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SplashScreen;
