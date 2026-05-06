import { execFileSync } from 'child_process';
import path from 'path';

const root = process.cwd();
const toolingScript = path.join(root, 'scripts', 'tooling.mjs');

describe('platform tooling entrypoint', () => {
	it('lists consolidated commands as machine-readable JSON', () => {
		const output = execFileSync(process.execPath, [toolingScript, '--list'], {
			cwd: root,
			encoding: 'utf8',
		});

		const commands = JSON.parse(output);
		expect(commands['check:routes']).toMatchObject({
			script: 'check-expo-route-collisions.mjs',
		});
		expect(commands['check:product-surfaces']).toMatchObject({
			script: 'check-product-surfaces.mjs',
		});
		expect(commands['e2e:maestro']).toMatchObject({
			script: 'run-maestro-suite.mjs',
		});
	});

	it('supports dry-run dispatch without executing the child script', () => {
		const output = execFileSync(
			process.execPath,
			[toolingScript, '--dry-run', 'check:routes', '--json'],
			{
				cwd: root,
				encoding: 'utf8',
			},
		);

		expect(JSON.parse(output)).toMatchObject({
			ok: true,
			dryRun: true,
			command: 'check:routes',
			script: 'scripts/check-expo-route-collisions.mjs',
			args: ['--json'],
		});
	});
});
