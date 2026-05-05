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
const root = flags.root
	? path.resolve(String(flags.root))
	: findRepoRoot(path.join(__dirname, '..'));
const appDir = path.join(root, 'app');
const srcDir = path.join(root, 'src');
const baselinePath = flags.baseline
	? path.resolve(String(flags.baseline))
	: path.join(root, 'scripts', 'baselines', 'runtime-boundaries.json');

const ROUTE_FILE_EXCLUDES = [
	'components/',
	'design-system/',
	'components/__tests__/',
	'components/organisms/__tests__/',
	'.test.',
	'.spec.',
];

const COMMON_FILE_EXCLUDES = [
	'__tests__/',
	'__mocks__/',
	'.test.',
	'.spec.',
	'design-system/',
	'ui-shell/',
	'theme/generated/',
];

const ROUTE_RULES = [
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
		message:
			'Route files must use feature, service, store, or read-model APIs instead of repositories.',
	},
	{
		id: 'live-route-mock-import',
		sourceMatches: (source) =>
			source.startsWith('@/src/mocks') || source.includes('/src/mocks'),
		message: 'Live route files must not import mock-backed product data.',
	},
];

const LAYER_SCANS = [
	{
		dir: appDir,
		prefix: 'app',
		excludes: ROUTE_FILE_EXCLUDES,
		rules: ROUTE_RULES,
	},
	{
		dir: path.join(srcDir, 'features'),
		prefix: 'src/features',
		excludes: COMMON_FILE_EXCLUDES,
		rules: [
			{
				id: 'feature-raw-supabase-import',
				sourceMatches: (source) =>
					source === '@/src/config/supabase' || source.endsWith('/src/config/supabase'),
				message:
					'Feature modules must use services or view-model APIs instead of raw Supabase.',
			},
			{
				id: 'feature-repository-import',
				sourceMatches: (source) =>
					source.startsWith('@/src/repositories') || source.includes('/repositories'),
				message: 'Feature modules must not import repositories directly.',
			},
			{
				id: 'feature-mock-import',
				sourceMatches: (source) =>
					source.startsWith('@/src/mocks') || source.includes('/mocks'),
				message: 'Feature modules must not depend on mock product data.',
			},
		],
	},
	{
		dir: path.join(srcDir, 'stores'),
		prefix: 'src/stores',
		excludes: COMMON_FILE_EXCLUDES,
		rules: [
			{
				id: 'store-raw-supabase-import',
				sourceMatches: (source) =>
					source === '@/src/config/supabase' || source.endsWith('/src/config/supabase'),
				message: 'Stores must use services or orchestrators instead of raw Supabase.',
			},
			{
				id: 'store-repository-import',
				sourceMatches: (source) =>
					source.startsWith('@/src/repositories') || source.includes('/repositories'),
				message: 'Stores must use services or orchestrators instead of repositories.',
			},
			{
				id: 'store-mock-import',
				sourceMatches: (source) =>
					source.startsWith('@/src/mocks') || source.includes('/mocks'),
				message: 'Stores must not depend on mock product data.',
			},
		],
	},
	{
		dir: path.join(srcDir, 'services'),
		prefix: 'src/services',
		excludes: COMMON_FILE_EXCLUDES,
		rules: [
			{
				id: 'service-store-import',
				sourceMatches: (source) =>
					source.startsWith('@/src/stores') || source.includes('/stores'),
				message: 'Services must not import Zustand stores.',
			},
			{
				id: 'service-app-import',
				sourceMatches: (source) => source.startsWith('@/app') || source.includes('/app/'),
				message: 'Services must not import app route modules.',
			},
			{
				id: 'service-mock-import',
				sourceMatches: (source) =>
					source.startsWith('@/src/mocks') || source.includes('/mocks'),
				message: 'Services must not depend on mock product data.',
			},
		],
	},
	{
		dir: path.join(srcDir, 'repositories'),
		prefix: 'src/repositories',
		excludes: COMMON_FILE_EXCLUDES,
		rules: [
			{
				id: 'repository-service-import',
				sourceMatches: (source) =>
					source.startsWith('@/src/services') || source.includes('/services'),
				message: 'Repositories must not import services.',
			},
			{
				id: 'repository-store-import',
				sourceMatches: (source) =>
					source.startsWith('@/src/stores') || source.includes('/stores'),
				message: 'Repositories must not import stores.',
			},
			{
				id: 'repository-app-import',
				sourceMatches: (source) => source.startsWith('@/app') || source.includes('/app/'),
				message: 'Repositories must not import app route modules.',
			},
			{
				id: 'repository-mock-import',
				sourceMatches: (source) =>
					source.startsWith('@/src/mocks') || source.includes('/mocks'),
				message: 'Repositories must not depend on mock product data.',
			},
		],
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

function collectScanViolations(scan) {
	if (!fs.existsSync(scan.dir)) return [];

	return walkFiles(scan.dir, {
		extensions: ['.ts', '.tsx'],
		exclude: (relPath) => scan.excludes.some((exclude) => relPath.includes(exclude)),
	}).flatMap((relPath) => {
		const file = `${scan.prefix}/${relPath}`;
		const text = fs.readFileSync(path.join(scan.dir, relPath), 'utf8');

		return importSources(text).flatMap(({ line, source }) =>
			scan.rules.flatMap((rule) => {
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
}

function collectViolations() {
	const violations = LAYER_SCANS.flatMap(collectScanViolations);

	return [
		...new Map(violations.map((violation) => [violationKey(violation), violation])).values(),
	];
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
