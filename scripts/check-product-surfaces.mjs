#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
	createViolation,
	findRepoRoot,
	parseCliArgs,
	printViolationReport,
	walkFiles,
} from './lib/repo-tools.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { flags } = parseCliArgs(process.argv.slice(2), {
	boolean: ['json'],
	string: ['root'],
});
const root = flags.root
	? path.resolve(String(flags.root))
	: findRepoRoot(path.join(__dirname, '..'));

const PRODUCT_ROUTE_DIRS = [
	'app/(app)/finance',
	'app/(app)/reports',
	'app/(app)/transactions',
	'app/(app)/utilities',
];

const RULES = [
	{
		id: 'placeholder-coming-soon-alert',
		pattern: /Alert\.alert\(\s*['"]Coming Soon['"]/g,
		message: 'Operational product routes must not present coming-soon alerts as actions.',
	},
	{
		id: 'placeholder-export-action',
		pattern: /Export feature coming soon/gi,
		message: 'Export controls must be implemented, hidden, or explicitly disabled.',
	},
	{
		id: 'placeholder-share-action',
		pattern: /Native share sheet coming soon/gi,
		message: 'Share controls must be implemented, hidden, or explicitly disabled.',
	},
	{
		id: 'fake-save-success',
		pattern: /Alert\.alert\(\s*['"]Success['"][\s\S]{0,180}saved successfully/gi,
		message: 'Save actions must not emit fake success messages.',
	},
	{
		id: 'noop-operational-action',
		pattern:
			/accessibilityLabel=['"][^'"]*(Export|Print|Share|Save)[^'"]*['"][\s\S]{0,260}onPress=\{\(\) => \{\}\}/g,
		message: 'Operational-looking controls must not have no-op handlers.',
	},
];

function lineForIndex(text, index) {
	return text.slice(0, index).split(/\r?\n/).length;
}

function collectFileViolations(file, absolute) {
	const text = fs.readFileSync(absolute, 'utf8');
	const violations = [];

	for (const rule of RULES) {
		rule.pattern.lastIndex = 0;
		let match;
		while ((match = rule.pattern.exec(text)) !== null) {
			violations.push(
				createViolation({
					file,
					line: lineForIndex(text, match.index),
					rule: rule.id,
					message: rule.message,
				}),
			);
		}
	}

	return violations;
}

const violations = PRODUCT_ROUTE_DIRS.flatMap((routeDir) => {
	const absoluteDir = path.join(root, routeDir);
	if (!fs.existsSync(absoluteDir)) return [];

	return walkFiles(absoluteDir, {
		extensions: ['.ts', '.tsx'],
		exclude: (relPath) => relPath.includes('__tests__/') || relPath.includes('.test.'),
	}).flatMap((relative) => {
		const file = `${routeDir}/${relative}`;
		return collectFileViolations(file, path.join(absoluteDir, relative));
	});
});

if (flags.json) {
	process.stdout.write(
		`${JSON.stringify(
			{
				status: violations.length > 0 ? 'failed' : 'ok',
				violations,
			},
			null,
			2,
		)}\n`,
	);
} else {
	printViolationReport('check-product-surfaces', violations, {
		stream: violations.length > 0 ? process.stderr : process.stdout,
	});
}

if (violations.length > 0) {
	process.exit(1);
}
