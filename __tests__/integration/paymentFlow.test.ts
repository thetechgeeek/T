/**
 * INT-006: Payment Flow — real Supabase integration tests.
 * Tests payment recording against real Supabase via paymentRepository.
 * Run with: yarn test:integration
 */
import {
	createTestSupabaseClient,
	testPrefix,
	cleanupByPrefix,
	signInTestUser,
} from '../utils/integrationHelpers';
import { customerRepository } from '@/src/repositories/customerRepository';
import { paymentRepository } from '@/src/repositories/paymentRepository';

const supabase = createTestSupabaseClient();
const prefix = testPrefix();

let customerId: string;

beforeAll(async () => {
	await signInTestUser(supabase);
	// Create a test customer to attach payments to
	const customer = await customerRepository.create({
		name: `${prefix}Payment Test Customer`,
		type: 'retail' as const,
	});
	customerId = customer.id;
});

afterAll(async () => {
	await cleanupByPrefix(supabase, prefix);
	await supabase.auth.signOut();
});

describe('INT-006: Payment Flow', () => {
	let paymentId: string;

	it('creates a payment record and returns it', async () => {
		const input = {
			customer_id: customerId,
			amount: 5000,
			payment_mode: 'cash' as const,
			direction: 'received' as const,
			payment_date: '2026-03-15',
			notes: `${prefix}payment March`,
		};

		const payment = await paymentRepository.create(input);

		expect(payment.id).toBeTruthy();
		expect(payment.amount).toBe(5000);
		expect(payment.customer_id).toBe(customerId);
		paymentId = payment.id;
	});

	it('findById returns the created payment', async () => {
		const payment = await paymentRepository.findById(paymentId);
		expect(payment.id).toBe(paymentId);
		expect(payment.amount).toBe(5000);
	});

	it('findMany includes the created payment', async () => {
		const result = await paymentRepository.findMany();
		const found = result.data.find((p) => p.id === paymentId);
		expect(found).toBeDefined();
	});

	it('creates a second payment for the same customer', async () => {
		const payment2 = await paymentRepository.create({
			customer_id: customerId,
			amount: 3000,
			payment_mode: 'upi' as const,
			direction: 'received' as const,
			payment_date: '2026-03-20',
			notes: `${prefix}payment March second`,
		});

		expect(payment2.id).toBeTruthy();
		expect(payment2.payment_mode).toBe('upi');
	});

	it('findMany returns total count ≥ 2 for test payments', async () => {
		const result = await paymentRepository.findMany({
			filters: { customer_id: customerId },
		});
		expect(result.total).toBeGreaterThanOrEqual(2);
	});

	it('updates payment amount', async () => {
		const updated = await paymentRepository.update(paymentId, { amount: 5500 });
		expect(updated.amount).toBe(5500);
	});

	it('removes payment successfully', async () => {
		const toDelete = await paymentRepository.create({
			customer_id: customerId,
			amount: 100,
			payment_mode: 'cash' as const,
			direction: 'received' as const,
			payment_date: '2026-03-25',
			notes: `${prefix}delete me`,
		});

		await expect(paymentRepository.remove(toDelete.id)).resolves.toBeUndefined();
		await expect(paymentRepository.findById(toDelete.id)).rejects.toThrow();
	});

	it('throws for non-existent payment id', async () => {
		await expect(
			paymentRepository.findById('00000000-0000-0000-0000-000000000000'),
		).rejects.toThrow();
	});

	it('payment_mode accepts bank_transfer', async () => {
		const payment = await paymentRepository.create({
			customer_id: customerId,
			amount: 2000,
			payment_mode: 'bank_transfer' as const,
			direction: 'received' as const,
			payment_date: '2026-03-28',
			notes: `${prefix}bank transfer`,
		});

		expect(payment.payment_mode).toBe('bank_transfer');
	});
});
