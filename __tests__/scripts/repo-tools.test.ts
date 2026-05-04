import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync } from 'child_process';
import { pathToFileURL } from 'url';

const moduleUrl = pathToFileURL(path.join(process.cwd(), 'scripts', 'lib', 'repo-tools.mjs')).href;

function runRepoToolsSnippet(source: string) {
	return execFileSync(
		process.execPath,
		[
			'--input-type=module',
			'-e',
			[`import * as tools from ${JSON.stringify(moduleUrl)};`, source].join('\n'),
		],
		{ encoding: 'utf8' },
	).trim();
}

describe('repo-tools shared script helpers', () => {
	const roots: string[] = [];

	afterEach(() => {
		while (roots.length > 0) {
			fs.rmSync(roots.pop() as string, { recursive: true, force: true });
		}
	});

	function makeRoot() {
		const root = fs.mkdtempSync(path.join(os.tmpdir(), 'repo-tools-'));
		roots.push(root);
		fs.writeFileSync(path.join(root, 'package.json'), '{"name":"fixture"}\n');
		return root;
	}

	it('resolves the repository root from a nested working directory', () => {
		const root = makeRoot();
		const nested = path.join(root, 'a', 'b', 'c');
		fs.mkdirSync(nested, { recursive: true });

		expect(
			runRepoToolsSnippet(`console.log(tools.findRepoRoot(${JSON.stringify(nested)}));`),
		).toBe(root);
	});

	it('parses boolean, string, negated, alias, and positional CLI args', () => {
		const output = runRepoToolsSnippet(`
			const result = tools.parseCliArgs(
				['--root', '/tmp/project', '--json', '--no-cache', '--dry-run=true', 'app'],
				{
					boolean: ['json', 'cache'],
					string: ['root'],
					aliases: { root: 'repoRoot' },
				},
			);
			console.log(JSON.stringify(result));
		`);

		expect(JSON.parse(output)).toEqual({
			flags: {
				repoRoot: '/tmp/project',
				json: true,
				cache: false,
				'dry-run': 'true',
			},
			positionals: ['app'],
		});
	});

	it('walks files with extension filtering and ignored directories', () => {
		const root = makeRoot();
		fs.mkdirSync(path.join(root, 'src'), { recursive: true });
		fs.mkdirSync(path.join(root, 'node_modules', 'pkg'), { recursive: true });
		fs.writeFileSync(path.join(root, 'src', 'a.ts'), '');
		fs.writeFileSync(path.join(root, 'src', 'b.md'), '');
		fs.writeFileSync(path.join(root, 'node_modules', 'pkg', 'c.ts'), '');

		const output = runRepoToolsSnippet(`
			console.log(JSON.stringify(tools.walkFiles(${JSON.stringify(root)}, { extensions: ['.ts'] })));
		`);

		expect(JSON.parse(output)).toEqual(['src/a.ts']);
	});

	it('formats structured violation output for human and JSON consumers', () => {
		const output = runRepoToolsSnippet(`
			const violation = tools.createViolation({
				file: 'app/example.tsx',
				line: 12,
				rule: 'example-rule',
				message: 'Use the shared helper.',
			});
			console.log(JSON.stringify({
				formatted: tools.formatViolations([violation]),
				report: tools.toViolationReport('example', [violation]),
			}));
		`);

		expect(JSON.parse(output)).toEqual({
			formatted: 'error app/example.tsx:12 example-rule Use the shared helper.',
			report: {
				name: 'example',
				status: 'failed',
				violations: [
					{
						file: 'app/example.tsx',
						line: 12,
						rule: 'example-rule',
						message: 'Use the shared helper.',
						severity: 'error',
					},
				],
			},
		});
	});

	it('throws a structured error for missing prerequisite tools', () => {
		const emptyPath = fs.mkdtempSync(path.join(os.tmpdir(), 'repo-tools-empty-path-'));
		roots.push(emptyPath);

		const output = runRepoToolsSnippet(`
			try {
				tools.assertToolAvailable('definitely-not-installed-for-this-test', {
					pathEnv: ${JSON.stringify(emptyPath)},
				});
			} catch (error) {
				console.log(error.name + ':' + error.message);
			}
		`);

		expect(output).toContain('ToolingError:Missing prerequisite tool');
	});
});
