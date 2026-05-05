import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync } from 'child_process';
import { pathToFileURL } from 'url';

const moduleUrl = pathToFileURL(
	path.join(process.cwd(), 'scripts', 'lib', 'destructive-ops.mjs'),
).href;

function runSnippet(source: string) {
	return execFileSync(
		process.execPath,
		[
			'--input-type=module',
			'-e',
			[`import * as ops from ${JSON.stringify(moduleUrl)};`, source].join('\n'),
		],
		{ encoding: 'utf8' },
	).trim();
}

describe('destructive operation guards', () => {
	const roots: string[] = [];

	afterEach(() => {
		while (roots.length > 0) {
			fs.rmSync(roots.pop() as string, { recursive: true, force: true });
		}
	});

	it('extracts Supabase project refs from remote and local URLs', () => {
		const output = runSnippet(`
			console.log(JSON.stringify([
				ops.extractSupabaseProjectRef('https://abc123.supabase.co'),
				ops.extractSupabaseProjectRef('http://127.0.0.1:54321'),
			]));
		`);

		expect(JSON.parse(output)).toEqual(['abc123', 'local']);
	});

	it('blocks production-like destructive targets', () => {
		const output = runSnippet(`
			try {
				ops.assertNotProductionLikeTarget({
					mode: 'production',
					projectRef: 'abc123',
					supabaseUrl: 'https://abc123.supabase.co',
					urlEnvName: 'SUPABASE_TEST_URL',
				});
			} catch (error) {
				console.log(error.name + ':' + error.message);
			}
		`);

		expect(output).toContain('DestructiveOperationError:Refusing destructive operation');
	});

	it('requires remote Supabase projects to be allowlisted', () => {
		const output = runSnippet(`
			const target = {
				mode: 'integration',
				projectRef: 'abc123',
				supabaseUrl: 'https://abc123.supabase.co',
				urlEnvName: 'SUPABASE_TEST_URL',
			};
			const allowed = (() => {
				ops.assertProjectAllowed({
					target,
					env: { SUPABASE_TEST_PROJECT_REF_ALLOWLIST: 'abc123' },
				});
				return true;
			})();
			let blocked = '';
			try {
				ops.assertProjectAllowed({ target, env: {} });
			} catch (error) {
				blocked = error.name;
			}
			console.log(JSON.stringify({ allowed, blocked }));
		`);

		expect(JSON.parse(output)).toEqual({
			allowed: true,
			blocked: 'DestructiveOperationError',
		});
	});

	it('prevents cleanup outside explicit artifact roots', () => {
		const root = fs.mkdtempSync(path.join(os.tmpdir(), 'destructive-ops-'));
		roots.push(root);
		const allowed = path.join(root, 'artifacts', 'safe');
		const outside = path.join(root, 'outside');
		fs.mkdirSync(allowed, { recursive: true });
		fs.mkdirSync(outside, { recursive: true });

		const output = runSnippet(`
			try {
				ops.assertPathWithinRoots(${JSON.stringify(outside)}, [${JSON.stringify(allowed)}], 'diffDir');
			} catch (error) {
				console.log(error.name + ':' + error.details.label);
			}
		`);

		expect(output).toBe('DestructiveOperationError:diffDir');
	});
});
