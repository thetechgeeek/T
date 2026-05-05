#!/usr/bin/env node

import path from 'path';
import { spawnSync } from 'child_process';
import scriptConfig from './lib/script-config.cjs';

const { resolveE2EExpoEnv } = scriptConfig;

function main() {
	const rawArgs = process.argv.slice(2);
	const dryRun = rawArgs.includes('--dry-run');
	const expoArgs = rawArgs.filter((arg) => arg !== '--dry-run');

	if (expoArgs.length === 0) {
		console.error('Usage: node scripts/run-expo-e2e.mjs <expo args...>');
		process.exit(1);
	}

	let env;
	try {
		env = resolveE2EExpoEnv({
			envFilePath: path.join(process.cwd(), '.env.test'),
			env: process.env,
		});
	} catch (error) {
		console.error(error instanceof Error ? error.message : String(error));
		process.exit(1);
	}

	console.log(
		`[e2e-expo] Using Supabase project: ${new URL(env.EXPO_PUBLIC_SUPABASE_URL).hostname}`,
	);

	if (dryRun) {
		console.log(
			JSON.stringify(
				{
					ok: true,
					dryRun: true,
					command: 'npx',
					args: ['expo', ...expoArgs],
					envKeys: [
						'EXPO_NO_DOTENV',
						'EXPO_PUBLIC_APP_ENV',
						'EXPO_PUBLIC_SUPABASE_URL',
						'EXPO_PUBLIC_SUPABASE_ANON_KEY',
					],
				},
				null,
				2,
			),
		);
		return;
	}

	const result = spawnSync('npx', ['expo', ...expoArgs], {
		cwd: process.cwd(),
		env,
		stdio: 'inherit',
	});

	process.exit(result.status ?? 1);
}

main();
