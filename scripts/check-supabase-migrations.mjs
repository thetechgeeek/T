#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import {
	createViolation,
	findRepoRoot,
	formatViolations,
	parseCliArgs,
	toViolationReport,
} from './lib/repo-tools.mjs';

const DEFAULT_LEGACY_DUPLICATE_PREFIXES = new Set(['015']);

function readMigrationFiles(migrationsDir) {
	if (!fs.existsSync(migrationsDir)) {
		return [];
	}
	return fs
		.readdirSync(migrationsDir)
		.filter((entry) => entry.endsWith('.sql'))
		.sort();
}

function groupByPrefix(files) {
	const groups = new Map();
	const invalid = [];

	for (const file of files) {
		const match = file.match(/^(\d{3})_[a-z0-9_]+\.sql$/u);
		if (!match) {
			invalid.push(file);
			continue;
		}

		const prefix = match[1];
		groups.set(prefix, [...(groups.get(prefix) ?? []), file]);
	}

	return { groups, invalid };
}

export function checkSupabaseMigrations({
	migrationsDir,
	legacyDuplicatePrefixes = DEFAULT_LEGACY_DUPLICATE_PREFIXES,
} = {}) {
	const files = readMigrationFiles(migrationsDir);
	const { groups, invalid } = groupByPrefix(files);
	const violations = [];

	for (const file of invalid) {
		violations.push(
			createViolation({
				file: path.join(migrationsDir, file),
				rule: 'supabase-migration-name',
				message: 'Migration files must use the 000_descriptive_name.sql format.',
			}),
		);
	}

	for (const [prefix, prefixedFiles] of groups.entries()) {
		if (prefixedFiles.length <= 1 || legacyDuplicatePrefixes.has(prefix)) continue;

		violations.push(
			createViolation({
				file: migrationsDir,
				rule: 'supabase-migration-prefix',
				message: `Duplicate migration prefix ${prefix}: ${prefixedFiles.join(', ')}`,
			}),
		);
	}

	return toViolationReport('supabase-migrations', violations);
}

function main() {
	const root = findRepoRoot(process.cwd());
	const { flags } = parseCliArgs(process.argv.slice(2), {
		boolean: ['json'],
		string: ['migrations-dir', 'allow-duplicate-prefixes'],
	});
	const migrationsDir = path.resolve(
		root,
		String(flags['migrations-dir'] ?? path.join('supabase', 'migrations')),
	);
	const legacyDuplicatePrefixes = new Set(
		String(flags['allow-duplicate-prefixes'] ?? '015')
			.split(',')
			.map((entry) => entry.trim())
			.filter(Boolean),
	);
	const report = checkSupabaseMigrations({ migrationsDir, legacyDuplicatePrefixes });

	if (flags.json) {
		console.log(JSON.stringify(report, null, 2));
	} else if (report.violations.length > 0) {
		console.error(formatViolations(report.violations));
	} else {
		console.log('Supabase migration naming check passed.');
	}

	if (report.violations.length > 0) {
		process.exit(1);
	}
}

main();
