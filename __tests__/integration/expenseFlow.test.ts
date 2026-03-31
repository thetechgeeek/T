/**
 * INT-008: Expense Flow — real Supabase integration tests.
 * Tests expense CRUD via repository layer.
 * Run with: yarn test:integration
 */
import {
	createTestSupabaseClient,
	testPrefix,
	cleanupByPrefix,
	signInTestUser,
} from '../utils/integrationHelpers';
import { expenseRepository } from '@/src/repositories/expenseRepository';

const supabase = createTestSupabaseClient();
const prefix = testPrefix();

beforeAll(async () => {
	await signInTestUser(supabase);
});

afterAll(async () => {
	await cleanupByPrefix(supabase, prefix);
	await supabase.auth.signOut();
});

describe('INT-008: Expense Flow', () => {
	let expenseId: string;

	it('creates an expense and returns the record', async () => {
		const input = {
			amount: 5000,
			category: 'Rent' as const,
			expense_date: '2026-03-01',
			description: `${prefix}Office rent March`,
		};

		const expense = await expenseRepository.create(input);

		expect(expense.id).toBeTruthy();
		expect(expense.amount).toBe(5000);
		expect(expense.category).toBe('Rent');
		expenseId = expense.id;
	});

	it('findById returns the created expense', async () => {
		const expense = await expenseRepository.findById(expenseId);
		expect(expense.id).toBe(expenseId);
		expect(expense.description).toContain(prefix);
	});

	it('findMany includes the created expense', async () => {
		const result = await expenseRepository.findMany();
		const found = result.data.find((e) => e.id === expenseId);
		expect(found).toBeDefined();
	});

	it('updates expense amount', async () => {
		const updated = await expenseRepository.update(expenseId, { amount: 5500 });
		expect(updated.amount).toBe(5500);
	});

	it('updates expense category', async () => {
		const updated = await expenseRepository.update(expenseId, {
			category: 'Utilities' as const,
		});
		expect(updated.category).toBe('Utilities');
	});

	it('creates expense with notes', async () => {
		const expense = await expenseRepository.create({
			amount: 2000,
			category: 'Transport' as const,
			expense_date: '2026-03-05',
			description: `${prefix}Transport March`,
			notes: 'Delivery to Ahmedabad',
		});

		expect(expense.notes).toBe('Delivery to Ahmedabad');
	});

	it('findMany returns total count ≥ number of test expenses', async () => {
		const result = await expenseRepository.findMany();
		expect(result.total).toBeGreaterThanOrEqual(2);
	});

	it('removes expense successfully', async () => {
		const toDelete = await expenseRepository.create({
			amount: 100,
			category: 'Misc' as const,
			expense_date: '2026-03-10',
			description: `${prefix}Delete me`,
		});

		await expect(expenseRepository.remove(toDelete.id)).resolves.toBeUndefined();
		await expect(expenseRepository.findById(toDelete.id)).rejects.toThrow();
	});
});
