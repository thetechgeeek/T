#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const REQUIRED_WORKSPACES = ['src/design-system', 'src/ui-shell', 'examples/*'];
const REQUIRED_ROOT_DEPENDENCIES = {
	'@easydesign/design-system': 'file:src/design-system',
	'@easydesign/ui-shell': 'file:src/ui-shell',
};
const REQUIRED_TSCONFIG_PATHS = {
	'@easydesign/design-system': './src/design-system/index.ts',
	'@easydesign/design-system/foundation': './src/design-system/foundation/index.ts',
	'@easydesign/ui-shell': './src/ui-shell/index.ts',
	'@easydesign/ops-console': './examples/ops-console/src/index.ts',
};
const REQUIRED_JEST_MAPPERS = [
	'^@easydesign/design-system$',
	'^@easydesign/design-system/foundation$',
	'^@easydesign/ui-shell$',
	'^@easydesign/ops-console$',
];
const REQUIRED_PACKAGES = [
	{
		relPath: 'src/design-system/package.json',
		name: '@easydesign/design-system',
		requiredFiles: ['README.md', 'CHANGELOG.md', 'MIGRATIONS.md', 'index.ts', 'foundation'],
		requiredExports: ['.', './foundation', './package.json'],
	},
	{
		relPath: 'src/ui-shell/package.json',
		name: '@easydesign/ui-shell',
		requiredFiles: [
			'README.md',
			'CHANGELOG.md',
			'MIGRATIONS.md',
			'index.ts',
			'ShellAdapters.ts',
			'ShellAssetGate.tsx',
			'ShellOverlay.tsx',
			'ShellRootProviders.tsx',
			'components',
		],
		requiredExports: ['.', './package.json'],
		requiredDependencies: {
			'@easydesign/design-system': 'file:../design-system',
		},
	},
	{
		relPath: 'examples/ops-console/package.json',
		name: '@easydesign/ops-console',
		requiredFiles: ['README.md', 'src'],
		requiredExports: ['.', './package.json'],
		requiredDependencies: {
			'@easydesign/design-system': 'file:../../src/design-system',
			'@easydesign/ui-shell': 'file:../../src/ui-shell',
		},
	},
];

function parseCliOptions() {
	const args = process.argv.slice(2);
	const options = {
		root: process.env.CHECK_WORKSPACE_PACKAGES_ROOT || path.join(__dirname, '..'),
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

function readJson(relPath) {
	return JSON.parse(fs.readFileSync(path.join(root, relPath), 'utf8'));
}

const violations = [];
const rootPackage = readJson('package.json');
const tsconfig = readJson('tsconfig.json');
const jestConfig = fs.readFileSync(path.join(root, 'jest.config.js'), 'utf8');
const jestIntegrationConfig = fs.readFileSync(
	path.join(root, 'jest.integration.config.js'),
	'utf8',
);

for (const workspace of REQUIRED_WORKSPACES) {
	if (!rootPackage.workspaces?.includes(workspace)) {
		violations.push({
			file: 'package.json',
			rule: 'workspace-entry',
			message: `Root package.json must include workspace "${workspace}".`,
		});
	}
}

for (const [dependencyName, expectedRange] of Object.entries(REQUIRED_ROOT_DEPENDENCIES)) {
	if (rootPackage.dependencies?.[dependencyName] !== expectedRange) {
		violations.push({
			file: 'package.json',
			rule: 'workspace-dependency',
			message: `Root dependency ${dependencyName} must be "${expectedRange}".`,
		});
	}
}

for (const [alias, expectedTarget] of Object.entries(REQUIRED_TSCONFIG_PATHS)) {
	const actual = tsconfig.compilerOptions?.paths?.[alias];
	if (!Array.isArray(actual) || actual[0] !== expectedTarget) {
		violations.push({
			file: 'tsconfig.json',
			rule: 'tsconfig-path',
			message: `tsconfig path ${alias} must point to ${expectedTarget}.`,
		});
	}
}

for (const mapper of REQUIRED_JEST_MAPPERS) {
	if (!jestConfig.includes(mapper)) {
		violations.push({
			file: 'jest.config.js',
			rule: 'jest-module-mapper',
			message: `jest.config.js must map ${mapper}.`,
		});
	}
	if (!jestIntegrationConfig.includes(mapper)) {
		violations.push({
			file: 'jest.integration.config.js',
			rule: 'jest-integration-module-mapper',
			message: `jest.integration.config.js must map ${mapper}.`,
		});
	}
}

for (const pkg of REQUIRED_PACKAGES) {
	const absolutePath = path.join(root, pkg.relPath);
	if (!fs.existsSync(absolutePath)) {
		violations.push({
			file: pkg.relPath,
			rule: 'required-package',
			message: 'Workspace package manifest is missing.',
		});
		continue;
	}

	const manifest = readJson(pkg.relPath);
	if (manifest.name !== pkg.name) {
		violations.push({
			file: pkg.relPath,
			rule: 'package-name',
			message: `Workspace package name must be ${pkg.name}.`,
		});
	}
	if (typeof manifest.version !== 'string' || !/^\d+\.\d+\.\d+$/.test(manifest.version)) {
		violations.push({
			file: pkg.relPath,
			rule: 'package-version',
			message: 'Workspace package must declare a SemVer version.',
		});
	}
	if (manifest.main !== './index.ts' && pkg.name !== '@easydesign/ops-console') {
		violations.push({
			file: pkg.relPath,
			rule: 'package-main',
			message: 'Workspace package must expose ./index.ts as its main entrypoint.',
		});
	}
	if (!Array.isArray(manifest.files)) {
		violations.push({
			file: pkg.relPath,
			rule: 'package-files',
			message: 'Workspace package must declare a files allowlist.',
		});
	} else {
		for (const requiredFile of pkg.requiredFiles) {
			if (!manifest.files.includes(requiredFile)) {
				violations.push({
					file: pkg.relPath,
					rule: 'package-files-entry',
					message: `Workspace package files[] must include ${requiredFile}.`,
				});
			}
		}
	}
	for (const requiredExport of pkg.requiredExports) {
		if (!manifest.exports || !(requiredExport in manifest.exports)) {
			violations.push({
				file: pkg.relPath,
				rule: 'package-export',
				message: `Workspace package must export ${requiredExport}.`,
			});
		}
	}
	for (const [dependencyName, expectedRange] of Object.entries(
		pkg.requiredDependencies ?? {},
	)) {
		if (manifest.dependencies?.[dependencyName] !== expectedRange) {
			violations.push({
				file: pkg.relPath,
				rule: 'package-dependency',
				message: `${pkg.relPath} must depend on ${dependencyName} via ${expectedRange}.`,
			});
		}
	}
}

for (const relPath of [
	'src/design-system/index.ts',
	'src/design-system/foundation/index.ts',
	'src/ui-shell/index.ts',
	'examples/ops-console/src/index.ts',
]) {
	if (!fs.existsSync(path.join(root, relPath))) {
		violations.push({
			file: relPath,
			rule: 'required-entry-file',
			message: 'Workspace package entry file is missing.',
		});
	}
}

if (violations.length > 0) {
	console.error('Workspace package violations found:\n');
	for (const violation of violations) {
		console.error(`  ${violation.file}  ${violation.rule}  ${violation.message}`);
	}
	process.exit(1);
}

console.log(
	JSON.stringify(
		{
			status: 'ok',
			workspaces: rootPackage.workspaces.length,
			packages: REQUIRED_PACKAGES.length,
		},
		null,
		2,
	),
);
