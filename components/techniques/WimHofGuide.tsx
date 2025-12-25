import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Copy, Check, AlertTriangle, Bug } from 'lucide-react';

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
    const [videoError, setVideoError] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showDebug, setShowDebug] = useState(false);
    const [origin, setOrigin] = useState('');

    useEffect(() => {
        // Safe access to window location for the Origin parameter
        if (typeof window !== 'undefined') {
            setOrigin(window.location.origin);
        }
    }, []);

    const activeVideo = VIDEO_DATA[lang];

    const handleVideoError = () => {
        setVideoError(true);
    };

    const handleCopyReport = async () => {
        const report = `EntheoBreath Video Report:
Video ID: ${activeVideo.id} (${lang})
Status: ${videoError ? 'Load Error' : 'Manual Report'}
User Agent: ${navigator.userAgent}
Time: ${new Date().toISOString()}
Location: ${window.location.href}`;

        try {
            await navigator.clipboard.writeText(report);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
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
                            onClick={() => { setLang(key); setVideoError(false); }}
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
                    <div className="relative z-10 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black aspect-video flex flex-col">
                        {!videoError ? (
                            <iframe 
                                key={activeVideo.id}
                                width="100%" 
                                height="100%" 
                                // REVERTED TO STANDARD DOMAIN + ADDED ORIGIN
                                src={`https://www.youtube.com/embed/${activeVideo.id}?rel=0&autoplay=0&playsinline=1&origin=${origin}`} 
                                title={activeVideo.title} 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                allowFullScreen
                                onError={handleVideoError}
                                className="w-full h-full object-cover"
                            ></iframe>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-zinc-900">
                                <AlertTriangle className="text-amber-500 w-12 h-12 mb-4 animate-pulse" />
                                <h3 className="text-white font-bold text-lg mb-2">Видео недоступно</h3>
                                <p className="text-gray-400 text-xs mb-6 max-w-[250px]">
                                    Возможно, оно заблокировано в вашем регионе или браузером.
                                </p>
                                <a 
                                    href={`https://www.youtube.com/watch?v=${activeVideo.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center gap-2 transition-all"
                                >
                                    <ExternalLink size={16} /> Смотреть на YouTube
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. FALLBACK ACTIONS (Always Visible) */}
                <div className="flex items-center justify-between px-2 gap-3">
                    <a 
                        href={`https://www.youtube.com/watch?v=${activeVideo.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:text-red-500 transition-colors"
                    >
                        <ExternalLink size={12} />
                        Смотреть на YouTube
                    </a>

                    <button
                        onClick={() => setShowDebug(!showDebug)}
                        className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${showDebug ? 'text-amber-500' : 'text-gray-500 hover:text-white'}`}
                    >
                        <Bug size={12} />
                        Сообщить о баге
                    </button>
                </div>

                {/* DEBUG PANEL (Toggleable) */}
                <AnimatePresence>
                    {(showDebug || videoError) && (
                        <MotionDiv
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mt-2">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-white mb-1">Диагностика</span>
                                        <span className="text-[10px] text-gray-500">Скопируйте этот отчет и отправьте разработчику.</span>
                                    </div>
                                    <button 
                                        onClick={handleCopyReport}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                                            copied 
                                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                                            : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border-white/10'
                                        }`}
                                    >
                                        {copied ? <Check size={12} /> : <Copy size={12} />}
                                        {copied ? 'Скопировано' : 'Копировать'}
                                    </button>
                                </div>
                                <code className="block p-3 bg-black/50 rounded-lg text-[10px] text-gray-400 font-mono break-all whitespace-pre-wrap border border-white/5">
                                    ID: {activeVideo.id} | Lang: {lang}<br/>
                                    UA: {navigator.userAgent.slice(0, 50)}...
                                </code>
                            </div>
                        </MotionDiv>
                    )}
                </AnimatePresence>

                {/* 5. PRINCIPLES & START CTA */}
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