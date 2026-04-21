#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REQUIRED_FILES = [
	'docs/UI_PACKAGE_EXTRACTION_READINESS.md',
	'examples/ops-console/README.md',
	'examples/ops-console/package.json',
	'examples/ops-console/src/index.ts',
	'examples/ops-console/src/OpsConsoleApp.tsx',
	'__tests__/consumers/opsConsoleConsumer.test.tsx',
];
const REQUIRED_DOC_PHRASES = [
	'workspaces',
	'npm pack',
	'second consumer',
	'public entrypoints',
	'separate repo',
];
const PRIVATE_EXAMPLE_IMPORT_RE =
	/from\s*['"](?:@\/src\/(?:design-system|ui-shell)\/|@easydesign\/ui-shell\/|@easydesign\/design-system\/(?!(?:foundation|package\.json)['"]))/;
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function parseCliOptions() {
	const args = process.argv.slice(2);
	const options = {
		root: process.env.CHECK_UI_PACKAGE_EXTRACTION_READINESS_ROOT || path.join(__dirname, '..'),
	};

	for (let index = 0; index < args.length; index += 1) {
		const arg = args[index];
		if (arg === '--root') {
			const next = args[index + 1];
			if (!next) {
				throw new Error('Missing value for --root.');
			}
			options.root = path.resolve(next);
			index += 1;
			continue;
		}

		throw new Error(`Unknown argument: ${arg}`);
	}

	return options;
}

const { root } = parseCliOptions();
const violations = [];

function normalize(relPath) {
	return relPath.split(path.sep).join('/');
}

for (const relPath of REQUIRED_FILES) {
	if (!fs.existsSync(path.join(root, relPath))) {
		violations.push({
			file: relPath,
			rule: 'required-file',
			message: 'Extraction-readiness artifact is missing.',
		});
	}
}

const readinessDocPath = path.join(root, 'docs/UI_PACKAGE_EXTRACTION_READINESS.md');
if (fs.existsSync(readinessDocPath)) {
	const readinessDoc = fs.readFileSync(readinessDocPath, 'utf8');
	for (const phrase of REQUIRED_DOC_PHRASES) {
		if (!readinessDoc.toLowerCase().includes(phrase)) {
			violations.push({
				file: 'docs/UI_PACKAGE_EXTRACTION_READINESS.md',
				rule: 'readiness-doc-phrase',
				message: `Extraction readiness doc must mention "${phrase}".`,
			});
		}
	}
}

const exampleRoot = path.join(root, 'examples/ops-console/src');
if (fs.existsSync(exampleRoot)) {
	for (const entry of fs.readdirSync(exampleRoot)) {
		const absolutePath = path.join(exampleRoot, entry);
		if (!/\.(ts|tsx)$/.test(entry) || !fs.statSync(absolutePath).isFile()) {
			continue;
		}
		const relPath = normalize(path.relative(root, absolutePath));
		const text = fs.readFileSync(absolutePath, 'utf8');
		if (PRIVATE_EXAMPLE_IMPORT_RE.test(text)) {
			violations.push({
				file: relPath,
				rule: 'private-example-import',
				message: 'Ops Console must consume EasyDesign packages through public entrypoints only.',
			});
		}
	}
}

const opsConsoleConsumerTest = fs.existsSync(
	path.join(root, '__tests__/consumers/opsConsoleConsumer.test.tsx'),
)
	? fs.readFileSync(path.join(root, '__tests__/consumers/opsConsoleConsumer.test.tsx'), 'utf8')
	: '';
if (
	opsConsoleConsumerTest &&
	!opsConsoleConsumerTest.includes("from '@easydesign/ops-console'")
) {
	violations.push({
		file: '__tests__/consumers/opsConsoleConsumer.test.tsx',
		rule: 'consumer-test-import',
		message: 'Ops Console consumer test must import the example through @easydesign/ops-console.',
	});
}

function runPackCheck(workspaceName, requiredPaths) {
	const output = execFileSync(
		npmCommand,
		['pack', '--json', '--dry-run', '--workspace', workspaceName],
		{
			cwd: root,
			encoding: 'utf8',
		},
	);
	const report = JSON.parse(output);
	const firstResult = Array.isArray(report) ? report[0] : report;
	const packedFiles = new Set((firstResult.files ?? []).map((entry) => entry.path));

	for (const requiredPath of requiredPaths) {
		if (!packedFiles.has(requiredPath)) {
			violations.push({
				file: workspaceName,
				rule: 'npm-pack-contents',
				message: `${workspaceName} dry-run pack must include ${requiredPath}.`,
			});
		}
	}
}

try {
	runPackCheck('@easydesign/design-system', [
		'README.md',
		'CHANGELOG.md',
		'MIGRATIONS.md',
		'index.ts',
		'foundation/index.ts',
	]);
	runPackCheck('@easydesign/ui-shell', [
		'README.md',
		'CHANGELOG.md',
		'MIGRATIONS.md',
		'index.ts',
		'ShellRootProviders.tsx',
		'ShellAssetGate.tsx',
		'ShellOverlay.tsx',
	]);
} catch (error) {
	const failure = error instanceof Error ? error.message : String(error);
	violations.push({
		file: 'package workspace',
		rule: 'npm-pack-dry-run',
		message: `npm pack --dry-run failed: ${failure}`,
	});
}

if (violations.length > 0) {
	console.error('UI package extraction readiness violations found:\n');
	for (const violation of violations) {
		console.error(`  ${violation.file}  ${violation.rule}  ${violation.message}`);
	}
	process.exit(1);
}

console.log(
	JSON.stringify(
		{
			status: 'ok',
			requiredFiles: REQUIRED_FILES.length,
			packedWorkspaces: 2,
		},
		null,
		2,
	),
);
