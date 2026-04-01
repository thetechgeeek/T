import { useFinanceStore } from './financeStore';
import { financeService } from '../services/financeService';
import { eventBus } from '../events/appEvents';
import type { ProfitLossReport } from '../types/finance';

jest.mock('../services/financeService', () => ({
	financeService: {
		fetchExpenses: jest.fn(),
		fetchPurchases: jest.fn(),
		getProfitLoss: jest.fn(),
		createExpense: jest.fn(),
	},
}));

const mockSummary: ProfitLossReport = {
	total_revenue: 10000,
	total_expenses: 3000,
	total_cogs: 5000,
	gross_profit: 5000,
	net_profit: 2000,
	period_start: '2026-02-22',
	period_end: '2026-03-22',
} as unknown as ProfitLossReport;

function resetStore() {
	useFinanceStore.setState({
		expenses: [],
		purchases: [],
		summary: null,
		loading: false,
		error: null,
		dateRange: { startDate: '2026-02-22', endDate: '2026-03-22' },
	});
}

describe('financeStore', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		resetStore();
	});

	// ─── fetchExpenses ────────────────────────────────────────────────────────
	it('fetchExpenses updates expenses in store', async () => {
		const mockExpenses = [{ id: '1', amount: 100, category: 'Food' }];
		(financeService.fetchExpenses as jest.Mock).mockResolvedValue({
			data: mockExpenses,
			count: 1,
		});

		await useFinanceStore.getState().fetchExpenses('Food');

		const state = useFinanceStore.getState();
		expect(state.expenses).toEqual(mockExpenses);
		expect(state.loading).toBe(false);
	});

	it('fetchExpenses initialises dateRange when empty then fetches', async () => {
		useFinanceStore.setState({ dateRange: { startDate: '', endDate: '' } });
		(financeService.fetchExpenses as jest.Mock).mockResolvedValue({ data: [], count: 0 });

		await useFinanceStore.getState().fetchExpenses();

		const state = useFinanceStore.getState();
		expect(state.dateRange.startDate).not.toBe('');
		expect(financeService.fetchExpenses).toHaveBeenCalled();
	});

	it('fetchExpenses failure sets error', async () => {
		(financeService.fetchExpenses as jest.Mock).mockRejectedValue(new Error('Fetch failed'));

		try {
			await useFinanceStore.getState().fetchExpenses();
		} catch {
			// may rethrow
		}

		const state = useFinanceStore.getState();
		expect(state.error).toBeTruthy();
		expect(state.loading).toBe(false);
	});

	// ─── fetchPurchases ───────────────────────────────────────────────────────
	it('fetchPurchases success updates purchases', async () => {
		(financeService.fetchPurchases as jest.Mock).mockResolvedValue([]);

		await useFinanceStore.getState().fetchPurchases();

		const state = useFinanceStore.getState();
		expect(state.purchases).toEqual([]);
		expect(state.loading).toBe(false);
	});

	it('fetchPurchases initialises dateRange when empty', async () => {
		useFinanceStore.setState({ dateRange: { startDate: '', endDate: '' } });
		(financeService.fetchPurchases as jest.Mock).mockResolvedValue([]);

		await useFinanceStore.getState().fetchPurchases();

		expect(useFinanceStore.getState().dateRange.startDate).not.toBe('');
	});

	it('fetchPurchases failure sets error', async () => {
		(financeService.fetchPurchases as jest.Mock).mockRejectedValue(new Error('Buy error'));

		try {
			await useFinanceStore.getState().fetchPurchases();
		} catch {
			// may rethrow
		}

		expect(useFinanceStore.getState().error).toBeTruthy();
	});

	// ─── fetchSummary ─────────────────────────────────────────────────────────
	it('fetchSummary updates summary', async () => {
		(financeService.getProfitLoss as jest.Mock).mockResolvedValue(mockSummary);

		await useFinanceStore.getState().fetchSummary();

		expect(useFinanceStore.getState().summary).toEqual(mockSummary);
		expect(useFinanceStore.getState().loading).toBe(false);
	});

	it('fetchSummary initialises dateRange when empty', async () => {
		useFinanceStore.setState({ dateRange: { startDate: '', endDate: '' } });
		(financeService.getProfitLoss as jest.Mock).mockResolvedValue(mockSummary);

		await useFinanceStore.getState().fetchSummary();

		expect(useFinanceStore.getState().dateRange.startDate).not.toBe('');
	});

	it('fetchSummary failure sets error', async () => {
		(financeService.getProfitLoss as jest.Mock).mockRejectedValue(new Error('Summary error'));

		try {
			await useFinanceStore.getState().fetchSummary();
		} catch {
			/* noop */
		}

		expect(useFinanceStore.getState().error).toBeTruthy();
	});

	// ─── addExpense ───────────────────────────────────────────────────────────
	it('addExpense adds to list and refreshes summary', async () => {
		const newExpense = { amount: 50, category: 'Tools', expense_date: '2026-03-22' };
		const savedExpense = { id: '2', ...newExpense };
		(financeService.createExpense as jest.Mock).mockResolvedValue(savedExpense);
		(financeService.getProfitLoss as jest.Mock).mockResolvedValue(mockSummary);

		await useFinanceStore.getState().addExpense(newExpense);

		const state = useFinanceStore.getState();
		expect(state.expenses[0]).toEqual(savedExpense);
		expect(financeService.getProfitLoss).toHaveBeenCalled();
	});

	it('addExpense failure sets error and leaves expenses unchanged', async () => {
		(financeService.createExpense as jest.Mock).mockRejectedValue(new Error('Create failed'));

		try {
			await useFinanceStore
				.getState()
				.addExpense({ amount: 50, category: 'Tools', expense_date: '2026-03-22' });
		} catch {
			// may rethrow
		}

		const state = useFinanceStore.getState();
		expect(state.error).toBeTruthy();
		expect(state.expenses).toEqual([]);
	});

	it('addExpense emits EXPENSE_CREATED event on success', async () => {
		const savedExpense = {
			id: 'exp-1',
			amount: 100,
			category: 'Misc',
			expense_date: '2026-03-22',
		};
		(financeService.createExpense as jest.Mock).mockResolvedValue(savedExpense);
		(financeService.getProfitLoss as jest.Mock).mockResolvedValue(mockSummary);

		const handler = jest.fn();
		const unsub = eventBus.subscribe(handler);
		await useFinanceStore
			.getState()
			.addExpense({ amount: 100, category: 'Misc', expense_date: '2026-03-22' });
		unsub();

		expect(handler).toHaveBeenCalledWith(
			expect.objectContaining({ type: 'EXPENSE_CREATED', expenseId: 'exp-1' }),
		);
	});

	// ─── initialize ───────────────────────────────────────────────────────────
	it('initialize fetches expenses, purchases, and summary in parallel', async () => {
		(financeService.fetchExpenses as jest.Mock).mockResolvedValue({ data: [], count: 0 });
		(financeService.fetchPurchases as jest.Mock).mockResolvedValue([]);
		(financeService.getProfitLoss as jest.Mock).mockResolvedValue(mockSummary);

		await useFinanceStore.getState().initialize();

		expect(financeService.fetchExpenses).toHaveBeenCalled();
		expect(financeService.fetchPurchases).toHaveBeenCalled();
		expect(financeService.getProfitLoss).toHaveBeenCalled();
		expect(useFinanceStore.getState().loading).toBe(false);
	});

	it('initialize sets dateRange when currently empty', async () => {
		useFinanceStore.setState({ dateRange: { startDate: '', endDate: '' } });
		(financeService.fetchExpenses as jest.Mock).mockResolvedValue({ data: [], count: 0 });
		(financeService.fetchPurchases as jest.Mock).mockResolvedValue([]);
		(financeService.getProfitLoss as jest.Mock).mockResolvedValue(mockSummary);

		await useFinanceStore.getState().initialize();

		expect(useFinanceStore.getState().dateRange.startDate).not.toBe('');
	});

	it('initialize error sets error state', async () => {
		(financeService.fetchExpenses as jest.Mock).mockRejectedValue(new Error('Init error'));
		(financeService.fetchPurchases as jest.Mock).mockResolvedValue([]);
		(financeService.getProfitLoss as jest.Mock).mockResolvedValue(mockSummary);

		await useFinanceStore.getState().initialize();

		expect(useFinanceStore.getState().error).toBeTruthy();
	});

	// ─── setDateRange ─────────────────────────────────────────────────────────
	it('setDateRange updates dateRange and triggers initialize', async () => {
		(financeService.fetchExpenses as jest.Mock).mockResolvedValue({ data: [], count: 0 });
		(financeService.fetchPurchases as jest.Mock).mockResolvedValue([]);
		(financeService.getProfitLoss as jest.Mock).mockResolvedValue(mockSummary);

		useFinanceStore.getState().setDateRange('2026-01-01', '2026-01-31');

		expect(useFinanceStore.getState().dateRange).toEqual({
			startDate: '2026-01-01',
			endDate: '2026-01-31',
		});
		await new Promise((r) => setTimeout(r, 0));
		expect(financeService.fetchExpenses).toHaveBeenCalled();
	});

	// ─── event-driven refresh ─────────────────────────────────────────────────
	it('refreshes summary when PAYMENT_RECORDED event emitted', async () => {
		(financeService.getProfitLoss as jest.Mock).mockResolvedValue(mockSummary);

		eventBus.emit({ type: 'PAYMENT_RECORDED', paymentId: 'pay-1', invoiceId: 'inv-1' });

		await new Promise((r) => setTimeout(r, 0));
		expect(financeService.getProfitLoss).toHaveBeenCalled();
	});

	it('refreshes summary when EXPENSE_CREATED event emitted', async () => {
		(financeService.getProfitLoss as jest.Mock).mockResolvedValue(mockSummary);

		eventBus.emit({ type: 'EXPENSE_CREATED', expenseId: 'exp-1' });

		await new Promise((r) => setTimeout(r, 0));
		expect(financeService.getProfitLoss).toHaveBeenCalled();
	});
});
