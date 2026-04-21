#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REQUIRED_FILES = [
	'docs/INVENTORY_APP_UI_CHECKLIST.md',
	'app/_layout.tsx',
	'src/inventory-app/shell/createInventoryShellEnvironment.ts',
];
const REQUIRED_DOC_PHRASES = [
	'inventory app itself must still own and verify',
	'Shell adapters receive real app implementations',
	'public entrypoints only',
];
const REQUIRED_ROOT_LAYOUT_PATTERNS = [
	'createInventoryShellEnvironment',
	'ShellRootProviders',
	'ShellAuthGate',
	'useNotificationStore',
	'useSyncStore',
	'useNetworkStatus',
	'useWindowDimensions',
	'useAuthStore',
];
const REQUIRED_ENVIRONMENT_PATTERNS = [
	'notifications: {',
	'deepLinks: {',
	'adaptiveRuntime:',
	'session: {',
];
const PRIVATE_SHELL_IMPORT_RE =
	/from\s*['"](?:@\/src\/ui-shell\/|@easydesign\/ui-shell\/(?!package\.json['"]))/;
const PRIVATE_DESIGN_SYSTEM_IMPORT_RE =
	/from\s*['"](?:@\/src\/design-system\/|@easydesign\/design-system\/(?!(?:foundation|package\.json)['"]))/;
const LEGACY_PUBLIC_IMPORT_RE =
	/from\s*['"](?:@\/src\/design-system['"]|@\/src\/design-system\/foundation['"]|@\/src\/ui-shell['"])/;

function parseCliOptions() {
	const args = process.argv.slice(2);
	const options = {
		root: process.env.CHECK_INVENTORY_APP_UI_CONTRACT_ROOT || path.join(__dirname, '..'),
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
			if (entry.name === '__tests__') {
				continue;
			}
			walk(absolutePath, out);
			continue;
		}

		if (/\.(ts|tsx|md)$/.test(entry.name)) {
			out.push(absolutePath);
		}
	}

	return out;
}

const violations = [];

for (const relPath of REQUIRED_FILES) {
	if (!fs.existsSync(path.join(root, relPath))) {
		violations.push({
			file: relPath,
			rule: 'required-file',
			message: 'Inventory consumer contract file is missing.',
		});
	}
}

const checklistPath = path.join(root, 'docs/INVENTORY_APP_UI_CHECKLIST.md');
if (fs.existsSync(checklistPath)) {
	const checklist = fs.readFileSync(checklistPath, 'utf8');
	for (const phrase of REQUIRED_DOC_PHRASES) {
		if (!checklist.includes(phrase)) {
			violations.push({
				file: 'docs/INVENTORY_APP_UI_CHECKLIST.md',
				rule: 'checklist-phrase',
				message: `Inventory checklist must mention "${phrase}".`,
			});
		}
	}
}

const rootLayoutPath = path.join(root, 'app/_layout.tsx');
if (fs.existsSync(rootLayoutPath)) {
	const rootLayout = fs.readFileSync(rootLayoutPath, 'utf8');
	for (const pattern of REQUIRED_ROOT_LAYOUT_PATTERNS) {
		if (!rootLayout.includes(pattern)) {
			violations.push({
				file: 'app/_layout.tsx',
				rule: 'root-layout-contract',
				message: `app/_layout.tsx must include ${pattern}.`,
			});
		}
	}
}

const environmentBuilderPath = path.join(
	root,
	'src/inventory-app/shell/createInventoryShellEnvironment.ts',
);
if (fs.existsSync(environmentBuilderPath)) {
	const environmentBuilder = fs.readFileSync(environmentBuilderPath, 'utf8');
	for (const pattern of REQUIRED_ENVIRONMENT_PATTERNS) {
		if (!environmentBuilder.includes(pattern)) {
			violations.push({
				file: 'src/inventory-app/shell/createInventoryShellEnvironment.ts',
				rule: 'environment-adapter-surface',
				message: `Inventory shell environment must include ${pattern}.`,
			});
		}
	}
}

const consumerRoots = [
	path.join(root, 'app'),
	path.join(root, 'src/features'),
	path.join(root, 'src/inventory-app'),
];

let consumerFileCount = 0;

for (const consumerRoot of consumerRoots) {
	for (const absolutePath of walk(consumerRoot)) {
		const relPath = normalize(path.relative(root, absolutePath));
		if (!/\.(ts|tsx)$/.test(relPath)) {
			continue;
		}
		consumerFileCount += 1;
		const text = fs.readFileSync(absolutePath, 'utf8');
		if (LEGACY_PUBLIC_IMPORT_RE.test(text)) {
			violations.push({
				file: relPath,
				rule: 'legacy-public-import',
				message: 'Inventory consumer code must use EasyDesign package entrypoints instead of repo-local public aliases.',
			});
		}
		if (PRIVATE_SHELL_IMPORT_RE.test(text)) {
			violations.push({
				file: relPath,
				rule: 'private-shell-import',
				message: 'Inventory consumer code must not import private UI shell implementation files.',
			});
		}
		if (PRIVATE_DESIGN_SYSTEM_IMPORT_RE.test(text)) {
			violations.push({
				file: relPath,
				rule: 'private-design-system-import',
				message: 'Inventory consumer code must not import private design-system implementation files.',
			});
		}
	}
}

if (violations.length > 0) {
	console.error('Inventory app UI contract violations found:\n');
	for (const violation of violations) {
		console.error(`  ${violation.file}  ${violation.rule}  ${violation.message}`);
	}
	process.exit(1);
}

console.log(
	JSON.stringify(
		{
			status: 'ok',
			consumerFiles: consumerFileCount,
		},
		null,
		2,
	),
);
