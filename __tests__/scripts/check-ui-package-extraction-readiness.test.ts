import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync } from 'child_process';

const scriptPath = path.join(process.cwd(), 'scripts', 'check-ui-package-extraction-readiness.mjs');

function writeFiles(root: string, files: Record<string, string>) {
	for (const [rel, contents] of Object.entries(files)) {
		const abs = path.join(root, rel);
		fs.mkdirSync(path.dirname(abs), { recursive: true });
		fs.writeFileSync(abs, contents);
	}
}

function createFixture(exampleSource: string) {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'check-ui-package-extraction-readiness-'));
	writeFiles(root, {
		'package.json': JSON.stringify(
			{
				name: '@easystock/app',
				version: '1.0.0',
				private: true,
				workspaces: ['src/design-system', 'src/ui-shell', 'examples/*'],
			},
			null,
			2,
		),
		'docs/UI_PACKAGE_EXTRACTION_READINESS.md': [
			'# UI Package Extraction Readiness',
			'',
			'- workspaces',
			'- npm pack',
			'- second consumer',
			'- public entrypoints',
			'- separate repo',
			'',
		].join('\n'),
		'examples/ops-console/README.md': '# Ops Console\n',
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
			},
			null,
			2,
		),
		'examples/ops-console/src/index.ts': 'export * from "./OpsConsoleApp";\n',
		'examples/ops-console/src/OpsConsoleApp.tsx': exampleSource,
		'__tests__/consumers/opsConsoleConsumer.test.tsx':
			"import { OpsConsoleApp } from '@easydesign/ops-console';\nOpsConsoleApp;\n",
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
		'src/design-system/README.md': '# DS\n',
		'src/design-system/CHANGELOG.md': '# Changelog\n',
		'src/design-system/MIGRATIONS.md': '# Migrations\n',
		'src/design-system/index.ts': 'export {};\n',
		'src/design-system/foundation/index.ts': 'export {};\n',
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
					'ShellRootProviders.tsx',
					'ShellAssetGate.tsx',
					'ShellOverlay.tsx',
				],
				exports: {
					'.': './index.ts',
					'./package.json': './package.json',
				},
			},
			null,
			2,
		),
		'src/ui-shell/README.md': '# Shell\n',
		'src/ui-shell/CHANGELOG.md': '# Changelog\n',
		'src/ui-shell/MIGRATIONS.md': '# Migrations\n',
		'src/ui-shell/index.ts': 'export {};\n',
		'src/ui-shell/ShellRootProviders.tsx':
			'export function ShellRootProviders() { return null; }\n',
		'src/ui-shell/ShellAssetGate.tsx': 'export function ShellAssetGate() { return null; }\n',
		'src/ui-shell/ShellOverlay.tsx':
			'export function ShellOverlayProvider() { return null; }\n',
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
		throw new Error('Expected check-ui-package-extraction-readiness to fail.');
	} catch (error) {
		const failure = error as { stdout?: string; stderr?: string };
		return `${failure.stdout ?? ''}${failure.stderr ?? ''}`;
	}
}

describe('check-ui-package-extraction-readiness', () => {
	const roots: string[] = [];

	afterEach(() => {
		while (roots.length > 0) {
			fs.rmSync(roots.pop() as string, { recursive: true, force: true });
		}
	});

	it('passes when extraction-readiness artifacts and dry-run packs are valid', () => {
		const root = createFixture(
			"import { Card } from '@easydesign/design-system';\nimport { ShellRootProviders } from '@easydesign/ui-shell';\nexport default function OpsConsoleApp() { return Card && ShellRootProviders ? null : null; }\n",
		);
		roots.push(root);

		expect(runCheck(root)).toContain('"status": "ok"');
	});

	it('fails when the example imports a private shell subpath', () => {
		const root = createFixture(
			"import { ScreenHeader } from '@easydesign/ui-shell/components/molecules/ScreenHeader';\nexport default ScreenHeader;\n",
		);
		roots.push(root);

		const output = runCheckFailure(root);

		expect(output).toContain('private-example-import');
		expect(output).toContain('examples/ops-console/src/OpsConsoleApp.tsx');
	});
});
