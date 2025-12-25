import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Play, AlertTriangle } from 'lucide-react';

const MotionDiv = motion.div as any;

const VIDEO_DATA = {
    ru: {
        id: 'mD3QwerSmLs', // Альтернатива (часто открыта для встройки)
        label: 'RU 🇷🇺',
        views: '18M+',
        title: 'Вим Хоф: Официальный Гайд',
        duration: '11:00',
        color: 'from-cyan-400 to-blue-600',
        fallbackGradient: 'bg-gradient-to-br from-slate-900 to-slate-800'
    },
    en: {
        id: 'tybOi4hjZFQ',
        label: 'EN 🇬🇧',
        views: '108M+',
        title: 'Guided Breathing (Original)',
        duration: '11:00',
        color: 'from-amber-400 to-orange-600',
        fallbackGradient: 'bg-gradient-to-br from-stone-900 to-stone-800'
    }
};

interface WimHofGuideProps {
    onStartPractice?: () => void;
    onBack?: () => void;
}

const WimHofGuide: React.FC<WimHofGuideProps> = ({ onStartPractice }) => {
    const [lang, setLang] = useState<'ru' | 'en'>('ru');
    const [isPlaying, setIsPlaying] = useState(false);
    const [imgError, setImgError] = useState(false);
    const [origin, setOrigin] = useState('');

    const activeVideo = VIDEO_DATA[lang];

    // Вычисляем Origin для корректного запроса к YouTube (чтобы не было ошибки 153)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setOrigin(window.location.origin);
        }
    }, []);

    const handleOpenExternal = () => {
        window.open(`https://www.youtube.com/watch?v=${activeVideo.id}`, '_blank');
    };

    const handlePlay = () => {
        setIsPlaying(true);
    };

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
                            onClick={() => { setLang(key); setIsPlaying(false); }}
                            className={`relative flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all z-10 flex flex-col items-center gap-1 ${
                                lang === key ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                            }`}
                        >
                            <span className="flex items-center gap-2">
                                {VIDEO_DATA[key].label}
                            </span>
                            <span className={`text-[9px] font-mono opacity-60 ${lang === key ? 'text-cyan-400' : ''}`}>
                                {VIDEO_DATA[key].views}
                            </span>
                        </button>
                    ))}
                </div>

                {/* 3. ROBUST MEDIA CARD */}
                <div className="w-full">
                    <div className="relative z-10 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#0a0a0b] aspect-video flex flex-col group">
                        
                        {/* Glow Effect */}
                        <div className={`absolute -inset-4 bg-gradient-to-r ${activeVideo.color} opacity-20 blur-[50px] transition-all duration-700 group-hover:opacity-30 z-0 pointer-events-none`}></div>

                        {!isPlaying ? (
                            /* --- VIEW 1: LAUNCHER (Static Image) --- */
                            <div 
                                onClick={handlePlay}
                                className={`w-full h-full relative flex-col ${imgError ? activeVideo.fallbackGradient : 'bg-black'} z-10 cursor-pointer`}
                            >
                                {!imgError && (
                                    <img 
                                        src={`https://i.ytimg.com/vi/${activeVideo.id}/maxresdefault.jpg`}
                                        alt={activeVideo.title}
                                        onError={() => setImgError(true)}
                                        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-500"
                                    />
                                )}
                                <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center">
                                    <MotionDiv 
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="flex flex-col items-center gap-4"
                                    >
                                        <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)] group-hover:bg-red-600 group-hover:border-red-500 transition-all duration-300">
                                            <Play size={36} className="text-white ml-2 fill-white" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-lg md:text-xl font-bold text-white drop-shadow-md">
                                                Нажми, чтобы начать
                                            </h4>
                                        </div>
                                    </MotionDiv>
                                </div>
                            </div>
                        ) : (
                            /* --- VIEW 2: PLAYER (Standard Iframe with Fixes) --- */
                            <div className="w-full h-full relative bg-black flex-col z-10">
                                <iframe 
                                    key={activeVideo.id} // Force re-mount on ID change
                                    width="100%" 
                                    height="100%" 
                                    // 1. ORIGIN: Важно для предотвращения блокировки (указываем кто мы)
                                    src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1&modestbranding=1&rel=0&origin=${origin}`}
                                    title={activeVideo.title}
                                    frameBorder="0"
                                    // 2. PERMISSIONS: Полный набор для мобильных/десктопов
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                    // 3. REFERRER POLICY: Самый важный фикс для Ошибки 153 в 2025 году
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    allowFullScreen
                                    className="flex-1 w-full h-full object-cover relative z-20"
                                ></iframe>
                            </div>
                        )}
                    </div>

                    {/* CONTROL BAR */}
                    <div className="flex items-center justify-between mt-3 px-2">
                        <div className="flex flex-col">
                            <span className="text-white font-bold text-xs leading-tight">{activeVideo.title}</span>
                            <span className="text-gray-500 text-[10px] font-mono">{activeVideo.duration}</span>
                        </div>
                        
                        {isPlaying && (
                             <button 
                                onClick={() => setIsPlaying(false)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-[10px] font-bold text-red-400 transition-all"
                            >
                                <ExternalLink size={12} />
                                Вернуть обложку
                            </button>
                        )}
                    </div>
                </div>

                {/* 4. EMERGENCY FALLBACK (Only visible when player is active) */}
                {/* Если YouTube все равно блокирует (например, в РФ или из-за настроек автора), даем прямую ссылку */}
                {isPlaying && (
                    <div className="w-full flex flex-col gap-2 animate-fade-in">
                        <button 
                            onClick={handleOpenExternal}
                            className="w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 hover:text-white font-bold rounded-xl uppercase tracking-widest text-[10px] transition-colors flex items-center justify-center gap-2"
                        >
                            <AlertTriangle size={12} className="text-amber-500" />
                            Черный экран? Открыть в YouTube
                        </button>
                    </div>
                )}

                {/* 5. INSTRUCTION CARD */}
                <div className="bg-white/5 border border-white/5 rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden mt-2">
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