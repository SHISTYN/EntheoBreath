import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, PlusSquare, Monitor, X, Smartphone, Download, ArrowDown, ExternalLink } from 'lucide-react';
import { liquidVariants } from '../../config/animations';

type OS = 'ios' | 'android' | 'mac' | 'windows' | 'unknown';

interface InstallGuideProps {
    isOpen: boolean;
    onClose: () => void;
}

export const InstallGuide: React.FC<InstallGuideProps> = ({ isOpen, onClose }) => {
    const [os, setOs] = useState<OS>('unknown');
    const [activeTab, setActiveTab] = useState<OS>('ios');

    useEffect(() => {
        const agent = window.navigator.userAgent.toLowerCase();
        if (/iphone|ipad|ipod/.test(agent)) {
            setOs('ios');
            setActiveTab('ios');
        } else if (/android/.test(agent)) {
            setOs('android');
            setActiveTab('android');
        } else if (/mac/.test(agent)) {
            setOs('mac');
            setActiveTab('mac');
        } else if (/win/.test(agent)) {
            setOs('windows');
            setActiveTab('windows');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const tabs = [
        { id: 'ios', label: 'iOS', icon: Smartphone },
        { id: 'android', label: 'Android', icon: Smartphone },
        { id: 'mac', label: 'Desktop', icon: Monitor },
    ] as const;

    return (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4 md:p-6 sm:p-0">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-md transition-all"
            />

            {/* Modal */}
            <motion.div
                variants={liquidVariants.modal}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="
                    relative w-full max-w-lg 
                    bg-[#1c1c1e]/90 backdrop-blur-2xl 
                    rounded-t-[32px] md:rounded-[32px] 
                    border border-white/10 
                    shadow-[0_0_80px_-20px_rgba(0,0,0,0.7)]
                    overflow-hidden
                    flex flex-col
                    max-h-[85vh]
                "
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between shrink-0 bg-gradient-to-b from-white/5 to-transparent">
                    <div>
                        <h2 className="text-xl font-display font-bold text-white tracking-wide">
                            Установить App
                        </h2>
                        <p className="text-xs text-zinc-400 font-medium">Native Experience</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="px-2 pt-2 flex gap-1 shrink-0 bg-black/20">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as OS)}
                            className={`
                                flex-1 py-2.5 rounded-t-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all relative overflow-hidden
                                ${activeTab === tab.id
                                    ? 'text-white'
                                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}
                            `}
                        >
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-[#2c2c2e] border-t border-x border-white/10 rounded-t-xl"
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-2">
                                <tab.icon size={14} />
                                {tab.label}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="bg-[#2c2c2e] flex-1 p-6 md:p-8 relative overflow-y-auto">
                    <AnimatePresence mode="wait">
                        {activeTab === 'ios' && (
                            <motion.div
                                key="ios"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-6"
                            >
                                <div className="space-y-4">
                                    <Step
                                        num={1}
                                        text='Нажмите кнопку "Поделиться" внизу вашего браузера'
                                        icon={<Share2 className="text-blue-400" size={24} />}
                                    />
                                    <Step
                                        num={2}
                                        text='Прокрутите список вниз и выберите "На экран «Домой»"'
                                        icon={<PlusSquare className="text-white" size={24} />}
                                    />
                                    <Step
                                        num={3}
                                        text='Нажмите "Добавить" в верхнем углу'
                                        icon={<span className="text-blue-400 font-bold text-sm">Add</span>}
                                    />
                                </div>
                                <div className="pt-4 flex justify-center animate-bounce opacity-50">
                                    <ArrowDown size={24} className="text-blue-400" />
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'android' && (
                            <motion.div
                                key="android"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-6"
                            >
                                <div className="p-4 rounded-2xl bg-black/20 border border-white/5 text-center">
                                    <p className="text-sm text-zinc-300 mb-4">На большинстве устройств Android установка происходит автоматически, если нажать кнопку ниже:</p>
                                    <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold text-sm shadow-lg hover:shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2 mx-auto">
                                        <Download size={16} />
                                        Установить сейчас
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest text-center">Или вручную</p>
                                    <Step
                                        num={1}
                                        text='Нажмите на иконку меню (три точки) в браузере'
                                        icon={<span className="text-white font-bold text-lg">⋮</span>}
                                    />
                                    <Step
                                        num={2}
                                        text='Выберите "Установить приложение" или "Добавить на гл. экран"'
                                        icon={<Smartphone className="text-emerald-400" size={24} />}
                                    />
                                </div>
                            </motion.div>
                        )}

                        {(activeTab === 'mac' || activeTab === 'windows') && (
                            <motion.div
                                key="desktop"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-6"
                            >
                                <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-white/10 space-y-3">
                                    <h4 className="font-bold text-white flex items-center gap-2">
                                        <Monitor size={16} className="text-purple-400" />
                                        Mac / Windows
                                    </h4>
                                    <p className="text-sm text-zinc-300 leading-relaxed">
                                        Это приложение работает как нативная программа на вашем компьютере.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <Step
                                        num={1}
                                        text='В браузере Chrome/Edge найдите иконку установки в адресной строке'
                                        icon={<Download className="text-zinc-300" size={20} />}
                                    />
                                    <Step
                                        num={2}
                                        text='Или нажмите "Поделиться" -> "Добавить в Dock"'
                                        icon={<ExternalLink className="text-zinc-300" size={20} />}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

const Step = ({ num, text, icon }: { num: number, text: string, icon: React.ReactNode }) => (
    <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5">
        <div className="w-10 h-10 shrink-0 rounded-full bg-black/40 flex items-center justify-center border border-white/10 shadow-inner">
            {icon}
        </div>
        <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-0.5">Шаг {num}</span>
            <span className="text-sm font-medium text-zinc-200 leading-snug">{text}</span>
        </div>
    </div>
);
