import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../config/supabase';
import { useAnalytics } from '../hooks/useAnalytics';

// --- TYPES ---
export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt?: string;
}

export interface GamificationState {
    xp: number;
    level: number;
    streak: number;
    lastPracticeDate: string | null;
    totalSessions: number;
    totalMinutes: number;
    achievements: Achievement[];
    techniqueStats: Record<string, number>;
}

interface GamificationContextType extends GamificationState {
    xpProgress: { current: number; needed: number; percentage: number };
    newAchievement: Achievement | null;
    levelUp: number | null;
    clearNewAchievement: () => void;
    clearLevelUp: () => void;
    recordSession: (patternId: string, durationSeconds: number) => void;
    awardXP: (amount: number) => void;
    isLoading: boolean;
}

// --- CONSTANTS ---
const STORAGE_KEY = 'entheo_gamification';

const XP_FOR_LEVEL = (level: number): number => {
    if (level <= 1) return 0;
    return Math.floor(100 * Math.pow(1.15, level - 1));
};

const getLevelFromXP = (xp: number): number => {
    let level = 1;
    let totalXPNeeded = 0;
    while (totalXPNeeded + XP_FOR_LEVEL(level + 1) <= xp) {
        level++;
        totalXPNeeded += XP_FOR_LEVEL(level);
    }
    return Math.min(level, 50);
};

export const ACHIEVEMENTS_LIST: Omit<Achievement, 'unlockedAt'>[] = [
    { id: 'first-breath', name: 'Первый вдох', description: 'Завершить первую сессию', icon: '🌱' },
    { id: 'on-fire-7', name: 'В огне', description: '7 дней streak', icon: '🔥' },
    { id: 'lightning-30', name: 'Молния', description: '30 дней streak', icon: '⚡' },
    { id: 'ice-master', name: 'Ледяной мастер', description: '10 сессий Wim Hof', icon: '🧊' },
    { id: 'sniper', name: 'Снайпер', description: '50 сессий Box Breathing', icon: '🎯' },
    { id: 'yogi', name: 'Йог', description: 'Попробовать все пранаямы', icon: '🧘' },
    { id: 'collector', name: 'Коллекционер', description: '20+ техник в избранном', icon: '💎' },
    { id: 'marathon', name: 'Марафонец', description: '60+ минут за одну сессию', icon: '⏱️' },
    { id: 'night-owl', name: 'Ночная Сова', description: 'Практика после 23:00', icon: '🌙' },
    { id: 'early-bird', name: 'Ранняя Пташка', description: 'Практика до 6:00', icon: '🌅' },
    { id: 'century', name: 'Сотня', description: '100 сессий всего', icon: '💯' },
    { id: 'legend', name: 'Легенда', description: 'Достичь 25 уровня', icon: '🏆' },
    { id: 'master', name: 'Мастер', description: 'Достичь 50 уровня', icon: '👑' },
    { id: 'rainbow', name: 'Радужный', description: 'Пройти все категории', icon: '🌈' },
    { id: 'infinity', name: 'Бесконечность', description: '365 дней streak', icon: '∞' },
];

const initialState: GamificationState = {
    xp: 0,
    level: 1,
    streak: 0,
    lastPracticeDate: null,
    totalSessions: 0,
    totalMinutes: 0,
    achievements: [],
    techniqueStats: {},
};

const GamificationContext = createContext<GamificationContextType | null>(null);

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { track, identify } = useAnalytics();

    const [state, setState] = useState<GamificationState>(initialState);
    const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
    const [levelUp, setLevelUp] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // 1. Initial Load (Local)
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                setState(prev => ({ ...prev, ...parsed }));
            }
        } catch (e) {
            console.error('Failed to load local gamification', e);
        }
        setIsLoading(false);
    }, []);

    // 2. Identify Analytics
    useEffect(() => {
        if (user) {
            identify(user.id);
        }
    }, [user, identify]);

    // 3. Cloud Sync (Merge)
    // 3. Cloud Sync (Merge)
    useEffect(() => {
        if (!user || !supabase) return;
        const client = supabase;

        const syncProfile = async () => {
            const { data: remoteProfile, error } = await client
                .from('profiles')
                .select('xp, level, streak, total_sessions')
                .eq('id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                // console.error("Sync fetch error", error);
                return;
            }

            if (remoteProfile) {
                if (remoteProfile.xp > state.xp) {
                    // console.log("☁️ Cloud has more progress. Syncing down.");
                    const newState = {
                        ...state,
                        xp: remoteProfile.xp,
                        level: remoteProfile.level,
                        streak: remoteProfile.streak,
                        totalSessions: remoteProfile.total_sessions
                    };
                    setState(newState);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
                } else if (state.xp > remoteProfile.xp) {
                    // console.log("☁️ Local has more progress. Pushing up.");
                    await client.from('profiles').update({
                        xp: state.xp,
                        level: state.level,
                        streak: state.streak,
                        total_sessions: state.totalSessions,
                        updated_at: new Date().toISOString()
                    }).eq('id', user.id);
                }
            } else {
                const { error: insertError } = await client.from('profiles').insert({
                    id: user.id,
                    email: user.email,
                    xp: state.xp,
                    level: state.level,
                    streak: state.streak,
                    total_sessions: state.totalSessions,
                    updated_at: new Date().toISOString()
                });
                if (insertError) console.error("Profile creation error", insertError);
            }
        };

        syncProfile();
    }, [user]);

    const saveState = useCallback(async (newState: GamificationState) => {
        setState(newState);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));

        if (user && supabase) {
            const client = supabase;
            const { error } = await client.from('profiles').update({
                xp: newState.xp,
                level: newState.level,
                streak: newState.streak,
                total_sessions: newState.totalSessions,
                updated_at: new Date().toISOString()
            }).eq('id', user.id);
            if (error) console.error("Cloud push error", error);
        }
    }, [user]);

    const unlockAchievement = useCallback((id: string) => {
        setState(prev => {
            if (prev.achievements.some(a => a.id === id)) return prev;

            const achievementDef = ACHIEVEMENTS_LIST.find(a => a.id === id);
            if (!achievementDef) return prev;

            const newAch: Achievement = {
                ...achievementDef,
                unlockedAt: new Date().toISOString(),
            };

            // Analytics
            track('achievement_unlocked', { achievement_id: id, achievement_name: newAch.name });

            setNewAchievement(newAch);

            const newState = {
                ...prev,
                achievements: [...prev.achievements, newAch],
            };

            if (user && supabase) {
                const client = supabase;
                client.from('user_achievements').insert({
                    user_id: user.id,
                    achievement_id: id,
                    unlocked_at: newAch.unlockedAt
                }).then(({ error }) => {
                    if (error) console.error("Achievement sync error", error);
                });
            }

            localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
            return newState;
        });
    }, [user, track]);

    const awardXP = useCallback((amount: number) => {
        setState(prev => {
            const streakBonus = prev.streak >= 30 ? 1.5 : prev.streak >= 7 ? 1.25 : 1;
            const finalXP = Math.floor(amount * streakBonus);
            const newXP = prev.xp + finalXP;
            const newLevel = getLevelFromXP(newXP);

            if (newLevel > prev.level) {
                setLevelUp(newLevel);
                if (newLevel >= 25) unlockAchievement('legend');
                if (newLevel >= 50) unlockAchievement('master');
            }

            const newState = { ...prev, xp: newXP, level: newLevel };
            saveState(newState);
            return newState;
        });
    }, [unlockAchievement, saveState]);

    const recordSession = useCallback((patternId: string, durationSeconds: number) => {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const hour = now.getHours();
        const minutes = Math.floor(durationSeconds / 60);

        // Analytics
        track('session_completed', {
            pattern_id: patternId,
            duration_seconds: durationSeconds,
            minutes: minutes
        });

        setState(prev => {
            let newStreak = prev.streak;
            if (prev.lastPracticeDate) {
                const lastDate = new Date(prev.lastPracticeDate);
                const yesterday = new Date(now);
                yesterday.setDate(yesterday.getDate() - 1);

                if (prev.lastPracticeDate === today) {
                } else if (lastDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
                    newStreak = prev.streak + 1;
                } else {
                    newStreak = 1;
                }
            } else {
                newStreak = 1;
            }

            const newTechniqueStats = { ...prev.techniqueStats };
            newTechniqueStats[patternId] = (newTechniqueStats[patternId] || 0) + 1;

            const newState: GamificationState = {
                ...prev,
                streak: newStreak,
                lastPracticeDate: today,
                totalSessions: prev.totalSessions + 1,
                totalMinutes: prev.totalMinutes + minutes,
                techniqueStats: newTechniqueStats,
            };

            if (user && supabase) {
                const client = supabase;
                client.from('sessions').insert({
                    user_id: user.id,
                    pattern_id: patternId,
                    duration_seconds: durationSeconds,
                    completed_at: now.toISOString()
                }).then(r => { if (r.error) console.error(r.error) });
            }

            saveState(newState);
            return newState;
        });

        const baseXP = minutes * 10 + 50;
        awardXP(baseXP);

        // Check achievements (moved from setState to here to avoid side effects inside setState, but state ref might be old.
        // Actually, calling it inside setState callback is safer for state consistency, but setState function shouldn't trigger other setStates if possible.
        // However, `awardXP` triggers `saveState` which triggers `setState`.
        // Let's keep the logic simpler: check achievements based on `prev` inside recordSession/awardXP pipeline.

        // Re-implementing achievement checks:
        setState(prev => {
            // First session
            if (prev.totalSessions === 1) unlockAchievement('first-breath');

            // Streak achievements
            if (prev.streak >= 7) unlockAchievement('on-fire-7');
            if (prev.streak >= 30) unlockAchievement('lightning-30');
            if (prev.streak >= 365) unlockAchievement('infinity');

            // Session count
            if (prev.totalSessions >= 100) unlockAchievement('century');

            // Marathon
            if (minutes >= 60) unlockAchievement('marathon');

            // Time-based
            if (hour >= 23 || hour < 4) unlockAchievement('night-owl');
            if (hour >= 4 && hour < 6) unlockAchievement('early-bird');

            // Technique-specific
            if ((prev.techniqueStats['wim-hof'] || 0) >= 10) unlockAchievement('ice-master');
            if ((prev.techniqueStats['box-breathing'] || 0) >= 50) unlockAchievement('sniper');

            return prev;
        });

    }, [awardXP, user, saveState, unlockAchievement, track]);

    const clearNewAchievement = useCallback(() => setNewAchievement(null), []);
    const clearLevelUp = useCallback(() => setLevelUp(null), []);

    const xpProgress = useMemo(() => {
        const currentLevelXP = XP_FOR_LEVEL(state.level);
        const nextLevelXP = XP_FOR_LEVEL(state.level + 1);
        const diff = nextLevelXP - currentLevelXP;
        return {
            current: state.xp - currentLevelXP,
            needed: diff,
            percentage: Math.min(100, ((state.xp - currentLevelXP) / diff) * 100),
        };
    }, [state.xp, state.level]);

    return (
        <GamificationContext.Provider value={{
            ...state,
            xpProgress,
            newAchievement,
            levelUp,
            clearNewAchievement,
            clearLevelUp,
            recordSession,
            awardXP,
            isLoading
        }}>
            {children}
        </GamificationContext.Provider>
    );
};

export const useGamification = () => {
    const context = useContext(GamificationContext);
    if (!context) throw new Error('useGamification must be used within GamificationProvider');
    return context;
};
