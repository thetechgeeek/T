import { makeBuilder } from './helpers';
import { supabase } from '../../config/supabase';
import { makeExpense } from '../../../../__tests__/fixtures/financeFixtures';

jest.mock('../../config/supabase', () => ({
	supabase: {
		from: jest.fn(),
		rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
	},
}));

import { expenseRepository } from '../expenseRepository';

const mockFrom = supabase.from as jest.Mock;

beforeEach(() => {
	jest.clearAllMocks();
});

describe('expenseRepository.create', () => {
	it('calls from(expenses).insert(payload).select().single() and returns saved expense', async () => {
		const expense = makeExpense();
		const builder = makeBuilder({}, { data: expense, error: null });
		mockFrom.mockReturnValue(builder);

		const input = { category: 'Transport', amount: 500, expense_date: '2026-01-15', notes: '' };
		const result = await expenseRepository.create(input as any);

		expect(mockFrom).toHaveBeenCalledWith('expenses');
		expect(builder.insert).toHaveBeenCalledWith(input);
		expect(builder.select).toHaveBeenCalled();
		expect(builder.single).toHaveBeenCalled();
		expect(result).toHaveProperty('id');
	});
});

describe('expenseRepository.findMany — filter variations', () => {
	it('calls ilike-style search via or() when search columns are provided', async () => {
		const builder = makeBuilder({ data: [], count: 0, error: null });
		mockFrom.mockReturnValue(builder);

		await expenseRepository.findMany({
			search: { columns: ['category'], term: 'Transport' },
		});

		expect(builder.or).toHaveBeenCalledWith(expect.stringContaining('%Transport%'));
	});

	it('applies gte(expense_date) and lte(expense_date) when date range filter given', async () => {
		const builder = makeBuilder({ data: [], count: 0, error: null });
		mockFrom.mockReturnValue(builder);

		await expenseRepository.findMany({
			filters: { expense_date: { gte: '2026-01-01', lte: '2026-01-31' } },
		});

		expect(builder.gte).toHaveBeenCalledWith('expense_date', '2026-01-01');
		expect(builder.lte).toHaveBeenCalledWith('expense_date', '2026-01-31');
	});

	it('returns { data, total } with correct shape from mock data', async () => {
		const expenses = [makeExpense()];
		const builder = makeBuilder({ data: expenses, count: 1, error: null });
		mockFrom.mockReturnValue(builder);

		const result = await expenseRepository.findMany({});

		expect(result.data).toEqual(expenses);
		expect(result.total).toBe(1);
	});
});
