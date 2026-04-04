import { financeService } from './financeService';
import { supabase } from '../config/supabase';
import { makeExpense } from '../../__tests__/fixtures/financeFixtures';

// Mock query object
const mockQuery: Record<string, jest.Mock> = {
	select: jest.fn().mockReturnThis(),
	insert: jest.fn().mockReturnThis(),
	ilike: jest.fn().mockReturnThis(),
	gte: jest.fn().mockReturnThis(),
	lte: jest.fn().mockReturnThis(),
	order: jest.fn().mockReturnThis(),
	single: jest.fn().mockReturnThis(),
	eq: jest.fn().mockReturnThis(),
	then: jest.fn((resolve: (val: unknown) => void) =>
		resolve({ data: [], error: null, count: 0 }),
	),
};

jest.mock('../config/supabase', () => ({
	supabase: {
		from: jest.fn(() => mockQuery),
		rpc: jest.fn().mockReturnValue({
			single: jest.fn().mockResolvedValue({ data: null, error: null }),
		}),
	},
}));

describe('financeService', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockQuery.then.mockImplementation((resolve: (val: unknown) => void) =>
			resolve({ data: [], error: null, count: 0 }),
		);
	});

	describe('fetchExpenses', () => {
		it('calls supabase with correct filters', async () => {
			const filters = { search: 'Office', startDate: '2026-01-01', endDate: '2026-02-01' };
			await financeService.fetchExpenses(filters);

			expect(supabase.from).toHaveBeenCalledWith('expenses');
			expect(mockQuery.ilike).toHaveBeenCalledWith('category', '%Office%');
			expect(mockQuery.gte).toHaveBeenCalledWith('expense_date', '2026-01-01');
			expect(mockQuery.lte).toHaveBeenCalledWith('expense_date', '2026-02-01');
		});

		it('returns { data, count } from the mock data', async () => {
			const expenses = [makeExpense()];
			mockQuery.then.mockImplementationOnce((resolve: (val: unknown) => void) =>
				resolve({ data: expenses, error: null, count: 1 }),
			);

			const result = await financeService.fetchExpenses({});

			expect(result.data).toEqual(expenses);
			expect(result.count).toBe(1);
		});

		it('error path: rejects when supabase returns an error', async () => {
			mockQuery.then.mockImplementationOnce((resolve: (val: unknown) => void) =>
				resolve({ data: null, error: { message: 'DB error' }, count: null }),
			);

			await expect(financeService.fetchExpenses({})).rejects.toBeDefined();
		});
	});

	describe('fetchPurchases', () => {
		it('queries the purchases table with no filters by default', async () => {
			mockQuery.then.mockImplementationOnce((resolve: (val: unknown) => void) =>
				resolve({ data: [], error: null }),
			);

			await financeService.fetchPurchases({});

			expect(supabase.from).toHaveBeenCalledWith('purchases');
		});

		it('applies eq(supplier_id) when supplierId filter is set', async () => {
			mockQuery.then.mockImplementationOnce((resolve: (val: unknown) => void) =>
				resolve({ data: [], error: null }),
			);

			await financeService.fetchPurchases({ supplierId: 'supp-uuid-001' });

			expect(mockQuery.eq).toHaveBeenCalledWith('supplier_id', 'supp-uuid-001');
		});
	});

	describe('createExpense', () => {
		it('calls from(expenses).insert(data).select().single()', async () => {
			const expense = makeExpense();
			mockQuery.single.mockResolvedValueOnce({ data: expense, error: null });

			const result = await financeService.createExpense({
				category: 'Transport',
				amount: 500,
				expense_date: '2026-01-15',
				notes: '',
			});

			expect(supabase.from).toHaveBeenCalledWith('expenses');
			expect(mockQuery.insert).toHaveBeenCalled();
			expect(result).toHaveProperty('id');
		});

		it('returns saved expense with id', async () => {
			const expense = makeExpense();
			mockQuery.single.mockResolvedValueOnce({ data: expense, error: null });

			const result = await financeService.createExpense({
				category: 'Fuel',
				amount: 300,
				expense_date: '2026-01-10',
				notes: '',
			});

			expect(result.id).toBeDefined();
		});

		it('error path: rejects when supabase returns an error', async () => {
			mockQuery.single.mockResolvedValueOnce({
				data: null,
				error: { message: 'insert failed' },
			});

			await expect(
				financeService.createExpense({
					category: 'Fuel',
					amount: 300,
					expense_date: '2026-01-10',
					notes: '',
				}),
			).rejects.toBeDefined();
		});
	});

	describe('getProfitLoss', () => {
		it('calls get_profit_loss RPC with correct params', async () => {
			const mockSummary = { total_revenue: 1000, net_profit: 200, total_expenses: 50 };
			(supabase.rpc as jest.Mock).mockReturnValue({
				single: jest.fn().mockResolvedValue({ data: mockSummary, error: null }),
			});

			const result = await financeService.getProfitLoss('2026-01-01', '2026-01-31');

			expect(supabase.rpc).toHaveBeenCalledWith('get_profit_loss_v1', {
				p_start: '2026-01-01',
				p_end: '2026-01-31',
			});
			expect(result).toEqual(mockSummary);
		});

		it('throws ValidationError for invalid date range (start > end)', async () => {
			await expect(
				financeService.getProfitLoss('2026-12-31', '2026-01-01'),
			).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
		});

		it('handles null data from RPC by returning default zero summary', async () => {
			(supabase.rpc as jest.Mock).mockReturnValue({
				single: jest.fn().mockResolvedValue({ data: null, error: null }),
			});

			const result = await financeService.getProfitLoss('2026-01-01', '2026-01-31');
			expect(result).toMatchObject({
				total_revenue: 0,
				total_expenses: 0,
				net_profit: 0,
			});
		});
	});
});
