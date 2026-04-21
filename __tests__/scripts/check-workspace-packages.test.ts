import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync } from 'child_process';

const scriptPath = path.join(process.cwd(), 'scripts', 'check-workspace-packages.mjs');

function writeFiles(root: string, files: Record<string, string>) {
	for (const [rel, contents] of Object.entries(files)) {
		const abs = path.join(root, rel);
		fs.mkdirSync(path.dirname(abs), { recursive: true });
		fs.writeFileSync(abs, contents);
	}
}

function createFixture(overrides: Record<string, string> = {}) {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'check-workspace-packages-'));
	writeFiles(root, {
		'package.json': JSON.stringify(
			{
				name: '@easydesign/inventory-app',
				version: '1.0.0',
				private: true,
				workspaces: ['src/design-system', 'src/ui-shell', 'examples/*'],
				dependencies: {
					'@easydesign/design-system': 'file:src/design-system',
					'@easydesign/ui-shell': 'file:src/ui-shell',
				},
			},
			null,
			2,
		),
		'tsconfig.json': JSON.stringify(
			{
				compilerOptions: {
					paths: {
						'@easydesign/design-system': ['./src/design-system/index.ts'],
						'@easydesign/design-system/foundation': [
							'./src/design-system/foundation/index.ts',
						],
						'@easydesign/ui-shell': ['./src/ui-shell/index.ts'],
						'@easydesign/ops-console': ['./examples/ops-console/src/index.ts'],
					},
				},
			},
			null,
			2,
		),
		'jest.config.js': `
			module.exports = {
				moduleNameMapper: {
					'^@easydesign/design-system$': '<rootDir>/src/design-system/index.ts',
					'^@easydesign/design-system/foundation$': '<rootDir>/src/design-system/foundation/index.ts',
					'^@easydesign/ui-shell$': '<rootDir>/src/ui-shell/index.ts',
					'^@easydesign/ops-console$': '<rootDir>/examples/ops-console/src/index.ts',
				},
			};
		`,
		'jest.integration.config.js': `
			module.exports = {
				moduleNameMapper: {
					'^@easydesign/design-system$': '<rootDir>/src/design-system/index.ts',
					'^@easydesign/design-system/foundation$': '<rootDir>/src/design-system/foundation/index.ts',
					'^@easydesign/ui-shell$': '<rootDir>/src/ui-shell/index.ts',
					'^@easydesign/ops-console$': '<rootDir>/examples/ops-console/src/index.ts',
				},
			};
		`,
		'src/design-system/package.json': JSON.stringify(
			{
				name: '@easydesign/design-system',
				version: '0.1.0',
				private: true,
				main: './index.ts',
				files: ['README.md', 'CHANGELOG.md', 'MIGRATIONS.md', 'index.ts', 'foundation'],
				exports: {
					'.': './index.ts',
					'./foundation': './foundation/index.ts',
					'./package.json': './package.json',
				},
			},
			null,
			2,
		),
		'src/ui-shell/package.json': JSON.stringify(
			{
				name: '@easydesign/ui-shell',
				version: '0.1.0',
				private: true,
				main: './index.ts',
				files: [
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
				exports: {
					'.': './index.ts',
					'./package.json': './package.json',
				},
				dependencies: {
					'@easydesign/design-system': 'file:../design-system',
				},
			},
			null,
			2,
		),
		'examples/ops-console/package.json': JSON.stringify(
			{
				name: '@easydesign/ops-console',
				version: '0.1.0',
				private: true,
				main: './src/index.ts',
				files: ['README.md', 'src'],
				exports: {
					'.': './src/index.ts',
					'./package.json': './package.json',
				},
				dependencies: {
					'@easydesign/design-system': 'file:../../src/design-system',
					'@easydesign/ui-shell': 'file:../../src/ui-shell',
				},
			},
			null,
			2,
		),
		'src/design-system/index.ts': 'export {};\n',
		'src/design-system/foundation/index.ts': 'export {};\n',
		'src/ui-shell/index.ts': 'export {};\n',
		'examples/ops-console/src/index.ts': 'export {};\n',
		...overrides,
	});
	return root;
}

function runCheck(root: string) {
	return execFileSync(process.execPath, [scriptPath, '--root', root], {
		encoding: 'utf8',
	});
}

function runCheckFailure(root: string) {
	try {
		runCheck(root);
		throw new Error('Expected check-workspace-packages to fail.');
	} catch (error) {
		const failure = error as { stdout?: string; stderr?: string };
		return `${failure.stdout ?? ''}${failure.stderr ?? ''}`;
	}
}

describe('check-workspace-packages', () => {
	const roots: string[] = [];

	afterEach(() => {
		while (roots.length > 0) {
			fs.rmSync(roots.pop() as string, { recursive: true, force: true });
		}
	});

	it('passes for a valid EasyDesign workspace package layout', () => {
		const root = createFixture();
		roots.push(root);

		expect(runCheck(root)).toContain('"status": "ok"');
	});

	it('fails when the shell package files allowlist is incomplete', () => {
		const root = createFixture({
			'src/ui-shell/package.json': JSON.stringify(
				{
					name: '@easydesign/ui-shell',
					version: '0.1.0',
					private: true,
					main: './index.ts',
					files: ['README.md', 'index.ts'],
					exports: {
						'.': './index.ts',
						'./package.json': './package.json',
					},
				},
				null,
				2,
			),
		});
		roots.push(root);

		const output = runCheckFailure(root);

		expect(output).toContain('package-files-entry');
		expect(output).toContain('src/ui-shell/package.json');
	});
});
