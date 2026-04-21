import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync } from 'child_process';

const scriptPath = path.join(process.cwd(), 'scripts', 'check-inventory-app-ui-contract.mjs');

function writeFiles(root: string, files: Record<string, string>) {
	for (const [rel, contents] of Object.entries(files)) {
		const abs = path.join(root, rel);
		fs.mkdirSync(path.dirname(abs), { recursive: true });
		fs.writeFileSync(abs, contents);
	}
}

function createFixture(appSource: string) {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'check-inventory-app-ui-contract-'));
	writeFiles(root, {
		'docs/INVENTORY_APP_UI_CHECKLIST.md': [
			'# Inventory App UI Checklist',
			'',
			'> This file tracks what the inventory app itself must still own and verify.',
			'- Shell adapters receive real app implementations for auth, connectivity, sync state, and navigation callbacks',
			'- Product screens compose src/ui-shell and src/design-system through public entrypoints only',
			'',
		].join('\n'),
		'app/_layout.tsx': [
			"import { useWindowDimensions } from 'react-native';",
			"import { useAuthStore } from '@/src/stores/authStore';",
			"import { useNetworkStatus } from '@/src/hooks/useNetworkStatus';",
			"import { useNotificationStore } from '@/src/stores/notificationStore';",
			"import { useSyncStore } from '@/src/stores/syncStore';",
			"import { createInventoryShellEnvironment } from '@/src/inventory-app/shell/createInventoryShellEnvironment';",
			"import { ShellAuthGate, ShellRootProviders } from '@easydesign/ui-shell';",
			'useWindowDimensions();',
			'useAuthStore();',
			'useNetworkStatus();',
			'useNotificationStore();',
			'useSyncStore();',
			'createInventoryShellEnvironment({});',
			'ShellRootProviders;',
			'ShellAuthGate;',
			'export default function RootLayout() { return null; }',
			'',
		].join('\n'),
		'src/inventory-app/shell/createInventoryShellEnvironment.ts': [
			'export function createInventoryShellEnvironment() {',
			'	return {',
			'		notifications: {},',
			'		deepLinks: {},',
			'		adaptiveRuntime: {},',
			'		session: {},',
			'	};',
			'}',
			'',
		].join('\n'),
		'app/example.tsx': appSource,
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
		throw new Error('Expected check-inventory-app-ui-contract to fail.');
	} catch (error) {
		const failure = error as { stdout?: string; stderr?: string };
		return `${failure.stdout ?? ''}${failure.stderr ?? ''}`;
	}
}

describe('check-inventory-app-ui-contract', () => {
	const roots: string[] = [];

	afterEach(() => {
		while (roots.length > 0) {
			fs.rmSync(roots.pop() as string, { recursive: true, force: true });
		}
	});

	it('passes when inventory consumers use public EasyDesign entrypoints', () => {
		const root = createFixture(
			"import { ScreenHeader } from '@easydesign/ui-shell';\nimport { Button } from '@easydesign/design-system';\nexport default function Example() { return ScreenHeader && Button ? null : null; }\n",
		);
		roots.push(root);

		expect(runCheck(root)).toContain('"status": "ok"');
	});

	it('fails when a product screen imports a private shell file', () => {
		const root = createFixture(
			"import { ScreenHeader } from '@easydesign/ui-shell/components/molecules/ScreenHeader';\nexport default ScreenHeader;\n",
		);
		roots.push(root);

		const output = runCheckFailure(root);

		expect(output).toContain('private-shell-import');
		expect(output).toContain('app/example.tsx');
	});
});
