import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
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

export const useAuthStore = create<AuthState>((set) => ({
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

			// Listen for auth state changes
			authService.onAuthStateChange(async (_event, session) => {
				set({
					session,
					user: session?.user ?? null,
					isAuthenticated: !!session,
				});
			});
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
			await authService.signUp(email, password);
		} finally {
			set({ loading: false });
		}
	},

	logout: async () => {
		await authService.signOut();
		set({ user: null, session: null, isAuthenticated: false });
	},
}));
