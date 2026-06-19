import { createClient } from '@supabase/supabase-js';
import scriptConfig from './lib/script-config.cjs';

const { resolveTestSeedEnv } = scriptConfig;
export const seedEnv = resolveTestSeedEnv({
	envFilePath: '.env.test',
	env: process.env,
});

export const seedFixtures = {
	businessProfile: {
		business_name: 'EasyStock Seeded Test Business',
		invoice_prefix: 'SEED',
		invoice_sequence: 0,
	},
	customers: [
		{
			name: 'Seeded Customer Alpha',
			phone: '9876500001',
			city: 'Morbi',
			state: 'Gujarat',
			type: 'dealer',
		},
		{
			name: 'Seeded Customer Beta',
			phone: '9876500002',
			city: 'Rajkot',
			state: 'Gujarat',
			type: 'retail',
		},
	],
	inventoryItems: [
		{
			design_name: 'GLOSSY WHITE 60x60',
			base_item_number: 'SEED-GLOSSY-001',
			category: 'GLOSSY',
			size_name: '60x60',
			box_count: 60,
			has_batch_tracking: false,
			has_serial_tracking: false,
			selling_price: 1000,
			cost_price: 700,
			gst_rate: 18,
			hsn_code: '6908',
			low_stock_threshold: 8,
		},
		{
			design_name: 'MARBLE GOLD 60x120',
			base_item_number: 'SEED-MARBLE-002',
			category: 'MATT',
			size_name: '60x120',
			box_count: 40,
			has_batch_tracking: false,
			has_serial_tracking: false,
			selling_price: 1350,
			cost_price: 900,
			gst_rate: 18,
			hsn_code: '6908',
			low_stock_threshold: 5,
		},
		{
			design_name: 'SATIN SAND 60x60',
			base_item_number: 'SEED-SATIN-003',
			category: 'SATIN',
			size_name: '60x60',
			box_count: 18,
			has_batch_tracking: false,
			has_serial_tracking: false,
			selling_price: 950,
			cost_price: 650,
			gst_rate: 18,
			hsn_code: '6908',
			low_stock_threshold: 6,
		},
	],
	seedInvoiceNote: 'seed:e2e-unpaid-invoice',
};

function requiredEnv(name) {
	const value = seedEnv[name];
	if (!value) {
		throw new Error(`Missing ${name} in .env.test or CI secrets.`);
	}
	return value;
}

export function createAdminClient() {
	return createClient(
		requiredEnv('SUPABASE_TEST_URL'),
		requiredEnv('SUPABASE_TEST_SERVICE_ROLE_KEY'),
		{
			auth: {
				autoRefreshToken: false,
				persistSession: false,
			},
		},
	);
}

export function hasServiceRoleKey() {
	return Boolean(seedEnv.SUPABASE_TEST_SERVICE_ROLE_KEY);
}

export function createTestClient() {
	return createClient(requiredEnv('SUPABASE_TEST_URL'), requiredEnv('SUPABASE_TEST_ANON_KEY'), {
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	});
}

export async function signInIntegrationUser(client) {
	const email = requiredEnv('INTEGRATION_TEST_EMAIL');
	const password = requiredEnv('INTEGRATION_TEST_PASSWORD');
	const { error } = await client.auth.signInWithPassword({ email, password });

	if (error) {
		throw new Error(`Failed to sign in integration test user: ${error.message}`);
	}
}

async function resolveIntegrationUserId(adminClient) {
	const email = requiredEnv('INTEGRATION_TEST_EMAIL').trim().toLowerCase();
	const perPage = 1000;

	for (let page = 1; page <= 10; page += 1) {
		const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage });

		if (error) {
			throw new Error(`Failed reading Supabase auth users: ${error.message}`);
		}

		const user = data?.users?.find((candidate) => candidate.email?.toLowerCase() === email);
		if (user?.id) {
			return user.id;
		}

		if ((data?.users?.length ?? 0) < perPage) {
			break;
		}
	}

	throw new Error(`Integration test user ${email} was not found in Supabase auth users.`);
}

async function runDelete(client, tableName) {
	const { error } = await client
		.from(tableName)
		.delete()
		.neq('id', '00000000-0000-0000-0000-000000000000');

	if (error) {
		throw new Error(`Failed clearing ${tableName}: ${error.message}`);
	}
}

async function upsertSeedBusinessProfile(client) {
	const { data: existingProfiles, error: fetchError } = await client
		.from('business_profile')
		.select('id')
		.order('created_at', { ascending: true })
		.limit(1);

	if (fetchError) {
		throw new Error(`Failed reading business profile: ${fetchError.message}`);
	}

	const existingProfile = existingProfiles?.[0];

	if (existingProfile?.id) {
		const { error: updateError } = await client
			.from('business_profile')
			.update(seedFixtures.businessProfile)
			.eq('id', existingProfile.id);

		if (updateError) {
			throw new Error(`Failed updating business profile: ${updateError.message}`);
		}

		return existingProfile.id;
	}

	const { data: insertedProfile, error: profileError } = await client
		.from('business_profile')
		.insert(seedFixtures.businessProfile)
		.select('id')
		.single();

	if (profileError || !insertedProfile) {
		throw new Error(
			`Failed seeding business profile: ${profileError?.message ?? 'No profile row returned'}`,
		);
	}

	return insertedProfile.id;
}

async function ensureSeedBusinessMembership(adminClient, businessId) {
	const userId = await resolveIntegrationUserId(adminClient);
	const { error } = await adminClient.from('business_memberships').upsert(
		{
			business_id: businessId,
			user_id: userId,
			role: 'owner',
		},
		{ onConflict: 'business_id,user_id' },
	);

	if (error) {
		throw new Error(`Failed seeding business membership: ${error.message}`);
	}

	return { businessId, userId };
}

function todayIsoDate() {
	return new Date().toISOString().slice(0, 10);
}

export async function resetSeedData(adminClient) {
	await runDelete(adminClient, 'invoice_line_items');
	await runDelete(adminClient, 'payments');
	await runDelete(adminClient, 'invoices');
	await runDelete(adminClient, 'stock_operations');
	await runDelete(adminClient, 'customers');
	await runDelete(adminClient, 'inventory_items');
	const businessId = await upsertSeedBusinessProfile(adminClient);

	if (hasServiceRoleKey()) {
		await ensureSeedBusinessMembership(adminClient, businessId);
	}

	const customers = seedFixtures.customers.map((customer) => ({
		...customer,
		business_id: businessId,
	}));
	const inventoryItems = seedFixtures.inventoryItems.map((item) => ({
		...item,
		business_id: businessId,
	}));

	const { data: seededCustomers, error: customerError } = await adminClient
		.from('customers')
		.upsert(customers, {
			onConflict: 'phone',
		})
		.select();

	if (customerError || !seededCustomers) {
		throw new Error(
			`Failed seeding customers: ${customerError?.message ?? 'No customer rows returned'}`,
		);
	}

	const { data: seededInventory, error: inventoryError } = await adminClient
		.from('inventory_items')
		.upsert(inventoryItems, {
			onConflict: 'design_name',
		})
		.select();

	if (inventoryError || !seededInventory) {
		throw new Error(
			`Failed seeding inventory items: ${inventoryError?.message ?? 'No inventory rows returned'}`,
		);
	}

	const primaryCustomer = seededCustomers.find(
		(customer) => customer.name === seedFixtures.customers[0].name,
	);
	const primaryItem = seededInventory.find(
		(item) => item.design_name === seedFixtures.inventoryItems[0].design_name,
	);

	if (!primaryCustomer || !primaryItem) {
		throw new Error('Seed reset could not resolve the primary customer or inventory fixture.');
	}

	const { data: seededInvoice, error: invoiceError } = await adminClient.rpc(
		'create_invoice_with_items_v1',
		{
			p_invoice: {
				customer_id: primaryCustomer.id,
				customer_name: primaryCustomer.name,
				customer_phone: primaryCustomer.phone,
				invoice_date: todayIsoDate(),
				subtotal: 5000,
				cgst_total: 0,
				sgst_total: 0,
				igst_total: 0,
				discount_total: 0,
				grand_total: 5000,
				is_inter_state: false,
				payment_status: 'unpaid',
				amount_paid: 0,
				notes: seedFixtures.seedInvoiceNote,
			},
			p_line_items: [
				{
					item_id: primaryItem.id,
					design_name: primaryItem.design_name,
					quantity: 5,
					rate_per_unit: 1000,
					taxable_amount: 5000,
					line_total: 5000,
					gst_rate: 0,
					cgst_amount: 0,
					sgst_amount: 0,
					igst_amount: 0,
					discount: 0,
					sort_order: 0,
				},
			],
		},
	);

	if (invoiceError || !seededInvoice) {
		throw new Error(
			`Failed seeding unpaid invoice: ${invoiceError?.message ?? 'No invoice returned'}`,
		);
	}

	return {
		customers: seededCustomers.length,
		inventoryItems: seededInventory.length,
		invoiceId: seededInvoice.id,
		invoiceNumber: seededInvoice.invoice_number,
	};
}

export async function verifySeedData(client) {
	await signInIntegrationUser(client);

	const [profileResult, customersResult, inventoryResult, invoiceResult] = await Promise.all([
		client
			.from('business_profile')
			.select('business_name, invoice_prefix')
			.limit(1)
			.maybeSingle(),
		client
			.from('customers')
			.select('id, name')
			.in(
				'name',
				seedFixtures.customers.map((customer) => customer.name),
			),
		client
			.from('inventory_items')
			.select('id, design_name')
			.in(
				'design_name',
				seedFixtures.inventoryItems.map((item) => item.design_name),
			),
		client
			.from('invoices')
			.select('id, invoice_number, customer_name, payment_status, notes')
			.eq('notes', seedFixtures.seedInvoiceNote)
			.limit(1)
			.maybeSingle(),
	]);

	if (profileResult.error || !profileResult.data) {
		throw new Error(
			`Seed verification failed for business profile: ${profileResult.error?.message ?? 'Missing profile'}`,
		);
	}

	if (profileResult.data.business_name !== seedFixtures.businessProfile.business_name) {
		throw new Error('Seed verification found an unexpected business profile.');
	}

	if (
		customersResult.error ||
		(customersResult.data?.length ?? 0) < seedFixtures.customers.length
	) {
		throw new Error(
			`Seed verification failed for customers: ${customersResult.error?.message ?? 'Missing customer fixtures'}`,
		);
	}

	if (
		inventoryResult.error ||
		(inventoryResult.data?.length ?? 0) < seedFixtures.inventoryItems.length
	) {
		throw new Error(
			`Seed verification failed for inventory fixtures: ${inventoryResult.error?.message ?? 'Missing inventory fixtures'}`,
		);
	}

	if (invoiceResult.error || !invoiceResult.data) {
		throw new Error(
			`Seed verification failed for invoice fixture: ${invoiceResult.error?.message ?? 'Missing unpaid invoice fixture'}`,
		);
	}

	return {
		profile: profileResult.data,
		customers: customersResult.data.length,
		inventoryItems: inventoryResult.data.length,
		invoice: invoiceResult.data,
	};
}
