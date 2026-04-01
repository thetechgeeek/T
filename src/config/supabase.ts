import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Fallback for tests if using the dedicated test project variables
const finalUrl = supabaseUrl || process.env.SUPABASE_TEST_URL || '';
const finalKey = supabaseAnonKey || process.env.SUPABASE_TEST_ANON_KEY || '';

if (!finalUrl || !finalKey) {
	const msg =
		'[Supabase] Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. Set them in your .env file.';
	if (process.env.NODE_ENV === 'test') {
		// Just log a warning in tests to avoid crashing the test suite
		console.warn(msg);
	} else {
		console.warn(msg);
	}
}

// Ensure createClient is only called with non-empty strings to avoid "supabaseUrl is required" error
export const supabase =
	finalUrl && finalKey
		? createClient(finalUrl, finalKey, {
				auth: {
					storage: AsyncStorage,
					autoRefreshToken: true,
					persistSession: true,
					detectSessionInUrl: false,
				},
			})
		: ({} as any); // Type cast to avoid breaking existing service imports
