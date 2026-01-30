import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, X, Check } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export const LoginModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const { signInWithEmail } = useAuth();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        const { error } = await signInWithEmail(email);
        if (error) {
            setStatus('error');
            setErrorMsg(error.message);
        } else {
            setStatus('sent');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#1c1c1e] w-full max-w-sm rounded-3xl p-6 relative z-10 border border-white/10 shadow-2xl"
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
                    <X size={20} />
                </button>

                {status === 'sent' ? (
                    <div className="text-center py-8 space-y-4">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-green-400">
                            <Check size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white">Проверьте почту</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            Мы отправили волшебную ссылку на <span className="text-white font-medium">{email}</span>.<br />
                            Нажмите на неё для входа в приложение.
                        </p>
                        <button
                            onClick={onClose}
                            className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold mt-4 transition-colors"
                        >
                            Понятно
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="mb-6">
                            <h2 className="text-2xl font-display font-bold mb-2 text-white">Вход</h2>
                            <p className="text-zinc-400 text-sm">
                                Введите email для синхронизации прогресса. Пароль не нужен.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-cyan-500 transition-colors" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                                    required
                                />
                            </div>

                            {status === 'error' && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
                                    {errorMsg}
                                </div>
                            )}

                            <button
                                disabled={status === 'loading'}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-900/20"
                            >
                                {status === 'loading' ? (
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span>Отправить ссылку</span>
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    </>
                )}
            </motion.div>
        </div>
    );
};
