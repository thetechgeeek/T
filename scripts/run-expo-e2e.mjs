#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

function loadEnvFile(filePath) {
	if (!fs.existsSync(filePath)) {
		return {};
	}

	const parsed = {};
	const contents = fs.readFileSync(filePath, 'utf8');

	for (const rawLine of contents.split(/\r?\n/u)) {
		const line = rawLine.trim();
		if (!line || line.startsWith('#')) {
			continue;
		}

		const separatorIndex = line.indexOf('=');
		if (separatorIndex <= 0) {
			continue;
		}

		const key = line.slice(0, separatorIndex).trim();
		let value = line.slice(separatorIndex + 1).trim();

		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1);
		}

		if (key) {
			parsed[key] = value;
		}
	}

	return parsed;
}

function main() {
	const expoArgs = process.argv.slice(2);

	if (expoArgs.length === 0) {
		console.error('Usage: node scripts/run-expo-e2e.mjs <expo args...>');
		process.exit(1);
	}

	const envFromFile = loadEnvFile(path.join(process.cwd(), '.env.test'));
	const env = {
		...process.env,
		...envFromFile,
		EXPO_NO_DOTENV: '1',
		EXPO_PUBLIC_SUPABASE_URL:
			envFromFile.EXPO_PUBLIC_SUPABASE_URL ??
			envFromFile.SUPABASE_TEST_URL ??
			process.env.EXPO_PUBLIC_SUPABASE_URL,
		EXPO_PUBLIC_SUPABASE_ANON_KEY:
			envFromFile.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
			envFromFile.SUPABASE_TEST_ANON_KEY ??
			process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
		EXPO_PUBLIC_APP_ENV: envFromFile.EXPO_PUBLIC_APP_ENV ?? 'e2e',
	};

	if (!env.EXPO_PUBLIC_SUPABASE_URL || !env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
		console.error(
			'Missing test Supabase public config. Add SUPABASE_TEST_URL and SUPABASE_TEST_ANON_KEY to .env.test.',
		);
		process.exit(1);
	}

	console.log(
		`[e2e-expo] Using Supabase project: ${new URL(env.EXPO_PUBLIC_SUPABASE_URL).hostname}`,
	);

	const result = spawnSync('npx', ['expo', ...expoArgs], {
		cwd: process.cwd(),
		env,
		stdio: 'inherit',
	});

	process.exit(result.status ?? 1);
}

main();
