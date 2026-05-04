import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Fallback for tests if using the dedicated test project variables
const finalUrl = supabaseUrl || process.env.SUPABASE_TEST_URL || '';
const finalKey = supabaseAnonKey || process.env.SUPABASE_TEST_ANON_KEY || '';

export class SupabaseConfigError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'SupabaseConfigError';
	}
}

if (!finalUrl || !finalKey) {
	throw new SupabaseConfigError(
		[
			'[Supabase] Missing Supabase configuration.',
			'Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY for app runtime,',
			'or SUPABASE_TEST_URL and SUPABASE_TEST_ANON_KEY for integration/e2e test runtime.',
		].join(' '),
	);
}

export const supabase = createClient(finalUrl, finalKey, {
	auth: {
		storage: AsyncStorage,
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: false,
	},
});
