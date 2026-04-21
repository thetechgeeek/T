import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync } from 'child_process';

const scriptPath = path.join(process.cwd(), 'scripts', 'check-ui-shell-guardrails.mjs');

function writeFiles(root: string, files: Record<string, string>) {
	for (const [rel, contents] of Object.entries(files)) {
		const abs = path.join(root, rel);
		fs.mkdirSync(path.dirname(abs), { recursive: true });
		fs.writeFileSync(abs, contents);
	}
}

function createFixture({
	shellSource,
	consumerSource,
}: {
	shellSource: string;
	consumerSource: string;
}) {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'check-ui-shell-guardrails-'));
	writeFiles(root, {
		'app/_layout.tsx': [
			"import { ShellAuthGate, ShellRootProviders } from '@easydesign/ui-shell';",
			'export default function RootLayout() {',
			'	return (',
			'		<ShellRootProviders environment={{ translate: (key) => key, isConnected: true, syncStatus: { lastSyncedAt: null, isSyncing: false, pendingCount: 0 }, openSyncLog: () => {} }}>',
			'			<ShellAuthGate loading={false} isAuthenticated={true} inAuthArea={false} onAuthRequired={() => {}} onAuthenticated={() => {}} />',
			'		</ShellRootProviders>',
			'	);',
			'}',
			'',
		].join('\n'),
		'app/example.tsx': consumerSource,
		'src/ui-shell/index.ts':
			'export * from "./ShellRootProviders";\nexport * from "./ShellAuthGate";\n',
		'src/ui-shell/package.json': JSON.stringify(
			{ name: '@easydesign/ui-shell', version: '0.0.0', private: true },
			null,
			2,
		),
		'src/ui-shell/README.md':
			'public surface\nconsumer apps\n@easydesign/design-system\n@easydesign/ui-shell\nadapter\nProvider Order\n',
		'src/ui-shell/ShellAdapters.ts': 'export type ShellAdapter = {};\n',
		'src/ui-shell/ShellAssetGate.tsx': 'export function ShellAssetGate() { return null; }\n',
		'src/ui-shell/ShellEnvironment.tsx':
			'export function ShellEnvironmentProvider() { return null; }\n',
		'src/ui-shell/ShellOverlay.tsx':
			'export function ShellOverlayProvider() { return null; }\n',
		'src/ui-shell/ShellRootProviders.tsx':
			'export function ShellRootProviders() { return null; }\n',
		'src/ui-shell/ShellAuthGate.tsx': 'export function ShellAuthGate() { return null; }\n',
		'src/ui-shell/__tests__/boundary.test.tsx':
			"describe('shell boundary', () => it('exists', () => expect(true).toBe(true)));\n",
		'src/ui-shell/components/molecules/ScreenHeader.tsx': shellSource,
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
		throw new Error('Expected check-ui-shell-guardrails to fail.');
	} catch (error) {
		const failure = error as { stdout?: string; stderr?: string };
		return `${failure.stdout ?? ''}${failure.stderr ?? ''}`;
	}
}

describe('check-ui-shell-guardrails', () => {
	const roots: string[] = [];

	afterEach(() => {
		while (roots.length > 0) {
			fs.rmSync(roots.pop() as string, { recursive: true, force: true });
		}
	});

	it('passes when shell code stays product-agnostic and consumers use public entrypoints', () => {
		const root = createFixture({
			shellSource: [
				"import { ThemedText } from '@easydesign/design-system';",
				"import { useThemeTokens } from '@easydesign/design-system/foundation';",
				"import { useShellEnvironment } from '../../ShellEnvironment';",
				'export function ScreenHeader() {',
				'	const { c } = useThemeTokens();',
				'	const { translate } = useShellEnvironment();',
				'	return ThemedText && c && translate ? null : null;',
				'}',
				'',
			].join('\n'),
			consumerSource:
				"import { ShellRootProviders } from '@easydesign/ui-shell';\nexport default ShellRootProviders;\n",
		});
		roots.push(root);

		expect(runCheck(root)).toContain('"status": "ok"');
	});

	it('fails when shell code imports product stores', () => {
		const root = createFixture({
			shellSource: [
				"import { useSyncStore } from '@/src/stores/syncStore';",
				'export function ScreenHeader() {',
				'	return useSyncStore ? null : null;',
				'}',
				'',
			].join('\n'),
			consumerSource:
				"import { ShellRootProviders } from '@easydesign/ui-shell';\nexport default ShellRootProviders;\n",
		});
		roots.push(root);

		const output = runCheckFailure(root);

		expect(output).toContain('shell-product-import');
		expect(output).toContain('ScreenHeader.tsx');
	});

	it('fails when consumers import legacy shim paths', () => {
		const root = createFixture({
			shellSource: [
				"import { ThemedText } from '@easydesign/design-system';",
				'export function ScreenHeader() {',
				'	return ThemedText ? null : null;',
				'}',
				'',
			].join('\n'),
			consumerSource:
				"import { useThemeTokens } from '@/src/hooks/useThemeTokens';\nexport default useThemeTokens;\n",
		});
		roots.push(root);

		const output = runCheckFailure(root);

		expect(output).toContain('legacy-consumer-import');
		expect(output).toContain('app/example.tsx');
	});

	it('fails when consumers import private shell files', () => {
		const root = createFixture({
			shellSource: [
				"import { ThemedText } from '@easydesign/design-system';",
				'export function ScreenHeader() {',
				'	return ThemedText ? null : null;',
				'}',
				'',
			].join('\n'),
			consumerSource:
				"import { ScreenHeader } from '@/src/ui-shell/components/molecules/ScreenHeader';\nexport default ScreenHeader;\n",
		});
		roots.push(root);

		const output = runCheckFailure(root);

		expect(output).toContain('private-shell-import');
		expect(output).toContain('app/example.tsx');
	});

	it('fails when consumers import private package subpaths', () => {
		const root = createFixture({
			shellSource: [
				"import { ThemedText } from '@easydesign/design-system';",
				'export function ScreenHeader() {',
				'	return ThemedText ? null : null;',
				'}',
				'',
			].join('\n'),
			consumerSource:
				"import { ScreenHeader } from '@easydesign/ui-shell/components/molecules/ScreenHeader';\nexport default ScreenHeader;\n",
		});
		roots.push(root);

		const output = runCheckFailure(root);

		expect(output).toContain('private-shell-import');
		expect(output).toContain('app/example.tsx');
	});
});
