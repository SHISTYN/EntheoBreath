export const notificationService = {
    isSupported: (): boolean => {
        return 'Notification' in window && 'serviceWorker' in navigator;
    },

    getPermission: (): NotificationPermission => {
        if (!('Notification' in window)) return 'denied';
        return Notification.permission;
    },

    requestPermission: async (): Promise<boolean> => {
        if (!('Notification' in window)) return false;

        try {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        } catch (error) {
            console.error('Notification permission error:', error);
            return false;
        }
    },

    scheduleTestNotification: async () => {
        if (Notification.permission !== 'granted') return;

        // In a real PWA with VAPID, we'd subscribe here.
        // For local testing/MVP:
        const registration = await navigator.serviceWorker.ready;

        try {
            await registration.showNotification('EntheoBreath', {
                body: 'Тестовое напоминание: Время дышать! 🌬️',
                icon: '/pwa-192x192.png',
                vibrate: [200, 100, 200],
                tag: 'test-notification'
            });
        } catch (e) {
            console.log("Local notification failed (likely needs PWA install on mobile):", e);
        }
    },

    // Logic to deciding WHEN to ask (e.g. not on first visit)
    shouldAskForPermission: (): boolean => {
        if (Notification.permission === 'granted' || Notification.permission === 'denied') return false;

        const visitCount = parseInt(localStorage.getItem('entheo_visit_count') || '0');
        const hasFinishedSession = localStorage.getItem('entheo_has_finished_session') === 'true';

        // Ask if visited at least twice OR finished a session
        return visitCount >= 2 || hasFinishedSession;
    },

    // 🧠 SMART LOGIC (Frontend Only MVP)
    checkReminders: async (hasSessionToday: boolean) => {
        if (Notification.permission !== 'granted') return;

        const now = new Date();
        const hour = now.getHours();
        const lastNotif = localStorage.getItem('entheo_last_notification_date');
        const todayStr = now.toDateString();

        // Don't spam: 1 notification per type per day
        if (lastNotif === todayStr) return;

        const registration = await navigator.serviceWorker.ready;

        // 1. Morning Glory (06:00 - 10:00)
        if (hour >= 6 && hour < 10 && !hasSessionToday) {
            try {
                await registration.showNotification('Утреннее Дыхание 🌅', {
                    body: 'Лучшее время зарядить мозг кислородом. Займет 3 минуты.',
                    icon: '/pwa-192x192.png',
                    tag: 'morning-glory',
                    vibrate: [200]
                });
                localStorage.setItem('entheo_last_notification_date', todayStr);
            } catch (e) { console.warn('Notif failed', e); }
        }

        // 2. Streak Saviour (20:00 - 23:00)
        if (hour >= 20 && hour < 23 && !hasSessionToday) {
            try {
                await registration.showNotification('Спаси свой Стрик! 🔥', {
                    body: 'Ты еще не дышал сегодня. Осталось совсем немного времени.',
                    icon: '/pwa-192x192.png',
                    tag: 'streak-saviour',
                    vibrate: [200, 200]
                });
                localStorage.setItem('entheo_last_notification_date', todayStr);
            } catch (e) { console.warn('Notif failed', e); }
        }
    }
};
