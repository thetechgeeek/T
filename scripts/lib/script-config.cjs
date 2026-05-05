const fs = require('fs');
const path = require('path');

const CONFIG_MODES = new Set(['dev', 'test', 'integration', 'e2e', 'ci', 'production']);

class ScriptConfigError extends Error {
	constructor(message, details = {}) {
		super(message);
		this.name = 'ScriptConfigError';
		this.details = details;
	}
}

function loadEnvFile(filePath, options = {}) {
	const optional = options.optional ?? true;
	const resolved = path.resolve(filePath);

	if (!fs.existsSync(resolved)) {
		if (optional) return {};
		throw new ScriptConfigError('Missing environment file.', { filePath: resolved });
	}

	const parsed = {};
	const contents = fs.readFileSync(resolved, 'utf8');

	for (const rawLine of contents.split(/\r?\n/u)) {
		const line = rawLine.trim();
		if (!line || line.startsWith('#')) continue;

		const separatorIndex = line.indexOf('=');
		if (separatorIndex <= 0) continue;

		const key = line.slice(0, separatorIndex).trim();
		let value = line.slice(separatorIndex + 1).trim();

		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1);
		}

		if (key) parsed[key] = value;
	}

	return parsed;
}

function resolveConfigMode(mode, env = process.env) {
	const envMode = env.EXPO_PUBLIC_APP_ENV || env.APP_CONFIG_MODE;
	if (mode && envMode && envMode !== mode) {
		throw new ScriptConfigError('Config mode mismatch.', {
			expectedMode: mode,
			envMode,
		});
	}

	const resolved = mode || envMode || 'dev';
	if (!CONFIG_MODES.has(resolved)) {
		throw new ScriptConfigError(`Unknown config mode: ${resolved}.`, {
			mode: resolved,
			allowedModes: [...CONFIG_MODES],
		});
	}
	return resolved;
}

function requireEnv(env, names, context) {
	const missingEnv = names.filter((name) => !env[name]);
	if (missingEnv.length > 0) {
		throw new ScriptConfigError('Missing required environment variables.', {
			context,
			missingEnv,
		});
	}
}

function resolveScriptEnv(options = {}) {
	const fileEnv = options.envFilePath ? loadEnvFile(options.envFilePath, { optional: true }) : {};
	const env = { ...fileEnv, ...(options.env ?? process.env) };
	const mode = resolveConfigMode(options.mode, env);
	requireEnv(env, options.requiredEnv ?? [], mode);
	return { mode, env };
}

function resolveEitherEnv(env, publicName, testName, context) {
	const publicValue = env[publicName];
	const testValue = env[testName];
	if (publicValue && testValue && publicValue !== testValue) {
		throw new ScriptConfigError('Ambiguous environment variables.', {
			context,
			publicName,
			testName,
		});
	}

	return publicValue || testValue;
}

function resolvePublicSupabaseEnv(options = {}) {
	const { mode, env } = resolveScriptEnv(options);
	requireEnv(env, ['EXPO_PUBLIC_SUPABASE_URL', 'EXPO_PUBLIC_SUPABASE_ANON_KEY'], mode);
	return { mode, env };
}

function resolveE2EExpoEnv(options = {}) {
	const { mode, env } = resolveScriptEnv({
		...options,
		mode: options.mode ?? 'e2e',
	});

	const supabaseUrl = resolveEitherEnv(
		env,
		'EXPO_PUBLIC_SUPABASE_URL',
		'SUPABASE_TEST_URL',
		'e2e',
	);
	const supabaseAnonKey = resolveEitherEnv(
		env,
		'EXPO_PUBLIC_SUPABASE_ANON_KEY',
		'SUPABASE_TEST_ANON_KEY',
		'e2e',
	);

	if (!supabaseUrl || !supabaseAnonKey) {
		throw new ScriptConfigError('Missing e2e Supabase public config.', {
			mode,
			requiredAny: [
				'EXPO_PUBLIC_SUPABASE_URL or SUPABASE_TEST_URL',
				'EXPO_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_TEST_ANON_KEY',
			],
		});
	}

	return {
		...env,
		EXPO_NO_DOTENV: '1',
		EXPO_PUBLIC_APP_ENV: env.EXPO_PUBLIC_APP_ENV || 'e2e',
		EXPO_PUBLIC_SUPABASE_URL: supabaseUrl,
		EXPO_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey,
	};
}

function resolveIntegrationJestEnv(options = {}) {
	const { env } = resolveScriptEnv({
		...options,
		mode: options.mode ?? 'integration',
	});

	resolveEitherEnv(env, 'EXPO_PUBLIC_SUPABASE_URL', 'SUPABASE_TEST_URL', 'integration');
	resolveEitherEnv(env, 'EXPO_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_TEST_ANON_KEY', 'integration');
	const supabaseUrl = env.SUPABASE_TEST_URL;
	const supabaseAnonKey = env.SUPABASE_TEST_ANON_KEY;
	requireEnv(env, ['SUPABASE_TEST_URL', 'SUPABASE_TEST_ANON_KEY'], 'integration');

	return {
		...env,
		EXPO_PUBLIC_APP_ENV: 'integration',
		EXPO_PUBLIC_SUPABASE_URL: supabaseUrl,
		EXPO_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey,
	};
}

function resolveTestSeedEnv(options = {}) {
	const { env } = resolveScriptEnv({
		...options,
		mode: options.mode ?? 'integration',
		requiredEnv: [
			'SUPABASE_TEST_URL',
			'SUPABASE_TEST_ANON_KEY',
			'INTEGRATION_TEST_EMAIL',
			'INTEGRATION_TEST_PASSWORD',
		],
	});

	return env;
}

module.exports = {
	CONFIG_MODES: [...CONFIG_MODES],
	ScriptConfigError,
	loadEnvFile,
	resolveConfigMode,
	resolveScriptEnv,
	resolvePublicSupabaseEnv,
	resolveE2EExpoEnv,
	resolveIntegrationJestEnv,
	resolveTestSeedEnv,
};
