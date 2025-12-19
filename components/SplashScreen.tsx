import React from 'react';
import EntheoLogo from './EntheoLogo';

const SplashScreen: React.FC<{ isLoading: boolean }> = ({ isLoading }) => {
    if (!isLoading) return null;
    
    return (
        <div className="fixed inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-center transition-opacity duration-1000 animate-fade-in">
            <div className="mb-8 transform scale-100 md:scale-125 transition-transform duration-700">
                <EntheoLogo className="w-32 h-32 md:w-40 md:h-40" animated={true} />
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-zen-accent via-premium-purple to-premium-gold tracking-[0.2em] animate-pulse text-center px-4 uppercase">EntheoBreath</h1>
            <p className="text-premium-purple/70 mt-4 text-[10px] md:text-xs font-bold uppercase tracking-[0.5em] text-center">Загрузка сознания...</p>
        </div>
    );
};

export default SplashScreen;