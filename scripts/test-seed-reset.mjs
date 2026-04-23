import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import {
	createAdminClient,
	createTestClient,
	resetSeedData,
	signInIntegrationUser,
} from './test-seed.shared.mjs';

const execFileAsync = promisify(execFile);

function getProjectRef() {
	const url = process.env.SUPABASE_TEST_URL;
	if (!url) {
		return null;
	}

	try {
		return new URL(url).hostname.split('.')[0] ?? null;
	} catch {
		return null;
	}
}

async function hydrateServiceRoleKeyFromSupabaseCli() {
	const projectRef = getProjectRef();
	if (!projectRef || process.env.SUPABASE_TEST_SERVICE_ROLE_KEY) {
		return false;
	}

	try {
		const shell = process.env.SHELL || '/bin/zsh';
		const { stdout } = await execFileAsync(
			shell,
			[
				'-lc',
				`source ~/.nvm/nvm.sh && npx supabase projects api-keys --project-ref ${projectRef} --output json`,
			],
			{ maxBuffer: 1024 * 1024 * 8 },
		);
		const keys = JSON.parse(stdout);
		const serviceRoleKey = keys.find((entry) => entry?.name === 'service_role')?.api_key;

		if (!serviceRoleKey) {
			return false;
		}

		process.env.SUPABASE_TEST_SERVICE_ROLE_KEY = serviceRoleKey;
		return true;
	} catch {
		return false;
	}
}

async function resolveSeedClient() {
	if (process.env.SUPABASE_TEST_SERVICE_ROLE_KEY) {
		return { client: createAdminClient(), mode: 'service_role_env' };
	}

	if (await hydrateServiceRoleKeyFromSupabaseCli()) {
		return { client: createAdminClient(), mode: 'service_role_cli' };
	}

	const testClient = createTestClient();
	await signInIntegrationUser(testClient);
	return { client: testClient, mode: 'authenticated_fallback' };
}

const { client, mode } = await resolveSeedClient();
const summary = await resetSeedData(client);

console.log(
	JSON.stringify(
		{
			ok: true,
			action: 'test:seed:reset',
			mode,
			summary,
		},
		null,
		2,
	),
);
