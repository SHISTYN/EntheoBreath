import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User as UserIcon, Settings, Cloud, Shield } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

import { liquidVariants } from '../../config/animations';

interface UserMenuProps {
    user: any;
    loading: boolean;
    signIn: () => void;
    signOut: () => void;
    setShowPrivacy: (show: boolean) => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ user, signOut, setShowPrivacy }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (!user) return null;

    const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Пользователь';
    const photoURL = user.user_metadata?.avatar_url;

    return (
        <div className="relative">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="relative w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden border-2 border-white/10 hover:border-cyan-500/50 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/30 z-20"
            >
                {photoURL ? (
                    <img src={photoURL} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white">
                        <UserIcon size={18} />
                    </div>
                )}
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop - lighter touch for desktop dropdowns */}
                        <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

                        {/* Menu */}
                        <motion.div
                            variants={liquidVariants.menu}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="absolute right-0 top-full mt-3 w-64 bg-[#1c1c1e]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden z-20 py-2 origin-top-right ring-1 ring-white/5"
                        >
                            {/* Header */}
                            <div className="px-4 py-3 border-b border-white/5 bg-white/5">
                                <p className="text-sm font-bold text-white truncate font-display tracking-wide">
                                    {displayName}
                                </p>
                                <p className="text-xs text-zinc-400 truncate font-mono opacity-70">
                                    {user.email}
                                </p>
                            </div>

                            {/* Items */}
                            <div className="py-2 space-y-1">
                                <button className="w-full px-4 py-2.5 text-left text-sm text-zinc-300 hover:text-white hover:bg-white/10 flex items-center gap-3 transition-all group">
                                    <Cloud size={16} className="text-cyan-500/70 group-hover:text-cyan-400 transition-colors" />
                                    <span>Синхронизация</span>
                                </button>
                                <button className="w-full px-4 py-2.5 text-left text-sm text-zinc-300 hover:text-white hover:bg-white/10 flex items-center gap-3 transition-all group">
                                    <Settings size={16} className="text-zinc-500 group-hover:text-white transition-colors" />
                                    <span>Настройки</span>
                                </button>
                                <button
                                    onClick={() => { setShowPrivacy(true); setIsOpen(false); }}
                                    className="w-full px-4 py-2.5 text-left text-sm text-zinc-300 hover:text-white hover:bg-white/10 flex items-center gap-3 transition-all group"
                                >
                                    <Shield size={16} className="text-zinc-500 group-hover:text-white transition-colors" />
                                    <span>Приватность</span>
                                </button>
                            </div>

                            <div className="border-t border-white/5 my-1" />

                            <div className="py-1">
                                <button
                                    onClick={() => { signOut(); setIsOpen(false); }}
                                    className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-3 transition-colors"
                                >
                                    <LogOut size={16} />
                                    <span>Выйти</span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
