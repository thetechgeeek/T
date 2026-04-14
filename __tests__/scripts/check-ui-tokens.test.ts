import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync } from 'child_process';

const scriptPath = path.join(process.cwd(), 'scripts', 'check-ui-tokens.mjs');

function writeFiles(
	root: string,
	files: Record<string, string>,
	defaultAllowlist = '# Colloquial UI Styling — Allowlist\n\n## Current exceptions\n\nNone.\n',
) {
	for (const [rel, contents] of Object.entries({
		'docs/COLLOQUIAL_UI_ALLOWLIST.md': defaultAllowlist,
		...files,
	})) {
		const abs = path.join(root, rel);
		fs.mkdirSync(path.dirname(abs), { recursive: true });
		fs.writeFileSync(abs, contents);
	}
}

function createFixture(files: Record<string, string>, defaultAllowlist?: string) {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'check-ui-tokens-'));
	writeFiles(root, files, defaultAllowlist);
	return root;
}

function runCheck(root: string, args: string[] = []) {
	return execFileSync(process.execPath, [scriptPath, '--root', root, ...args], {
		encoding: 'utf8',
	});
}

function runCheckFailure(root: string, args: string[] = []) {
	try {
		runCheck(root, args);
		throw new Error('Expected check-ui-tokens to fail.');
	} catch (error) {
		const failure = error as { stdout?: string; stderr?: string };
		return `${failure.stdout ?? ''}${failure.stderr ?? ''}`;
	}
}

function initGit(root: string) {
	execFileSync('git', ['init'], { cwd: root, encoding: 'utf8' });
	execFileSync('git', ['config', 'user.email', 'codex@example.com'], {
		cwd: root,
		encoding: 'utf8',
	});
	execFileSync('git', ['config', 'user.name', 'Codex'], { cwd: root, encoding: 'utf8' });
}

describe('check-ui-tokens', () => {
	const roots: string[] = [];

	afterEach(() => {
		while (roots.length > 0) {
			fs.rmSync(roots.pop() as string, { recursive: true, force: true });
		}
	});

	it('passes for clean UI files and horizontal ScrollView usage', () => {
		const root = createFixture({
			'app/reports.tsx': `
				import React from 'react';
				import { ScrollView, View } from 'react-native';

				export function ReportsScreen() {
					return (
						<View>
							<ScrollView horizontal showsHorizontalScrollIndicator={false} />
						</View>
					);
				}
			`,
			'src/components/atoms/Card.tsx': `
				export const cardStyle = { borderRadius: token.r.md, paddingTop: token.s.sm };
			`,
		});
		roots.push(root);

		expect(runCheck(root)).toContain('check-ui-tokens: OK');
	});

	it('fails on rgba strings, raw UI numbers, and raw zIndex values', () => {
		const root = createFixture({
			'app/bad.tsx': `
				export const styles = {
					card: {
						paddingTop: 12,
						borderRadius: 8,
						backgroundColor: 'rgba(0, 0, 0, 0.2)',
						zIndex: 100,
					},
				};
			`,
		});
		roots.push(root);

		const output = runCheckFailure(root);

		expect(output).toContain('rgba-string');
		expect(output).toContain('raw-ui-number');
		expect(output).toContain('raw-zindex');
		expect(output).toContain('app/bad.tsx');
	});

	it('allows documented vertical ScrollView exceptions from the allowlist', () => {
		const root = createFixture(
			{
				'app/allowed.tsx': `
					import React from 'react';
					import { ScrollView } from 'react-native';

					export function AllowedScreen() {
						return <ScrollView />;
					}
				`,
			},
			[
				'# Colloquial UI Styling — Allowlist',
				'',
				'## Current exceptions',
				'',
				'### `check-ui-tokens` staged exceptions',
				'',
				'- `app/allowed.tsx:5` — `vertical-scrollview` — internal modal body — ref: phase-6-enforcement',
				'',
			].join('\n'),
		);
		roots.push(root);

		expect(runCheck(root)).toContain('check-ui-tokens: OK');
	});

	it('checks only staged files when --staged is used', () => {
		const root = createFixture({
			'app/clean.tsx': 'export const clean = { paddingTop: token.s.sm };',
			'app/unstaged-bad.tsx': 'export const bad = { paddingTop: 16 };',
		});
		roots.push(root);
		initGit(root);

		execFileSync('git', ['add', 'app/clean.tsx', 'docs/COLLOQUIAL_UI_ALLOWLIST.md'], {
			cwd: root,
			encoding: 'utf8',
		});

		expect(runCheck(root, ['--staged'])).toContain('check-ui-tokens: OK');
	});
});
