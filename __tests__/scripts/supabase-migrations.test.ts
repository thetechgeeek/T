import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';

const root = process.cwd();
const migrationCheckScript = path.join(root, 'scripts', 'check-supabase-migrations.mjs');

describe('supabase migration naming check', () => {
	const roots: string[] = [];

	afterEach(() => {
		while (roots.length > 0) {
			fs.rmSync(roots.pop() as string, { recursive: true, force: true });
		}
	});

	function makeMigrationDir(files: string[]) {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'supabase-migrations-'));
		roots.push(dir);
		for (const file of files) {
			fs.writeFileSync(path.join(dir, file), '-- fixture\n');
		}
		return dir;
	}

	it('passes the current repository migrations while documenting the legacy 015 duplicate', () => {
		const result = spawnSync(
			process.execPath,
			[migrationCheckScript, '--migrations-dir', 'supabase/migrations', '--json'],
			{
				cwd: root,
				encoding: 'utf8',
			},
		);

		expect(result.status).toBe(0);
		expect(JSON.parse(result.stdout)).toMatchObject({
			name: 'supabase-migrations',
			status: 'ok',
		});
	});

	it('fails future duplicate prefixes that are not explicitly legacy-allowed', () => {
		const dir = makeMigrationDir([
			'029_first_change.sql',
			'029_second_change.sql',
			'030_next_change.sql',
		]);
		const result = spawnSync(
			process.execPath,
			[migrationCheckScript, '--migrations-dir', dir, '--json'],
			{
				cwd: root,
				encoding: 'utf8',
			},
		);

		expect(result.status).toBe(1);
		expect(JSON.parse(result.stdout)).toMatchObject({
			status: 'failed',
			violations: [
				expect.objectContaining({
					rule: 'supabase-migration-prefix',
					message: expect.stringContaining('Duplicate migration prefix 029'),
				}),
			],
		});
	});

	it('fails migration names outside the numeric-prefix convention', () => {
		const dir = makeMigrationDir(['next_change.sql']);
		const result = spawnSync(
			process.execPath,
			[migrationCheckScript, '--migrations-dir', dir, '--json'],
			{
				cwd: root,
				encoding: 'utf8',
			},
		);

		expect(result.status).toBe(1);
		expect(JSON.parse(result.stdout)).toMatchObject({
			violations: [expect.objectContaining({ rule: 'supabase-migration-name' })],
		});
	});
});
