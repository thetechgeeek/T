import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync } from 'child_process';

const scriptPath = path.join(process.cwd(), 'scripts', 'check-expo-route-collisions.mjs');

function createFixture(files: Record<string, string>) {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'check-expo-route-collisions-'));
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
		runCheck(root);
		throw new Error('Expected route collision check to fail.');
	} catch (error) {
		const failure = error as { stdout?: string; stderr?: string };
		return `${failure.stdout ?? ''}${failure.stderr ?? ''}`;
	}
}

describe('check-expo-route-collisions', () => {
	const roots: string[] = [];

	afterEach(() => {
		while (roots.length > 0) {
			fs.rmSync(roots.pop() as string, { recursive: true, force: true });
		}
	});

	it('passes when route files do not collide with folders', () => {
		const root = createFixture({
			'app/(app)/settings/index.tsx': 'export default function Settings() { return null; }\n',
		});
		roots.push(root);

		expect(runCheck(root)).toContain('check-expo-route-collisions: OK');
	});

	it('fails with structured output when a route file collides with a same-named folder', () => {
		const root = createFixture({
			'app/(app)/settings.tsx': 'export default function Settings() { return null; }\n',
			'app/(app)/settings/index.tsx':
				'export default function SettingsIndex() { return null; }\n',
		});
		roots.push(root);

		const output = runCheckFailure(root);

		expect(output).toContain('expo-route-collision');
		expect(output).toContain('app/(app)/settings.tsx');
		expect(output).toContain('app/(app)/settings/');
	});
});
