import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Play, MonitorPlay, AlertTriangle } from 'lucide-react';

const MotionDiv = motion.div as any;

const VIDEO_DATA = {
    ru: {
        // Пробуем альтернативное видео (русская озвучка), если официальное блокируют
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

    const activeVideo = VIDEO_DATA[lang];

    const handleOpenExternal = () => {
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
                            onClick={() => { setLang(key); setMode('launcher'); }}
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

                        {/* --- VIEW 1: LAUNCHER (Default) --- */}
                        <div 
                            onClick={handleOpenExternal}
                            style={{ display: mode === 'launcher' ? 'flex' : 'none' }}
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
                                            Смотреть на YouTube
                                        </h4>
                                    </div>
                                </MotionDiv>
                            </div>
                        </div>

                        {/* --- VIEW 2: EMBED (NUCLEAR BYPASS OPTION) --- */}
                        <div 
                            style={{ display: mode === 'embed' ? 'flex' : 'none' }}
                            className="w-full h-full relative bg-black flex-col z-10"
                        >
                            {/* 
                                NUCLEAR HACK: srcDoc
                                Using srcDoc creates a completely clean browsing context.
                                This strips referrer headers and often bypasses "Domain Restricted" blocks.
                            */}
                            <iframe 
                                key={activeVideo.id}
                                width="100%" 
                                height="100%"
                                title={activeVideo.title}
                                className="flex-1 w-full h-full object-cover relative z-20"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                                srcDoc={`
                                    <style>
                                        body { margin: 0; padding: 0; background: #000; overflow: hidden; display: flex; align-items: center; justify-content: center; height: 100vh; }
                                        iframe { border: none; width: 100%; height: 100%; }
                                        .loader { color: #555; font-family: sans-serif; font-size: 12px; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: -1; }
                                    </style>
                                    <div class="loader">Загрузка YouTube...</div>
                                    <iframe 
                                        src="https://www.youtube.com/embed/${activeVideo.id}?autoplay=1&playsinline=1&rel=0&modestbranding=1" 
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                        allowfullscreen
                                    ></iframe>
                                `}
                            ></iframe>
                        </div>
                    </div>

                    {/* CONTROL BAR */}
                    <div className="flex items-center justify-between mt-3 px-2">
                        <div className="flex flex-col">
                            <span className="text-white font-bold text-xs leading-tight">{activeVideo.title}</span>
                            <span className="text-gray-500 text-[10px] font-mono">{activeVideo.duration}</span>
                        </div>
                        
                        {mode === 'launcher' ? (
                            <button 
                                onClick={(e) => { e.stopPropagation(); setMode('embed'); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-bold text-gray-400 hover:text-white transition-all"
                            >
                                <MonitorPlay size={12} />
                                Встроить (Тест)
                            </button>
                        ) : (
                             <button 
                                onClick={() => setMode('launcher')}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-[10px] font-bold text-red-400 transition-all"
                            >
                                <ExternalLink size={12} />
                                Вернуть обложку
                            </button>
                        )}
                    </div>
                </div>

                {/* 4. EMERGENCY BUTTON (ALWAYS VISIBLE IN EMBED MODE) */}
                {/* Если YouTube блокирует видео (Ошибка 153), пользователь увидит эту кнопку и сможет открыть видео. */}
                {mode === 'embed' && (
                    <div className="w-full flex flex-col gap-2 animate-fade-in">
                        <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                            <AlertTriangle size={18} className="text-red-500 shrink-0" />
                            <p className="text-[10px] text-red-200 leading-tight">
                                <span className="font-bold text-red-400">Внимание:</span> Если видео черное или показывает ошибку 153 — это блокировка YouTube. Мы не можем её обойти.
                            </p>
                        </div>
                        <button 
                            onClick={handleOpenExternal}
                            className="w-full py-3 bg-white text-black font-bold rounded-xl uppercase tracking-widest text-xs hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 shadow-lg"
                        >
                            <Play size={14} fill="black" />
                            Смотреть в приложении YouTube
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