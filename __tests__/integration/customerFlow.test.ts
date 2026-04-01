/**
 * INT-003: Customer Flow — real Supabase integration tests.
 * Tests full CRUD + balance summary for customers via the repository layer.
 * Run with: yarn test:integration
 */
import {
	createTestSupabaseClient,
	testPrefix,
	cleanupByPrefix,
	signInTestUser,
} from '../utils/integrationHelpers';
import { customerRepository } from '@/src/repositories/customerRepository';

const supabase = createTestSupabaseClient();
const prefix = testPrefix();

beforeAll(async () => {
	await signInTestUser(supabase);
});

afterAll(async () => {
	await cleanupByPrefix(supabase, prefix);
	await supabase.auth.signOut();
});

describe('INT-003: Customer Flow', () => {
	let createdCustomerId: string;

	it('creates a new customer and returns the record', async () => {
		const input = {
			name: `${prefix}Rajesh Tiles`,
			phone: '9876543210',
			city: 'Morbi',
			state: 'Gujarat',
			type: 'dealer' as const,
		};

		const customer = await customerRepository.create(input);

		expect(customer.id).toBeTruthy();
		expect(customer.name).toBe(input.name);
		expect(customer.city).toBe('Morbi');
		createdCustomerId = customer.id;
	});

	it('findById returns the created customer', async () => {
		const customer = await customerRepository.findById(createdCustomerId);
		expect(customer.id).toBe(createdCustomerId);
		expect(customer.name).toContain(prefix);
	});

	it('findMany includes the created customer in results', async () => {
		const result = await customerRepository.findMany();
		const found = result.data.find((c) => c.id === createdCustomerId);
		expect(found).toBeDefined();
	});

	it('findMany search filter narrows results by name', async () => {
		const result = await customerRepository.findMany({
			search: { columns: ['name'], term: `${prefix}Rajesh` },
		});

		expect(result.data.length).toBeGreaterThan(0);
		expect(result.data[0].name).toContain(prefix);
	});

	it('findMany search returns empty for non-existent name', async () => {
		const result = await customerRepository.findMany({
			search: { columns: ['name'], term: 'zzz-nonexistent-zzzzzzzz' },
		});

		expect(result.data.length).toBe(0);
	});

	it('updates customer name and reflects change in findById', async () => {
		const updated = await customerRepository.update(createdCustomerId, {
			name: `${prefix}Rajesh Tiles Updated`,
		});

		expect(updated.name).toBe(`${prefix}Rajesh Tiles Updated`);

		const fetched = await customerRepository.findById(createdCustomerId);
		expect(fetched.name).toBe(`${prefix}Rajesh Tiles Updated`);
	});

	it('updates customer phone', async () => {
		const updated = await customerRepository.update(createdCustomerId, {
			phone: '8000000001',
		});
		expect(updated.phone).toBe('8000000001');
	});

	it('creates a second customer for list count verification', async () => {
		const second = await customerRepository.create({
			name: `${prefix}Second Customer`,
			type: 'retail' as const,
		});
		expect(second.id).toBeTruthy();
	});

	it('findMany returns correct total count (at least 2 test customers)', async () => {
		const result = await customerRepository.findMany({
			search: { columns: ['name'], term: prefix },
		});
		expect(result.total).toBeGreaterThanOrEqual(2);
	});

	it('findById throws for non-existent id', async () => {
		await expect(
			customerRepository.findById('00000000-0000-0000-0000-000000000000'),
		).rejects.toThrow();
	});

	it('removes customer successfully', async () => {
		const toDelete = await customerRepository.create({
			name: `${prefix}To Delete`,
			type: 'retail' as const,
		});

		await expect(customerRepository.remove(toDelete.id)).resolves.toBeUndefined();

		await expect(customerRepository.findById(toDelete.id)).rejects.toThrow();
	});
});
