type RuntimeEnv = Record<string, string | undefined>;

export type AppConfigMode = 'dev' | 'test' | 'integration' | 'e2e' | 'ci' | 'production';

const APP_CONFIG_MODES = new Set<AppConfigMode>([
	'dev',
	'test',
	'integration',
	'e2e',
	'ci',
	'production',
]);

export class RuntimeConfigError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'RuntimeConfigError';
	}
}

export interface SupabaseRuntimeConfig {
	url: string;
	anonKey: string;
}

export interface AppRuntimeConfig {
	mode: AppConfigMode;
	supabase: SupabaseRuntimeConfig;
}

function resolveAppMode(env: RuntimeEnv): AppConfigMode {
	const raw = env.EXPO_PUBLIC_APP_ENV || env.APP_CONFIG_MODE || 'dev';
	if (APP_CONFIG_MODES.has(raw as AppConfigMode)) return raw as AppConfigMode;
	throw new RuntimeConfigError(
		`[Config] Unknown app config mode "${raw}". Expected one of ${Array.from(
			APP_CONFIG_MODES,
		).join(', ')}.`,
	);
}

export function validateSupabaseRuntimeConfig(env: RuntimeEnv): SupabaseRuntimeConfig {
	const url = env.EXPO_PUBLIC_SUPABASE_URL ?? '';
	const anonKey = env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

	if (!url || !anonKey) {
		throw new RuntimeConfigError(
			[
				'[Supabase] Missing Supabase configuration.',
				'Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY for app runtime.',
				'Integration and e2e runners must map SUPABASE_TEST_* into EXPO_PUBLIC_* before app startup.',
			].join(' '),
		);
	}

	return { url, anonKey };
}

export function resolveAppRuntimeConfig(env: RuntimeEnv = process.env): AppRuntimeConfig {
	return {
		mode: resolveAppMode(env),
		supabase: validateSupabaseRuntimeConfig(env),
	};
}
