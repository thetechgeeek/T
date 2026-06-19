import {
	createAdminClient,
	createTestClient,
	hasServiceRoleKey,
	seedEnv,
	seedFixtures,
	resetSeedData,
	signInIntegrationUser,
} from './test-seed.shared.mjs';
import {
	emitDestructiveOperationLog,
	verifyDestructiveOperationTarget,
} from './lib/destructive-ops.mjs';

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
const destructiveTables = [
	'invoice_line_items',
	'payments',
	'invoices',
	'stock_operations',
	'customers',
	'inventory_items',
];

const target = await verifyDestructiveOperationTarget({
	argv: process.argv.slice(2),
	env: seedEnv,
	dryRun,
	operationName: 'test seed reset',
});

emitDestructiveOperationLog({
	ok: true,
	action: 'test:seed:reset:target-verified',
	dryRun,
	mode,
	target: {
		mode: target.mode,
		projectRef: target.projectRef,
		urlEnvName: target.urlEnvName,
		supabaseUrl: target.supabaseUrl,
	},
	tables: destructiveTables,
});

if (dryRun) {
	emitDestructiveOperationLog({
		ok: true,
		dryRun: true,
		action: 'test:seed:reset',
		mode,
		wouldResetTables: destructiveTables,
		fixtures: {
			customers: seedFixtures.customers.length,
			inventoryItems: seedFixtures.inventoryItems.length,
			createsUnpaidInvoice: true,
		},
	});
	process.exit(0);
}

const resolved = await resolveSeedClient();
const summary = await resetSeedData(resolved.client);

emitDestructiveOperationLog({
	ok: true,
	action: 'test:seed:reset',
	mode: resolved.mode,
	target: {
		mode: target.mode,
		projectRef: target.projectRef,
		urlEnvName: target.urlEnvName,
		supabaseUrl: target.supabaseUrl,
	},
	summary,
});
