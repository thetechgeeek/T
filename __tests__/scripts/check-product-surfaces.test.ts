import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync } from 'child_process';

const scriptPath = path.join(process.cwd(), 'scripts', 'check-product-surfaces.mjs');

function createFixture(files: Record<string, string>) {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'check-product-surfaces-'));
	fs.writeFileSync(path.join(root, 'package.json'), '{"name":"fixture"}\n');

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
		execFileSync(process.execPath, [scriptPath, '--root', root, '--json'], {
			encoding: 'utf8',
		});
		throw new Error('Expected product surface check to fail.');
	} catch (error) {
		const failure = error as { stdout?: string; stderr?: string };
		return `${failure.stdout ?? ''}${failure.stderr ?? ''}`;
	}
}

describe('check-product-surfaces', () => {
	const roots: string[] = [];

	afterEach(() => {
		while (roots.length > 0) {
			fs.rmSync(roots.pop() as string, { recursive: true, force: true });
		}
	});

	it('passes explicit unavailable surfaces', () => {
		const root = createFixture({
			'app/(app)/finance/bank-accounts/index.tsx':
				'import { UnavailableProductSurface } from \'@/src/features/productReadiness/UnavailableProductSurface\';\nexport default function Screen() { return <UnavailableProductSurface title="Bank Accounts" area="Finance" />; }\n',
		});
		roots.push(root);

		expect(runCheck(root)).toContain('check-product-surfaces: OK');
	});

	it('fails on coming-soon alerts and fake save success', () => {
		const root = createFixture({
			'app/(app)/reports/index.tsx':
				"Alert.alert('Coming Soon', 'Report is coming soon.');\n",
			'app/(app)/finance/other-income/add.tsx':
				"Alert.alert('Success', 'Income entry saved successfully');\n",
		});
		roots.push(root);

		const output = runCheckFailure(root);

		expect(output).toContain('placeholder-coming-soon-alert');
		expect(output).toContain('fake-save-success');
	});
});
