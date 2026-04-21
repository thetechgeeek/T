#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseCliOptions() {
	const args = process.argv.slice(2);
	const options = {
		root: process.env.CHECK_UI_SHELL_GUARDRAILS_ROOT || path.join(__dirname, '..'),
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

const SHELL_ROOT = path.join(root, 'src/ui-shell');
const REQUIRED_FILES = [
	'src/ui-shell/index.ts',
	'src/ui-shell/package.json',
	'src/ui-shell/README.md',
	'src/ui-shell/ShellEnvironment.tsx',
	'src/ui-shell/ShellRootProviders.tsx',
	'src/ui-shell/ShellAuthGate.tsx',
	'src/ui-shell/__tests__/boundary.test.tsx',
];
const REQUIRED_README_PHRASES = [
	'public surface',
	'product apps',
	'src/design-system',
	'adapter',
];
const LEGACY_CONSUMER_IMPORT_RE =
	/from\s*['"](?:@\/src\/theme\/|@\/theme\/|@\/src\/hooks\/(?:useThemeTokens|useReducedMotion|useSkeletonShimmer|useDebounce|useControllableState)|@\/src\/utils\/(?:color|accessibility|animateNextLayout)|@\/app\/components\/atoms\/(?:ErrorBoundary|OfflineBanner|QueryBoundary|SyncIndicator)|@\/app\/components\/molecules\/ScreenHeader)/;
const PRIVATE_SHELL_IMPORT_RE = /from\s*['"]@\/src\/ui-shell\/(?!index['"]|package\.json['"])/;
const PRIVATE_DESIGN_SYSTEM_IMPORT_RE =
	/from\s*['"](?:@\/src\/design-system\/components\/|@\/src\/design-system\/foundation\/)/;
const SHELL_PRODUCT_IMPORT_RE =
	/from\s*['"](?:@\/app\/|@\/src\/stores\/|@\/src\/services\/|@\/src\/features\/|@\/src\/hooks\/useLocale|@\/src\/hooks\/useNetworkStatus|@\/src\/theme\/|@\/theme\/|@\/src\/utils\/)/;

function normalize(relPath) {
	return relPath.split(path.sep).join('/');
}

function walk(dir, out = []) {
	if (!fs.existsSync(dir)) {
		return out;
	}

	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		if (entry.name.startsWith('.')) {
			continue;
		}

		const absolutePath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			walk(absolutePath, out);
			continue;
		}

		if (!/\.(ts|tsx|md|json)$/.test(entry.name)) {
			continue;
		}

		out.push(absolutePath);
	}

	return out;
}

function collectConsumerFiles() {
	const roots = [path.join(root, 'app'), path.join(root, 'src'), path.join(root, '__tests__')];
	const excludedFiles = new Set([
		'__tests__/scripts/check-design-system-guardrails.test.ts',
		'__tests__/scripts/check-ui-shell-guardrails.test.ts',
		'src/i18n/runtime.ts',
	]);
	const excludedPrefixes = [
		'src/design-system',
		'src/ui-shell',
		'src/theme',
		'src/hooks',
		'src/utils',
	];
	const files = [];

	for (const base of roots) {
		for (const absolutePath of walk(base)) {
			const relPath = normalize(path.relative(root, absolutePath));
			if (!/\.(ts|tsx)$/.test(relPath)) {
				continue;
			}
			if (excludedFiles.has(relPath)) {
				continue;
			}
			if (excludedPrefixes.some((prefix) => relPath === prefix || relPath.startsWith(`${prefix}/`))) {
				continue;
			}
			files.push(absolutePath);
		}
	}

	return files;
}

function collectShellSourceFiles() {
	return walk(SHELL_ROOT).filter((absolutePath) => {
		const relPath = normalize(path.relative(root, absolutePath));
		return /\.(ts|tsx)$/.test(relPath) && !relPath.includes('/__tests__/');
	});
}

const violations = [];

for (const relPath of REQUIRED_FILES) {
	if (!fs.existsSync(path.join(root, relPath))) {
		violations.push({
			file: relPath,
			rule: 'required-file',
			message: 'UI shell extraction surface is missing a required public file.',
		});
	}
}

const readmePath = path.join(root, 'src/ui-shell/README.md');
if (fs.existsSync(readmePath)) {
	const readme = fs.readFileSync(readmePath, 'utf8');
	for (const phrase of REQUIRED_README_PHRASES) {
		if (!readme.includes(phrase)) {
			violations.push({
				file: 'src/ui-shell/README.md',
				rule: 'readme-contract',
				message: `UI shell README must mention "${phrase}".`,
			});
		}
	}
}

for (const absolutePath of collectShellSourceFiles()) {
	const relPath = normalize(path.relative(root, absolutePath));
	const text = fs.readFileSync(absolutePath, 'utf8');
	if (SHELL_PRODUCT_IMPORT_RE.test(text)) {
		violations.push({
			file: relPath,
			rule: 'shell-product-import',
			message: 'UI shell code must stay detached from product hooks, stores, services, features, and legacy shared layers.',
		});
	}
}

for (const absolutePath of collectConsumerFiles()) {
	const relPath = normalize(path.relative(root, absolutePath));
	const text = fs.readFileSync(absolutePath, 'utf8');

	if (LEGACY_CONSUMER_IMPORT_RE.test(text)) {
		violations.push({
			file: relPath,
			rule: 'legacy-consumer-import',
			message: 'Consumers must import shell and foundation APIs from the new public entrypoints instead of legacy shim paths.',
		});
	}

	if (PRIVATE_SHELL_IMPORT_RE.test(text)) {
		violations.push({
			file: relPath,
			rule: 'private-shell-import',
			message: 'Consumers must import UI shell APIs from src/ui-shell/index.ts only.',
		});
	}

	if (PRIVATE_DESIGN_SYSTEM_IMPORT_RE.test(text)) {
		violations.push({
			file: relPath,
			rule: 'private-design-system-import',
			message:
				'Consumers must import design-system APIs from src/design-system/index.ts or src/design-system/foundation/index.ts only.',
		});
	}
}

const rootLayout = fs.readFileSync(path.join(root, 'app/_layout.tsx'), 'utf8');
if (!/ShellRootProviders/.test(rootLayout) || !/ShellAuthGate/.test(rootLayout)) {
	violations.push({
		file: 'app/_layout.tsx',
		rule: 'root-shell-contract',
		message: 'app/_layout.tsx must compose the root shell through ShellRootProviders and ShellAuthGate.',
	});
}

if (violations.length > 0) {
	console.error('UI shell guardrail violations found:\n');
	for (const violation of violations) {
		console.error(`  ${violation.file}  ${violation.rule}  ${violation.message}`);
	}
	process.exit(1);
}

console.log(
	JSON.stringify(
		{
			checkedShellFiles: collectShellSourceFiles().length,
			checkedConsumerFiles: collectConsumerFiles().length,
			status: 'ok',
		},
		null,
		2,
	),
);
