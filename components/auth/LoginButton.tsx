
import React, { useState } from 'react';
import { LogIn } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { LoginModal } from './LoginModal';
import { AnimatePresence } from 'framer-motion';

export const LoginButton: React.FC = () => {
    const { isConfigured } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!isConfigured) return null;

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_-3px_rgba(34,211,238,0.3)] hover:shadow-[0_0_20px_-3px_rgba(34,211,238,0.5)] active:scale-95"
            >
                <LogIn size={14} />
                <span>Войти</span>
            </button>

            <AnimatePresence>
                {isModalOpen && (
                    <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
                )}
            </AnimatePresence>
        </>
    );
};
