import { dev } from '$app/environment';
import { injectAnalytics } from '@vercel/analytics/sveltekit';

// Only inject analytics on Vercel (not on Tor/.onion deployments)
if (typeof window !== 'undefined' && !window.location.hostname.endsWith('.onion')) {
	injectAnalytics({ mode: dev ? 'development' : 'production' });
}