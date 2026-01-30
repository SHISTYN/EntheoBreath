
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Zap, Wrench, Palette, Star, Activity, AudioWaveform } from 'lucide-react';
import AutoChangelog from '../data/changelog-auto.json';

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

    // Helper for rendering icons directly from JSON or fallback
    const renderIcon = (type: any) => {
        // If type is object from auto-json
        if (typeof type === 'object' && type.icon) {
            return <span className="text-base leading-none">{type.icon}</span>;
        }
        // Fallback or legacy logic could go here
        return <span className="text-base leading-none">🔨</span>;
    };

    // The Modal Content
    const content = (
        <AnimatePresence>
            {isOpenManual && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 overflow-hidden">

                    {/* Backdrop */}
                    <MotionDiv
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onCloseManual}
                        className="absolute inset-0 bg-black/60 backdrop-blur-3xl transition-all duration-500"
                    />

                    {/* CARD */}
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
                                    История Развития
                                </h2>
                                <p className="text-white/40 text-xs md:text-sm mt-1 font-medium tracking-wide">
                                    Автоматический лог обновлений (GitHub)
                                </p>
                            </div>

                            <button
                                onClick={onCloseManual}
                                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-white/70 hover:text-white transition-all hover:rotate-90 active:scale-90"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* --- CONTENT SCROLL --- */}
                        <div className="overflow-y-auto custom-scrollbar flex-1 p-6 md:p-8 space-y-12 bg-gradient-to-b from-transparent to-black/40 relative z-0">
                            {AutoChangelog.map((release, idx) => (
                                <div key={release.date} className="relative pl-6 sm:pl-8 group">

                                    {/* Timeline Line */}
                                    {idx !== AutoChangelog.length - 1 && (
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
                                                {release.version}
                                            </span>
                                            {/* Hash/Date Pill */}
                                            <span className="text-[10px] md:text-xs font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider bg-white/10 text-white/80 border border-white/5 font-mono">
                                                {release.date}
                                            </span>
                                        </div>

                                        {/* Changes Card */}
                                        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 md:p-5 hover:bg-white/10 transition-colors duration-300">
                                            <div className="space-y-4">
                                                {release.changes.map((change, cIdx) => (
                                                    <div key={cIdx} className="flex items-start gap-3 text-xs md:text-sm text-gray-300 leading-relaxed group/item">
                                                        <div className="mt-0.5 w-6 h-6 flex items-center justify-center rounded-lg bg-black/40 border border-white/5 shrink-0 group-hover/item:bg-black/60 transition-colors">
                                                            {renderIcon(change.type)}
                                                        </div>
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="opacity-90 group-hover/item:opacity-100 transition-opacity">
                                                                {change.text}
                                                            </span>
                                                            {/* Commit Hash - Stealth Mode */}
                                                            <span className="text-[10px] font-mono text-white/20 group-hover/item:text-cyan-500/50 transition-colors">
                                                                #{change.hash}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
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
