import posthog from 'posthog-js';

const posthogKey = import.meta.env.VITE_POSTHOG_KEY;
const posthogHost = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';

export const isAnalyticsEnabled = !!posthogKey;

if (isAnalyticsEnabled) {
    posthog.init(posthogKey, {
        api_host: posthogHost,
        // Disable in development if needed, but useful for testing
        // loaded: (ph) => { if (import.meta.env.DEV) ph.opt_out_capturing(); }
        autocapture: false, // We want manual control for privacy/cleanliness
        capture_pageview: false // We handle SPA pageviews manually
    });
}

export { posthog };
