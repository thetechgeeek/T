#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
	createViolation,
	findRepoRoot,
	formatViolations,
	parseCliArgs,
	printViolationReport,
	walkFiles,
} from './lib/repo-tools.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { flags } = parseCliArgs(process.argv.slice(2), {
	boolean: ['json'],
	string: ['baseline', 'root'],
});
const root = flags.root ? path.resolve(String(flags.root)) : findRepoRoot(path.join(__dirname, '..'));
const appDir = path.join(root, 'app');
const baselinePath = flags.baseline
	? path.resolve(String(flags.baseline))
	: path.join(root, 'scripts', 'baselines', 'runtime-boundaries.json');

const ROUTE_FILE_EXCLUDES = [
	'components/',
	'design-system/',
	'components/__tests__/',
	'components/organisms/__tests__/',
];

const RULES = [
	{
		id: 'app-raw-supabase-import',
		sourceMatches: (source) =>
			source === '@/src/config/supabase' || source.endsWith('/src/config/supabase'),
		message: 'Route files must not import the raw Supabase client.',
	},
	{
		id: 'app-repository-import',
		sourceMatches: (source) =>
			source.startsWith('@/src/repositories') || source.includes('/src/repositories'),
		message: 'Route files must use feature, service, store, or read-model APIs instead of repositories.',
	},
	{
		id: 'live-route-mock-import',
		sourceMatches: (source) => source.startsWith('@/src/mocks') || source.includes('/src/mocks'),
		message: 'Live route files must not import mock-backed product data.',
	},
];

function loadBaseline(filePath) {
	if (!fs.existsSync(filePath)) return new Set();
	const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
	return new Set(parsed.allowed ?? []);
}

function importSources(text) {
	const sources = [];
	const importPattern = /import(?:\s+type)?[\s\S]*?\sfrom\s+['"]([^'"]+)['"]/g;
	let match;

	while ((match = importPattern.exec(text)) !== null) {
		const line = text.slice(0, match.index).split(/\r?\n/).length;
		sources.push({ line, source: match[1] });
	}

	return sources;
}

function violationKey(violation) {
	return `${violation.rule}|${violation.file}|${violation.source}`;
}

function collectViolations() {
	if (!fs.existsSync(appDir)) return [];

	const violations = walkFiles(appDir, {
		extensions: ['.ts', '.tsx'],
		exclude: (relPath) => ROUTE_FILE_EXCLUDES.some((exclude) => relPath.startsWith(exclude)),
	}).flatMap((relPath) => {
		const file = `app/${relPath}`;
		const text = fs.readFileSync(path.join(appDir, relPath), 'utf8');

		return importSources(text).flatMap(({ line, source }) =>
			RULES.flatMap((rule) => {
				if (!rule.sourceMatches(source)) return [];
				return {
					...createViolation({
						file,
						line,
						rule: rule.id,
						message: `${rule.message} Imported ${source}.`,
					}),
					source,
				};
			}),
		);
	});

	return [...new Map(violations.map((violation) => [violationKey(violation), violation])).values()];
}

const baseline = loadBaseline(baselinePath);
const violations = collectViolations();
const newViolations = violations.filter((violation) => !baseline.has(violationKey(violation)));
const staleBaseline = [...baseline].filter(
	(key) => !violations.some((violation) => violationKey(violation) === key),
);

if (flags.json) {
	process.stdout.write(
		`${JSON.stringify(
			{
				status: newViolations.length > 0 ? 'failed' : 'ok',
				baselinePath: path.relative(root, baselinePath),
				newViolations,
				baselineCount: baseline.size,
				currentViolationCount: violations.length,
				staleBaseline,
			},
			null,
			2,
		)}\n`,
	);
} else if (newViolations.length > 0) {
	printViolationReport('check-runtime-boundaries', newViolations, { stream: process.stderr });
	process.stderr.write(
		`\nKnown baseline: ${baseline.size}. Current violations: ${violations.length}.\n`,
	);
} else {
	process.stdout.write(
		`check-runtime-boundaries: OK (${violations.length} current violation(s), ${baseline.size} baselined)\n`,
	);
}

if (staleBaseline.length > 0 && !flags.json) {
	process.stdout.write(
		[
			'Runtime boundary baseline has stale entries. Remove these keys after confirming the cleanup:',
			formatViolations(
				staleBaseline.map((key) =>
					createViolation({
						file: 'scripts/baselines/runtime-boundaries.json',
						rule: 'stale-runtime-boundary-baseline',
						message: key,
					}),
				),
			),
			'',
		].join('\n'),
	);
}

if (newViolations.length > 0) {
	process.exit(1);
}
