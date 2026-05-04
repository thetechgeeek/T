import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

type SupabaseConfigEnv = Record<string, string | undefined>;

export class SupabaseConfigError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'SupabaseConfigError';
	}
}

export interface SupabaseRuntimeConfig {
	url: string;
	anonKey: string;
}

export function validateSupabaseConfig(
	env: SupabaseConfigEnv = process.env,
): SupabaseRuntimeConfig {
	const supabaseUrl = env.EXPO_PUBLIC_SUPABASE_URL ?? '';
	const supabaseAnonKey = env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
	const testUrl = env.SUPABASE_TEST_URL ?? '';
	const testAnonKey = env.SUPABASE_TEST_ANON_KEY ?? '';

	const url = supabaseUrl || testUrl;
	const anonKey = supabaseAnonKey || testAnonKey;

	if (!url || !anonKey) {
		throw new SupabaseConfigError(
			[
				'[Supabase] Missing Supabase configuration.',
				'Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY for app runtime,',
				'or SUPABASE_TEST_URL and SUPABASE_TEST_ANON_KEY for integration/e2e test runtime.',
			].join(' '),
		);
	}

	return { url, anonKey };
}

const supabaseConfig = validateSupabaseConfig();

export const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
	auth: {
		storage: AsyncStorage,
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: false,
	},
});
