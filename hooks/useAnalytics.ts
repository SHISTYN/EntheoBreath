import { useCallback } from 'react';
import { posthog, isAnalyticsEnabled } from '../config/posthog';

export const useAnalytics = () => {
    const track = useCallback((eventName: string, properties?: Record<string, any>) => {
        if (!isAnalyticsEnabled) {
            // Dev Log
            if (import.meta.env.DEV) {
                console.log(`📊 [Analytics] ${eventName}`, properties);
            }
            return;
        }
        posthog.capture(eventName, properties);
    }, []);

    const identify = useCallback((userId: string, traits?: Record<string, any>) => {
        if (!isAnalyticsEnabled) return;
        posthog.identify(userId, traits);
    }, []);

    const reset = useCallback(() => {
        if (!isAnalyticsEnabled) return;
        posthog.reset();
    }, []);

    return { track, identify, reset };
};
