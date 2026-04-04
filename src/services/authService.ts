import { supabase } from '@/src/config/supabase';
import { AppError, NetworkError } from '../errors';
import { withRetry } from '../utils/retry';
import logger from '../utils/logger';

function wrapAuthError(error: { message: string; status?: number }, fallback: string): AppError {
	if (error.status === 0 || error.message.toLowerCase().includes('network')) {
		return new NetworkError(error.message, error);
	}
	return new AppError(error.message, 'AUTH_ERROR', fallback, error);
}

export const authService = {
	async signUp(email: string, password: string) {
		const { data, error } = await supabase.auth.signUp({ email, password });
		if (error) throw wrapAuthError(error, 'Registration failed. Please try again.');
		return data;
	},

	async signIn(email: string, password: string) {
		const { data, error } = await supabase.auth.signInWithPassword({ email, password });
		if (error) throw wrapAuthError(error, 'Invalid credentials.');
		return data;
	},

	async signOut() {
		const { error } = await supabase.auth.signOut();
		if (error) throw wrapAuthError(error, 'Sign out failed.');
	},

	async getSession() {
		const { data, error } = await supabase.auth.getSession();
		if (error) throw wrapAuthError(error, 'Could not retrieve session.');
		return data.session;
	},

	/** Explicitly refresh the access token, with exponential back-off on transient failures. */
	async refreshSession() {
		return withRetry(
			async () => {
				const { data, error } = await supabase.auth.refreshSession();
				if (error) {
					logger.error('Token refresh failed', new Error(error.message));
					throw wrapAuthError(error, 'Session refresh failed. Please sign in again.');
				}
				return data.session;
			},
			{
				retries: 3,
				delay: 500,
				// Only retry on network errors; auth errors (expired refresh token) are terminal
				shouldRetry: (e) => e instanceof NetworkError,
			},
		);
	},

	onAuthStateChange(callback: Parameters<typeof supabase.auth.onAuthStateChange>[0]) {
		return supabase.auth.onAuthStateChange(callback);
	},
};
