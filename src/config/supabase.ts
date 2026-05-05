import { createClient } from '@supabase/supabase-js';
import {
	RuntimeConfigError,
	resolveAppRuntimeConfig,
	validateSupabaseRuntimeConfig,
	type SupabaseRuntimeConfig,
} from './runtimeConfig';
import { secureSupabaseStorage } from './secureSupabaseStorage';

type SupabaseConfigEnv = Record<string, string | undefined>;

export class SupabaseConfigError extends RuntimeConfigError {}

export function validateSupabaseConfig(
	env: SupabaseConfigEnv = process.env,
): SupabaseRuntimeConfig {
	try {
		return validateSupabaseRuntimeConfig(env);
	} catch (error: unknown) {
		throw new SupabaseConfigError(
			error instanceof Error ? error.message : '[Supabase] Missing Supabase configuration.',
		);
	}
}

const appConfig = resolveAppRuntimeConfig();

export const supabase = createClient(appConfig.supabase.url, appConfig.supabase.anonKey, {
	auth: {
		storage: secureSupabaseStorage,
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: false,
	},
});
