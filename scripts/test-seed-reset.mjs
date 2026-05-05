import {
	createAdminClient,
	createTestClient,
	hasServiceRoleKey,
	seedFixtures,
	resetSeedData,
	signInIntegrationUser,
} from './test-seed.shared.mjs';

async function resolveSeedClient() {
	if (hasServiceRoleKey()) {
		return { client: createAdminClient(), mode: 'service_role_env' };
	}

	const testClient = createTestClient();
	await signInIntegrationUser(testClient);
	return { client: testClient, mode: 'authenticated_fallback' };
}

const dryRun = process.argv.includes('--dry-run');
const mode = hasServiceRoleKey() ? 'service_role_env' : 'authenticated_fallback';

if (dryRun) {
	console.log(
		JSON.stringify(
			{
				ok: true,
				dryRun: true,
				action: 'test:seed:reset',
				mode,
				wouldResetTables: [
					'invoice_line_items',
					'payments',
					'invoices',
					'stock_operations',
					'customers',
					'inventory_items',
					'business_profile',
				],
				fixtures: {
					customers: seedFixtures.customers.length,
					inventoryItems: seedFixtures.inventoryItems.length,
					createsUnpaidInvoice: true,
				},
			},
			null,
			2,
		),
	);
	process.exit(0);
}

const resolved = await resolveSeedClient();
const summary = await resetSeedData(resolved.client);

console.log(
	JSON.stringify(
		{
			ok: true,
			action: 'test:seed:reset',
			mode: resolved.mode,
			summary,
		},
		null,
		2,
	),
);
