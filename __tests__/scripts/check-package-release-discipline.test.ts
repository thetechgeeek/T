import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync } from 'child_process';

const scriptPath = path.join(process.cwd(), 'scripts', 'check-package-release-discipline.mjs');

function writeFiles(root: string, files: Record<string, string>) {
	for (const [rel, contents] of Object.entries(files)) {
		const abs = path.join(root, rel);
		fs.mkdirSync(path.dirname(abs), { recursive: true });
		fs.writeFileSync(abs, contents);
	}
}

function createFixture(overrides: Record<string, string> = {}) {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'check-package-release-discipline-'));
	writeFiles(root, {
		'docs/UI_PACKAGE_RELEASE_DISCIPLINE.md': [
			'# UI Package Release Discipline',
			'',
			'- Semantic Versioning',
			'- CHANGELOG.md',
			'- MIGRATIONS.md',
			'- deprecation',
			'- consumer apps',
			'- compatibility',
			'',
		].join('\n'),
		'src/design-system/package.json': JSON.stringify(
			{
				name: '@easydesign/design-system',
				version: '0.1.0',
				files: ['README.md', 'CHANGELOG.md', 'MIGRATIONS.md'],
			},
			null,
			2,
		),
		'src/design-system/README.md': '@easydesign/design-system\n',
		'src/design-system/CHANGELOG.md': '# Changelog\n\n## 0.1.0\n',
		'src/design-system/MIGRATIONS.md':
			'@/src/design-system -> @easydesign/design-system\nTwo minor releases\n',
		'src/ui-shell/package.json': JSON.stringify(
			{
				name: '@easydesign/ui-shell',
				version: '0.1.0',
				files: ['README.md', 'CHANGELOG.md', 'MIGRATIONS.md'],
			},
			null,
			2,
		),
		'src/ui-shell/README.md': '@easydesign/ui-shell\n',
		'src/ui-shell/CHANGELOG.md': '# Changelog\n\n## 0.1.0\n',
		'src/ui-shell/MIGRATIONS.md':
			'@/src/ui-shell -> @easydesign/ui-shell\nTwo minor releases\n',
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
		throw new Error('Expected check-package-release-discipline to fail.');
	} catch (error) {
		const failure = error as { stdout?: string; stderr?: string };
		return `${failure.stdout ?? ''}${failure.stderr ?? ''}`;
	}
}

describe('check-package-release-discipline', () => {
	const roots: string[] = [];

	afterEach(() => {
		while (roots.length > 0) {
			fs.rmSync(roots.pop() as string, { recursive: true, force: true });
		}
	});

	it('passes when package release artifacts are present and versioned', () => {
		const root = createFixture();
		roots.push(root);

		expect(runCheck(root)).toContain('"status": "ok"');
	});

	it('fails when the changelog does not mention the current package version', () => {
		const root = createFixture({
			'src/ui-shell/CHANGELOG.md': '# Changelog\n\n## 0.0.9\n',
		});
		roots.push(root);

		const output = runCheckFailure(root);

		expect(output).toContain('changelog-version-heading');
		expect(output).toContain('src/ui-shell/CHANGELOG.md');
	});
});
