import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { authService } from '@/src/services/authService';
import { getErrorMessage } from '@/src/errors/AppError';
import { stopAuthSessionSubscription } from '@/src/orchestrators/authSessionSubscription';

interface AuthState {
	user: User | null;
	session: Session | null;
	loading: boolean;
	isAuthenticated: boolean;
	error: string | null;
	// Actions
	initialize: () => Promise<void>;
	login: (email: string, password: string) => Promise<void>;
	register: (email: string, password: string) => Promise<void>;
	/** Send SMS OTP to phone (E.164 format: +91XXXXXXXXXX) */
	sendOtp: (phone: string) => Promise<void>;
	/** Verify 6-digit OTP. Returns true and sets session on success. */
	verifyOtp: (phone: string, token: string) => Promise<void>;
	logout: () => Promise<void>;
	reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
	user: null,
	session: null,
	loading: true,
	isAuthenticated: false,
	error: null,

	initialize: async () => {
		try {
			const session = await authService.getSession();
			set({
				session,
				user: session?.user ?? null,
				isAuthenticated: !!session,
				loading: false,
				error: null,
			});
		} catch (error: unknown) {
			const message = getErrorMessage(error);
			set({ loading: false, error: message });
		}
	},

	login: async (email, password) => {
		set({ loading: true, error: null });
		try {
			const data = await authService.signIn(email, password);
			set({ session: data.session, user: data.user, isAuthenticated: true });
		} catch (error: unknown) {
			set({ error: getErrorMessage(error) });
			throw error;
		} finally {
			set({ loading: false });
		}
	},

	register: async (email, password) => {
		set({ loading: true, error: null });
		try {
			const data = await authService.signUp(email, password);
			set({ session: data.session, user: data.user, isAuthenticated: !!data.session });
		} catch (error: unknown) {
			set({ error: getErrorMessage(error) });
			throw error;
		} finally {
			set({ loading: false });
		}
	},

	sendOtp: async (phone: string) => {
		set({ loading: true, error: null });
		try {
			await authService.sendOtp(phone);
		} catch (error: unknown) {
			set({ error: getErrorMessage(error) });
			throw error;
		} finally {
			set({ loading: false });
		}
	},

	verifyOtp: async (phone: string, token: string) => {
		set({ loading: true, error: null });
		try {
			const data = await authService.verifyOtp(phone, token);
			if (data?.session) {
				set({ session: data.session, user: data.session.user, isAuthenticated: true });
			}
		} catch (error: unknown) {
			set({ error: getErrorMessage(error) });
			throw error;
		} finally {
			set({ loading: false });
		}
	},

	logout: async () => {
		stopAuthSessionSubscription();
		try {
			await authService.signOut();
		} catch (error: unknown) {
			set({ error: getErrorMessage(error) });
		}
		set({ user: null, session: null, isAuthenticated: false, loading: false });
	},

	reset: () => {
		set({
			user: null,
			session: null,
			loading: false,
			isAuthenticated: false,
			error: null,
		});
	},
}));
