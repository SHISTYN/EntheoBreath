import React, { useState } from 'react';
import { motion } from 'framer-motion';

const VIDEO_DATA = {
    ru: {
        id: 'mD3QwerSmLs',
        label: 'RU 🇷🇺',
        views: '18M+',
        title: 'Официальный гайд (Русский)',
        color: 'from-cyan-400 to-blue-600'
    },
    en: {
        id: 'tybOi4hjZFQ',
        label: 'EN 🇬🇧',
        views: '108M+',
        title: 'Guided Breathing (Original)',
        color: 'from-amber-400 to-orange-600'
    }
};

interface WimHofGuideProps {
    onStartPractice: () => void;
    // onBack is no longer needed as the parent tabs handle navigation/context
    onBack?: () => void;
}

const WimHofGuide: React.FC<WimHofGuideProps> = ({ onStartPractice }) => {
    const [lang, setLang] = useState<'ru' | 'en'>('ru');
    const activeVideo = VIDEO_DATA[lang];

    return (
        <div className="w-full flex flex-col bg-[#0B0E11] min-h-0 h-full overflow-y-auto custom-scrollbar">
            
            <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 px-4 py-8 animate-fade-in">
                
                {/* 1. SOCIAL PROOF HEADER */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 backdrop-blur-md shadow-[0_0_20px_rgba(245,158,11,0.15)] mb-2">
                        <i className="fas fa-fire text-premium-gold animate-pulse"></i>
                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.15em] text-amber-500">
                            Мировой Феномен
                        </span>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-display font-bold text-white leading-none">
                        <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">126</span>
                        <span className="text-premium-gold">,</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">000</span>
                        <span className="text-premium-gold">,</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">000</span>
                    </h3>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                        Просмотров на YouTube
                    </p>
                </div>

                {/* 2. LANGUAGE CONTROLS */}
                <div className="bg-white/5 border border-white/5 p-1.5 rounded-2xl flex relative">
                    <motion.div 
                        className="absolute top-1.5 bottom-1.5 rounded-xl bg-white/10 border border-white/5 shadow-inner"
                        layoutId="activeLangTabVideo"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        style={{ 
                            width: 'calc(50% - 6px)', 
                            left: lang === 'ru' ? '4px' : 'calc(50% + 2px)' 
                        }}
                    />
                    
                    {(['ru', 'en'] as const).map((key) => (
                        <button
                            key={key}
                            onClick={() => setLang(key)}
                            className={`relative flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all z-10 flex flex-col items-center gap-1 ${
                                lang === key ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                            }`}
                        >
                            <span className="flex items-center gap-2">
                                {VIDEO_DATA[key].label}
                            </span>
                            <span className={`text-[9px] font-mono opacity-60 ${lang === key ? 'text-cyan-400' : ''}`}>
                                {VIDEO_DATA[key].views} Views
                            </span>
                        </button>
                    ))}
                </div>

                {/* 3. THE CINEMA (VIDEO PLAYER) */}
                <div className="relative group w-full">
                    <div className={`absolute -inset-4 bg-gradient-to-r ${activeVideo.color} opacity-20 blur-[50px] transition-all duration-700 group-hover:opacity-30`}></div>
                    
                    <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black aspect-video">
                        <iframe 
                            width="100%" 
                            height="100%" 
                            src={`https://www.youtube.com/embed/${activeVideo.id}?rel=0&modestbranding=1`} 
                            title="Wim Hof Breathing Method" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                            allowFullScreen
                            className="w-full h-full object-cover"
                        ></iframe>
                    </div>
                </div>

                {/* 4. PRINCIPLES & START CTA */}
                <div className="bg-white/5 border border-white/5 rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/10 to-transparent blur-3xl"></div>
                    
                    <div className="flex items-center gap-3 mb-4 relative z-10">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 border border-cyan-500/30">
                            <i className="fas fa-check text-sm"></i>
                        </div>
                        <h4 className="text-lg font-display font-bold text-white">Готовы начать?</h4>
                    </div>

                    <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                        Рекомендуется выполнить 3-4 раунда. Дышите глубоко, но без напряжения. Если почувствуете головокружение — остановитесь.
                    </p>

                    <button 
                        onClick={onStartPractice}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-display font-bold text-lg uppercase tracking-[0.1em] shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_50px_rgba(6,182,212,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                    >
                        <span>Начать Дыхание</span>
                        <i className="fas fa-arrow-right"></i>
                    </button>
                </div>

            </div>
        </div>
    );
};

export default WimHofGuide;