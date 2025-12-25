import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Copy, Check, Play, Zap, MonitorPlay } from 'lucide-react';

const MotionDiv = motion.div as any;

const VIDEO_DATA = {
    ru: {
        id: 'mD3QwerSmLs', 
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
    const [mode, setMode] = useState<'launcher' | 'embed'>('launcher');
    const [imgError, setImgError] = useState(false);
    const [origin, setOrigin] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setOrigin(window.location.origin);
        }
    }, []);

    useEffect(() => {
        // Reset state on language change
        setMode('launcher');
        setImgError(false);
    }, [lang]);

    const activeVideo = VIDEO_DATA[lang];

    const handleOpenExternal = () => {
        // Direct link is the most reliable method in 2025 against bot-checks
        window.open(`https://www.youtube.com/watch?v=${activeVideo.id}`, '_blank');
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
                            onClick={() => setLang(key)}
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

                {/* 3. ROBUST MEDIA CARD (LAUNCHER) */}
                <div className="relative group w-full">
                    
                    {/* Glow Effect */}
                    <div className={`absolute -inset-4 bg-gradient-to-r ${activeVideo.color} opacity-20 blur-[50px] transition-all duration-700 group-hover:opacity-30 z-0`}></div>
                    
                    {/* The Box */}
                    <div className="relative z-10 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#0a0a0b] aspect-video flex flex-col">
                        
                        {mode === 'launcher' ? (
                            // --- LAUNCHER MODE (100% Reliable) ---
                            <div className={`w-full h-full relative flex flex-col ${imgError ? activeVideo.fallbackGradient : 'bg-black'}`}>
                                
                                {/* Background Image (If loaded) */}
                                {!imgError && (
                                    <img 
                                        src={`https://i.ytimg.com/vi/${activeVideo.id}/maxresdefault.jpg`}
                                        alt={activeVideo.title}
                                        onError={() => setImgError(true)}
                                        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-500"
                                    />
                                )}

                                {/* Content Overlay */}
                                <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center">
                                    
                                    {/* Play Button */}
                                    <MotionDiv 
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleOpenExternal}
                                        className="cursor-pointer group/btn flex flex-col items-center gap-4"
                                    >
                                        <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)] group-hover/btn:bg-red-600 group-hover/btn:border-red-500 transition-all duration-300">
                                            <Play size={36} className="text-white ml-2 fill-white" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-lg md:text-xl font-bold text-white drop-shadow-md">
                                                Смотреть на YouTube
                                            </h4>
                                            <p className="text-[10px] text-gray-300 font-medium uppercase tracking-wider bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm inline-block">
                                                Откроется в приложении
                                            </p>
                                        </div>
                                    </MotionDiv>
                                </div>

                                {/* Bottom Bar */}
                                <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between items-end bg-gradient-to-t from-black/90 to-transparent">
                                    <div className="flex flex-col">
                                        <span className="text-white font-bold text-sm leading-tight max-w-[200px] md:max-w-xs truncate">{activeVideo.title}</span>
                                        <span className="text-gray-400 text-xs font-mono">{activeVideo.duration}</span>
                                    </div>
                                    
                                    {/* Embed Toggle */}
                                    <button 
                                        onClick={() => setMode('embed')}
                                        className="text-[10px] font-bold text-gray-500 hover:text-white flex items-center gap-1.5 transition-colors bg-white/5 hover:bg-white/10 px-2 py-1.5 rounded-lg backdrop-blur-sm"
                                    >
                                        <MonitorPlay size={10} />
                                        Встроить
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // --- EMBED MODE (Legacy/Risky) ---
                            <div className="w-full h-full relative bg-black flex flex-col">
                                <iframe 
                                    key={activeVideo.id}
                                    width="100%" 
                                    height="100%" 
                                    src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1&rel=0&playsinline=1&modestbranding=1&origin=${origin}`} 
                                    title={activeVideo.title} 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                    allowFullScreen
                                    className="flex-1 w-full h-full object-cover"
                                ></iframe>
                                
                                {/* Return to Launcher */}
                                <div className="absolute top-2 right-2">
                                     <button 
                                        onClick={() => setMode('launcher')}
                                        className="bg-black/60 text-white px-3 py-1 rounded-full text-[10px] font-bold backdrop-blur-md border border-white/10 hover:bg-red-600/80 transition-colors"
                                    >
                                        Закрыть
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. HELPER TEXT */}
                <div className="flex items-center justify-center gap-2 opacity-60">
                    <Zap size={12} className="text-amber-500" />
                    <p className="text-[10px] text-gray-400 font-medium">
                        Если видео не грузится — нажмите большую кнопку Play.
                    </p>
                </div>

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