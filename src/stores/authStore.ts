import { create } from 'zustand';
import type { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import { authService } from '@/src/services/authService';

interface AuthState {
	user: User | null;
	session: Session | null;
	loading: boolean;
	isAuthenticated: boolean;
	// Actions
	initialize: () => Promise<void>;
	login: (email: string, password: string) => Promise<void>;
	register: (email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
	user: null,
	session: null,
	loading: true,
	isAuthenticated: false,

	initialize: async () => {
		try {
			const session = await authService.getSession();
			set({
				session,
				user: session?.user ?? null,
				isAuthenticated: !!session,
				loading: false,
			});

			// Listen for auth state changes (token refresh, sign out, session expiry)
			authService.onAuthStateChange(
				async (event: AuthChangeEvent, session: Session | null) => {
					if (
						event === 'TOKEN_REFRESHED' ||
						event === 'SIGNED_IN' ||
						event === 'INITIAL_SESSION'
					) {
						set({ session, user: session?.user ?? null, isAuthenticated: !!session });
					} else if (event === 'SIGNED_OUT') {
						set({ session: null, user: null, isAuthenticated: false });
					} else if (!session) {
						// Session expired or refresh failed — force logout
						await get().logout();
					}
				},
			);
		} catch {
			set({ loading: false });
		}
	},

	login: async (email, password) => {
		set({ loading: true });
		try {
			const data = await authService.signIn(email, password);
			set({ session: data.session, user: data.user, isAuthenticated: true });
		} finally {
			set({ loading: false });
		}
	},

	register: async (email, password) => {
		set({ loading: true });
		try {
			const data = await authService.signUp(email, password);
			set({ session: data.session, user: data.user, isAuthenticated: !!data.session });
		} finally {
			set({ loading: false });
		}
	},

	logout: async () => {
		try {
			await authService.signOut();
		} catch {
			// Ignore sign-out errors — clear local state regardless
		}
		set({ user: null, session: null, isAuthenticated: false });
	},
}));
