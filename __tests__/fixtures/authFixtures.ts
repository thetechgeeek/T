import type { User, Session } from '@supabase/supabase-js';

export function makeUser(overrides?: Partial<User>): User {
	return {
		id: 'user-uuid-001',
		email: 'admin@tilemaster.in',
		created_at: '2026-01-01T00:00:00.000Z',
		app_metadata: {},
		user_metadata: {},
		aud: 'authenticated',
		role: 'authenticated',
		...overrides,
	} as User;
}

export function makeSession(overrides?: Partial<Session>): Session {
	return {
		access_token: 'mock-access-token',
		refresh_token: 'mock-refresh-token',
		token_type: 'bearer',
		expires_in: 3600,
		expires_at: Math.floor(Date.now() / 1000) + 3600,
		user: makeUser(),
		...overrides,
	} as Session;
}
