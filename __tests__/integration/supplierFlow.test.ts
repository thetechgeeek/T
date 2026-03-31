/**
 * INT-002 (partial): Supplier Flow — real Supabase integration tests.
 * Tests supplier CRUD via supplierRepository.
 * Run with: yarn test:integration
 */
import {
	createTestSupabaseClient,
	testPrefix,
	cleanupByPrefix,
	signInTestUser,
} from '../utils/integrationHelpers';
import { supplierRepository } from '@/src/repositories/supplierRepository';

const supabase = createTestSupabaseClient();
const prefix = testPrefix();

beforeAll(async () => {
	await signInTestUser(supabase);
});

afterAll(async () => {
	await cleanupByPrefix(supabase, prefix);
	await supabase.auth.signOut();
});

describe('INT-Supplier: Supplier CRUD Flow', () => {
	let supplierId: string;

	it('creates a supplier and returns the record', async () => {
		const input = {
			name: `${prefix}Kajaria Tiles Ltd`,
			phone: '9876543210',
			city: 'Morbi',
			payment_terms: '30 days',
		};

		const supplier = await supplierRepository.create(input);

		expect(supplier.id).toBeTruthy();
		expect(supplier.name).toBe(input.name);
		supplierId = supplier.id;
	});

	it('findById returns the created supplier', async () => {
		const supplier = await supplierRepository.findById(supplierId);
		expect(supplier.id).toBe(supplierId);
		expect(supplier.name).toContain(prefix);
	});

	it('findMany includes the created supplier', async () => {
		const result = await supplierRepository.findMany();
		const found = result.data.find((s) => s.id === supplierId);
		expect(found).toBeDefined();
	});

	it('findMany search filter returns matching supplier', async () => {
		const result = await supplierRepository.findMany({
			search: { columns: ['name'], term: `${prefix}Kajaria` },
		});
		expect(result.data.length).toBeGreaterThan(0);
		expect(result.data[0].name).toContain(prefix);
	});

	it('updates supplier payment_terms', async () => {
		const updated = await supplierRepository.update(supplierId, { payment_terms: '15 days' });
		expect(updated.payment_terms).toBe('15 days');
	});

	it('updates supplier phone', async () => {
		const updated = await supplierRepository.update(supplierId, { phone: '8000000099' });
		expect(updated.phone).toBe('8000000099');
	});

	it('findById after update returns updated fields', async () => {
		const supplier = await supplierRepository.findById(supplierId);
		expect(supplier.phone).toBe('8000000099');
		expect(supplier.payment_terms).toBe('15 days');
	});

	it('throws for non-existent supplier id', async () => {
		await expect(
			supplierRepository.findById('00000000-0000-0000-0000-000000000000'),
		).rejects.toThrow();
	});

	it('removes supplier successfully', async () => {
		const toDelete = await supplierRepository.create({
			name: `${prefix}Delete Supplier`,
			phone: '7000000001',
		});

		await expect(supplierRepository.remove(toDelete.id)).resolves.toBeUndefined();
		await expect(supplierRepository.findById(toDelete.id)).rejects.toThrow();
	});

	it('total count is a non-negative number', async () => {
		const result = await supplierRepository.findMany();
		expect(result.total).toBeGreaterThanOrEqual(0);
	});
});
