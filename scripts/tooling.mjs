#!/usr/bin/env node

import path from 'path';
import { fileURLToPath } from 'url';
import { findRepoRoot, runCommand, ToolingError } from './lib/repo-tools.mjs';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const COMMANDS = {
	'check:hex': { script: 'check-no-hex.mjs', class: 'design-system governance' },
	'check:ui-tokens': { script: 'check-ui-tokens.mjs', class: 'design-system governance' },
	'check:design-system': {
		script: 'check-design-system-guardrails.mjs',
		class: 'design-system governance',
	},
	'check:ui-shell': { script: 'check-ui-shell-guardrails.mjs', class: 'package governance' },
	'check:workspace-packages': {
		script: 'check-workspace-packages.mjs',
		class: 'package governance',
	},
	'check:inventory-consumer': {
		script: 'check-inventory-app-ui-contract.mjs',
		class: 'package governance',
	},
	'check:release-discipline': {
		script: 'check-package-release-discipline.mjs',
		class: 'release governance',
	},
	'check:extraction-readiness': {
		script: 'check-ui-package-extraction-readiness.mjs',
		class: 'package governance',
	},
	'check:routes': { script: 'check-expo-route-collisions.mjs', class: 'route governance' },
	'check:runtime-boundaries': {
		script: 'check-runtime-boundaries.mjs',
		class: 'runtime governance',
	},
	'check:product-surfaces': {
		script: 'check-product-surfaces.mjs',
		class: 'product governance',
	},
	'check:migrations': {
		script: 'check-supabase-migrations.mjs',
		class: 'database governance',
	},
	'check:db-types': {
		script: 'check-database-types.mjs',
		class: 'database governance',
	},
	'generate:tokens': { script: 'generate-design-tokens.mjs', class: 'build' },
	'generate:ui-library': { script: 'generate-ui-library-catalog.mjs', class: 'build' },
	'generate:component-catalog': { script: 'generate-component-catalog.mjs', class: 'build' },
	'e2e:expo': { script: 'run-expo-e2e.mjs', class: 'e2e' },
	'e2e:maestro': { script: 'run-maestro-suite.mjs', class: 'e2e' },
	'proof:design-system': { script: 'run-design-system-proof.mjs', class: 'e2e' },
	'seed:reset': { script: 'test-seed-reset.mjs', class: 'seed/reset' },
	'seed:verify': { script: 'test-seed-verify.mjs', class: 'seed/reset' },
};

function printHelp() {
	console.log(
		[
			'Usage: node scripts/tooling.mjs <command> [...args]',
			'       node scripts/tooling.mjs --list',
			'       node scripts/tooling.mjs --dry-run <command> [...args]',
			'',
			'Commands:',
			...Object.entries(COMMANDS).map(
				([name, command]) => `  ${name.padEnd(30)} ${command.class}`,
			),
		].join('\n'),
	);
}

function parseDispatcherArgs(argv) {
	const dryRun = argv.includes('--dry-run');
	const filtered = argv.filter((arg) => arg !== '--dry-run');

	if (filtered.includes('--help') || filtered.includes('-h')) {
		return { action: 'help', dryRun };
	}

	if (filtered.includes('--list')) {
		return { action: 'list', dryRun };
	}

	const commandIndex = filtered.findIndex((arg) => !arg.startsWith('-'));
	if (commandIndex === -1) {
		return { action: 'help', dryRun };
	}

	return {
		action: 'run',
		dryRun,
		commandName: filtered[commandIndex],
		commandArgs: filtered.slice(commandIndex + 1),
	};
}

function listCommands() {
	console.log(
		JSON.stringify(
			Object.fromEntries(
				Object.entries(COMMANDS).map(([name, command]) => [
					name,
					{ script: command.script, class: command.class },
				]),
			),
			null,
			2,
		),
	);
}

function main() {
	const parsed = parseDispatcherArgs(process.argv.slice(2));

	if (parsed.action === 'help') {
		printHelp();
		return;
	}

	if (parsed.action === 'list') {
		listCommands();
		return;
	}

	const command = COMMANDS[parsed.commandName];
	if (!command) {
		console.error(`Unknown platform tooling command: ${parsed.commandName}`);
		printHelp();
		process.exit(1);
	}

	const root = findRepoRoot(process.cwd());
	const scriptPath = path.join(SCRIPT_DIR, command.script);
	const nodeArgs = [scriptPath, ...parsed.commandArgs];

	if (parsed.dryRun) {
		console.log(
			JSON.stringify(
				{
					ok: true,
					dryRun: true,
					command: parsed.commandName,
					script: path.relative(root, scriptPath),
					args: parsed.commandArgs,
				},
				null,
				2,
			),
		);
		return;
	}

	try {
		const result = runCommand(process.execPath, nodeArgs, {
			cwd: root,
			stdio: 'inherit',
			allowFailure: true,
		});
		process.exit(result.status ?? 1);
	} catch (error) {
		if (error instanceof ToolingError) {
			console.error(error.message);
			process.exit(1);
		}
		throw error;
	}
}

main();
