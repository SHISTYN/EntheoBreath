import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileText, ArrowLeft } from 'lucide-react';

interface PrivacyPolicyProps {
    onBack?: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-black text-zinc-300 p-6 md:p-12 font-sans">
            <div className="max-w-3xl mx-auto">
                <motion.button
                    whileHover={{ x: -4 }}
                    onClick={onBack}
                    className="flex items-center gap-2 text-zinc-500 hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span>Назад</span>
                </motion.button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-12"
                >
                    {/* Header */}
                    <div className="border-b border-white/10 pb-8">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center mb-6 border border-white/10">
                            <Shield size={32} className="text-cyan-400" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
                            Политика Конфиденциальности
                        </h1>
                        <p className="text-zinc-500">Последнее обновление: 30 Января 2026</p>
                    </div>

                    {/* Content */}
                    <div className="space-y-8 leading-relaxed">
                        <Section title="1. Введение" icon={<FileText size={20} />}>
                            <p>
                                EntheoBreath ("мы", "наш") уважает вашу приватность. Мы строим сервис, основанный на доверии и осознанности.
                                Эта политика описывает, как мы обрабатываем ваши данные.
                            </p>
                        </Section>

                        <Section title="2. Какие данные мы собираем" icon={<Eye size={20} />}>
                            <ul className="list-disc pl-5 space-y-2 marker:text-cyan-500">
                                <li><strong>Аккаунт (Supabase):</strong> Email и имя (если вы входите через Google).</li>
                                <li><strong>Прогресс:</strong> История дыхательных сессий, уровень, достижения (хранится в защищенной базе данных).</li>
                                <li><strong>Аналитика (Twilio Segment / PostHog):</strong> Анонимные данные об использовании (какие техники популярны), чтобы улучшать продукт. Мы не передаем эти данные третьим лицам.</li>
                            </ul>
                        </Section>

                        <Section title="3. Безопасность (Security)" icon={<Lock size={20} />}>
                            <p>
                                Мы используем шифрование SSL/TLS для всех передаваемых данных. Пароли не хранятся в открытом виде (используется Supabase Auth).
                                Ваши данные о дыхании принадлежат вам.
                            </p>
                        </Section>

                        <Section title="4. Ваши права" icon={<Shield size={20} />}>
                            <p>
                                Вы имеете право в любой момент запросить удаление своего аккаунта и всех связанных данных.
                                Для этого напишите нам или используйте кнопку "Удалить аккаунт" в настройках.
                            </p>
                        </Section>

                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 mt-8">
                            <h4 className="text-white font-bold mb-2">Медицинский Дисклеймер</h4>
                            <p className="text-sm text-zinc-400">
                                EntheoBreath не является медицинским устройством. Дыхательные практики (особенно Задержки дыхания и Вим Хоф)
                                имеют противопоказания. Проконсультируйтесь с врачом перед началом. Используйте на свой страх и риск.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="group">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3 group-hover:text-cyan-400 transition-colors">
            {icon}
            {title}
        </h3>
        <div className="text-zinc-400">
            {children}
        </div>
    </div>
);
