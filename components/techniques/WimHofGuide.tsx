import React, { useState } from 'react';
import { motion } from 'framer-motion';

const MotionDiv = motion.div as any;

const VIDEO_DATA = {
    ru: {
        id: 'mD3QwerSmLs', // Official English with subs usually, but let's keep it as is for now or use a RU dub if preferred later.
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
    onStartPractice?: () => void;
    onBack?: () => void;
}

const WimHofGuide: React.FC<WimHofGuideProps> = ({ onStartPractice }) => {
    const [lang, setLang] = useState<'ru' | 'en'>('ru');
    const activeVideo = VIDEO_DATA[lang];

    return (
        <div className="w-full flex flex-col">
            
            <div className="w-full mx-auto flex flex-col gap-6 animate-fade-in">
                
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
                    <MotionDiv 
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
                    {/* Glow Effect behind */}
                    <div className={`absolute -inset-4 bg-gradient-to-r ${activeVideo.color} opacity-20 blur-[50px] transition-all duration-700 group-hover:opacity-30 z-0`}></div>
                    
                    {/* Video Container */}
                    <div className="relative z-10 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black aspect-video">
                        <iframe 
                            key={activeVideo.id}
                            width="100%" 
                            height="100%" 
                            src={`https://www.youtube-nocookie.com/embed/${activeVideo.id}?rel=0&autoplay=0&playsinline=1`} 
                            title={activeVideo.title} 
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
                        <h4 className="text-lg font-display font-bold text-white">Инструкция</h4>
                    </div>

                    <p className="text-sm text-gray-400 mb-2 leading-relaxed">
                        Рекомендуется выполнить 3-4 раунда. Дышите глубоко, но без напряжения. Если почувствуете головокружение — остановитесь.
                    </p>
                    <p className="text-xs text-gray-500 italic">
                        *Используйте таймер в левой панели для ведения статистики и ритма.
                    </p>
                </div>

            </div>
        </div>
    );
};

export default WimHofGuide;