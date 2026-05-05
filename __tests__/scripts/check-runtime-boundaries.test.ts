import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync } from 'child_process';

const scriptPath = path.join(process.cwd(), 'scripts', 'check-runtime-boundaries.mjs');

function createFixture(files: Record<string, string>, baseline: string[] = []) {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'check-runtime-boundaries-'));
	fs.writeFileSync(path.join(root, 'package.json'), '{"name":"fixture"}\n');
	fs.mkdirSync(path.join(root, 'scripts', 'baselines'), { recursive: true });
	fs.writeFileSync(
		path.join(root, 'scripts', 'baselines', 'runtime-boundaries.json'),
		JSON.stringify({ allowed: baseline }, null, 2),
	);

	for (const [rel, contents] of Object.entries(files)) {
		const absolute = path.join(root, rel);
		fs.mkdirSync(path.dirname(absolute), { recursive: true });
		fs.writeFileSync(absolute, contents);
	}

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
		throw new Error('Expected runtime boundary check to fail.');
	} catch (error) {
		const failure = error as { stdout?: string; stderr?: string };
		return `${failure.stdout ?? ''}${failure.stderr ?? ''}`;
	}
}

describe('check-runtime-boundaries', () => {
	const roots: string[] = [];

	afterEach(() => {
		while (roots.length > 0) {
			fs.rmSync(roots.pop() as string, { recursive: true, force: true });
		}
	});

	it('passes when route imports stay within the target dependency graph', () => {
		const root = createFixture({
			'app/(app)/inventory/index.tsx': "import { useThemeTokens } from '@/src/theme';\n",
		});
		roots.push(root);

		expect(runCheck(root)).toContain('check-runtime-boundaries: OK');
	});

	it('fails on a new raw Supabase import from app route files', () => {
		const root = createFixture({
			'app/(app)/inventory/[id].tsx': "import { supabase } from '@/src/config/supabase';\n",
		});
		roots.push(root);

		const output = runCheckFailure(root);

		expect(output).toContain('app-raw-supabase-import');
		expect(output).toContain('app/(app)/inventory/[id].tsx');
	});

	it('fails on a live route mock import', () => {
		const root = createFixture({
			'app/(app)/reports/gstr1.tsx':
				"import { MOCK_GSTR1_B2B } from '@/src/mocks/reports/gstr1';\n",
		});
		roots.push(root);

		const output = runCheckFailure(root);

		expect(output).toContain('live-route-mock-import');
		expect(output).toContain('app/(app)/reports/gstr1.tsx');
	});

	it('fails on a feature module importing a repository', () => {
		const root = createFixture({
			'src/features/payments/buildPaymentRecordPayload.ts':
				"import type { PaymentInput } from '@/src/repositories/paymentRepository';\n",
		});
		roots.push(root);

		const output = runCheckFailure(root);

		expect(output).toContain('feature-repository-import');
		expect(output).toContain('src/features/payments/buildPaymentRecordPayload.ts');
	});

	it('fails on a store importing a repository', () => {
		const root = createFixture({
			'src/stores/notificationStore.ts':
				"import { notificationRepository } from '../repositories/notificationRepository';\n",
		});
		roots.push(root);

		const output = runCheckFailure(root);

		expect(output).toContain('store-repository-import');
		expect(output).toContain('src/stores/notificationStore.ts');
	});

	it('fails on a service importing a store', () => {
		const root = createFixture({
			'src/services/badService.ts':
				"import { useInvoiceStore } from '../stores/invoiceStore';\n",
		});
		roots.push(root);

		const output = runCheckFailure(root);

		expect(output).toContain('service-store-import');
		expect(output).toContain('src/services/badService.ts');
	});

	it('passes an existing violation only when the exact baseline key is present', () => {
		const key =
			'app-repository-import|app/(app)/suppliers/index.tsx|@/src/repositories/supplierRepository';
		const root = createFixture(
			{
				'app/(app)/suppliers/index.tsx':
					"import { supplierRepository } from '@/src/repositories/supplierRepository';\n",
			},
			[key],
		);
		roots.push(root);

		expect(runCheck(root)).toContain('1 current violation(s), 1 baselined');
	});
});
