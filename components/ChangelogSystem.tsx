
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Zap, Wrench, Palette, Star, Activity, AudioWaveform } from 'lucide-react';
import { CHANGELOG } from '../data/changelog';

const MotionDiv = motion.div as any;

interface Props {
    isOpenManual: boolean;
    onCloseManual: () => void;
}

const ChangelogSystem: React.FC<Props> = ({ isOpenManual, onCloseManual }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);
    
    // Close on escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCloseManual();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onCloseManual]);

    const handleSendIdea = () => {
        window.open('https://t.me/nikolaiovchinnikov', '_blank');
    };

    const getFeatureIcon = (type: string) => {
        switch (type) {
            case 'new': return <Zap size={14} className="text-amber-400" />;
            case 'magic': return <Sparkles size={14} className="text-purple-400" />;
            case 'polish': return <Palette size={14} className="text-cyan-400" />;
            case 'fix': return <Wrench size={14} className="text-gray-400" />;
            case 'audio': return <AudioWaveform size={14} className="text-rose-400" />;
            case 'perf': return <Activity size={14} className="text-emerald-400" />;
            default: return <Star size={14} className="text-white/50" />;
        }
    };

    // The Modal Content
    const content = (
        <AnimatePresence>
            {isOpenManual && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 overflow-hidden">
                    
                    {/* Backdrop (Dark Deep Liquid Blur) */}
                    <MotionDiv 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        onClick={onCloseManual}
                        className="absolute inset-0 bg-black/60 backdrop-blur-3xl transition-all duration-500"
                    />
                    
                    {/* LIQUID GLASS CARD */}
                    <MotionDiv 
                        initial={{ scale: 0.9, opacity: 0, y: 40 }} 
                        animate={{ scale: 1, opacity: 1, y: 0 }} 
                        exit={{ scale: 0.9, opacity: 0, y: 40 }}
                        transition={{ type: "spring", stiffness: 350, damping: 28 }}
                        className="
                            relative w-full max-w-2xl 
                            bg-[#0f0f10]/80 backdrop-blur-2xl 
                            rounded-[36px] overflow-hidden flex flex-col 
                            max-h-[85vh] md:max-h-[800px]
                            border border-white/10 
                            shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)]
                            ring-1 ring-white/5
                        "
                    >
                        {/* --- HEADER --- */}
                        <div className="flex items-center justify-between px-6 py-6 md:px-8 shrink-0 bg-gradient-to-b from-white/5 to-transparent border-b border-white/5 relative z-10">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight drop-shadow-md">
                                    История Версий
                                </h2>
                                <p className="text-white/40 text-xs md:text-sm mt-1 font-medium tracking-wide">
                                    Путь развития EntheoBreath
                                </p>
                            </div>
                            
                            {/* Close Button */}
                            <button 
                                onClick={onCloseManual}
                                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-white/70 hover:text-white transition-all hover:rotate-90 active:scale-90"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* --- CONTENT SCROLL --- */}
                        <div className="overflow-y-auto custom-scrollbar flex-1 p-6 md:p-8 space-y-12 bg-gradient-to-b from-transparent to-black/40 relative z-0">
                            {CHANGELOG.map((release, idx) => (
                                <div key={release.version} className="relative pl-6 sm:pl-8 group">
                                    
                                    {/* Timeline Line */}
                                    {idx !== CHANGELOG.length - 1 && (
                                        <div className="absolute left-[7px] top-3 bottom-[-60px] w-[2px] bg-gradient-to-b from-white/10 to-transparent rounded-full" />
                                    )}

                                    {/* Version Dot */}
                                    <div className={`
                                        absolute left-0 top-2 w-4 h-4 rounded-full border-[3px] border-[#121212] shadow-lg z-10
                                        ${idx === 0 ? 'bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'bg-zinc-700'}
                                    `} />

                                    <div className="flex flex-col gap-4">
                                        {/* Version Row */}
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <span className={`text-xl md:text-2xl font-display font-bold tracking-wide ${idx === 0 ? 'text-white' : 'text-white/60'}`}>
                                                v{release.version}
                                            </span>
                                            {/* DATE PILL - CLEAN STYLE */}
                                            <span className="text-[10px] md:text-xs font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider bg-white/10 text-white/80 border border-white/5">
                                                {release.date}
                                            </span>
                                        </div>
                                        
                                        {/* Title & Card */}
                                        <div>
                                            <h3 className={`text-sm md:text-lg font-bold mb-3 ${idx === 0 ? 'text-white' : 'text-white/80'}`}>
                                                {release.title}
                                            </h3>
                                            
                                            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 md:p-5 hover:bg-white/10 transition-colors duration-300">
                                                <div className="space-y-3">
                                                    {release.features.map((feat, fIdx) => (
                                                        <div key={fIdx} className="flex items-start gap-3 text-xs md:text-sm text-gray-300 leading-relaxed group/item">
                                                            <div className="mt-0.5 p-1.5 rounded-lg bg-black/40 border border-white/5 shrink-0 group-hover/item:bg-black/60 transition-colors">
                                                                {getFeatureIcon(feat.type)}
                                                            </div>
                                                            <span className="opacity-80 group-hover/item:opacity-100 transition-opacity pt-0.5">
                                                                {feat.text}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* --- FOOTER ACTION (DARK LIQUID GLASS BUTTON) --- */}
                        <div className="p-6 md:p-8 bg-[#0a0a0b]/80 border-t border-white/5 shrink-0 backdrop-blur-xl relative z-10">
                            <button 
                                onClick={handleSendIdea}
                                className="
                                    w-full py-4 rounded-2xl 
                                    bg-white/5 hover:bg-white/10 
                                    border border-white/10 hover:border-white/20
                                    backdrop-blur-xl
                                    text-white text-xs md:text-sm font-bold uppercase tracking-[0.15em] 
                                    flex items-center justify-center gap-3 
                                    transition-all duration-300
                                    shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]
                                    active:scale-[0.98]
                                "
                            >
                                <Send size={16} className="text-white/90" />
                                <span>ЕСТЬ ИДЕЯ? ПРИСЫЛАЙ В ТГ</span>
                            </button>
                        </div>

                    </MotionDiv>
                </div>
            )}
        </AnimatePresence>
    );

    // RENDER TO BODY (PORTAL)
    return mounted ? createPortal(content, document.body) : null;
};

export default ChangelogSystem;
