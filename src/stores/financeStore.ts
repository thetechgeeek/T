import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { financeService } from '../services/financeService';
import { eventBus } from '../events/appEvents';
import type { Expense, Purchase, ProfitLossReport as ProfitLossSummary } from '../types/finance';
import { subMonths, format } from 'date-fns';

function defaultDateRange() {
	const now = new Date();
	return {
		startDate: format(subMonths(now, 1), 'yyyy-MM-dd'),
		endDate: format(now, 'yyyy-MM-dd'),
	};
}

interface FinanceState {
	expenses: Expense[];
	purchases: Purchase[];
	summary: ProfitLossSummary | null;
	loading: boolean;
	error: string | null;

	dateRange: {
		startDate: string;
		endDate: string;
	};

	// Actions
	initialize: () => Promise<void>;
	fetchExpenses: (search?: string) => Promise<void>;
	fetchPurchases: () => Promise<void>;
	fetchSummary: () => Promise<void>;
	setDateRange: (start: string, end: string) => void;
	addExpense: (expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
}

export const useFinanceStore = create<FinanceState>()(
	immer((set, get) => ({
		expenses: [],
		purchases: [],
		summary: null,
		loading: false,
		error: null,
		// Lazy date range — calculated when first used, not at module load time
		dateRange: { startDate: '', endDate: '' },

		initialize: async () => {
			// Ensure date range is set before fetching
			if (!get().dateRange.startDate) {
				set((s) => {
					s.dateRange = defaultDateRange();
				});
			}
			set((s) => {
				s.loading = true;
				s.error = null;
			});
			try {
				const [expensesRes, purchasesRes, summaryRes] = await Promise.all([
					financeService.fetchExpenses({
						startDate: get().dateRange.startDate,
						endDate: get().dateRange.endDate,
					}),
					financeService.fetchPurchases({
						startDate: get().dateRange.startDate,
						endDate: get().dateRange.endDate,
					}),
					financeService.getProfitLoss(
						get().dateRange.startDate,
						get().dateRange.endDate,
					),
				]);
				set((s) => {
					s.expenses = expensesRes.data;
					s.purchases = purchasesRes;
					s.summary = summaryRes;
					s.loading = false;
				});
			} catch (err: unknown) {
				set((s) => {
					s.error = (err as Error).message;
					s.loading = false;
				});
			}
		},

		setDateRange: (start, end) => {
			set((state) => {
				state.dateRange = { startDate: start, endDate: end };
			});
			get().initialize();
		},

		fetchExpenses: async (search) => {
			if (!get().dateRange.startDate) {
				set((s) => {
					s.dateRange = defaultDateRange();
				});
			}
			set((s) => {
				s.loading = true;
				s.error = null;
			});
			try {
				const { data } = await financeService.fetchExpenses({
					search,
					startDate: get().dateRange.startDate,
					endDate: get().dateRange.endDate,
				});
				set((s) => {
					s.expenses = data;
					s.loading = false;
				});
			} catch (err: unknown) {
				set((s) => {
					s.error = (err as Error).message;
					s.loading = false;
				});
			}
		},

		fetchPurchases: async () => {
			if (!get().dateRange.startDate) {
				set((s) => {
					s.dateRange = defaultDateRange();
				});
			}
			set((s) => {
				s.loading = true;
				s.error = null;
			});
			try {
				const data = await financeService.fetchPurchases({
					startDate: get().dateRange.startDate,
					endDate: get().dateRange.endDate,
				});
				set((s) => {
					s.purchases = data;
					s.loading = false;
				});
			} catch (err: unknown) {
				set((s) => {
					s.error = (err as Error).message;
					s.loading = false;
				});
			}
		},

		fetchSummary: async () => {
			if (!get().dateRange.startDate) {
				set((s) => {
					s.dateRange = defaultDateRange();
				});
			}
			set((s) => {
				s.loading = true;
				s.error = null;
			});
			try {
				const summary = await financeService.getProfitLoss(
					get().dateRange.startDate,
					get().dateRange.endDate,
				);
				set((s) => {
					s.summary = summary;
					s.loading = false;
				});
			} catch (err: unknown) {
				set((s) => {
					s.error = (err as Error).message;
					s.loading = false;
				});
			}
		},

		addExpense: async (expense) => {
			set((s) => {
				s.loading = true;
				s.error = null;
			});
			try {
				const newExpense = await financeService.createExpense(expense);
				set((s) => {
					s.expenses.unshift(newExpense);
					s.loading = false;
				});
				eventBus.emit({ type: 'EXPENSE_CREATED', expenseId: newExpense.id });
				get().fetchSummary();
			} catch (err: unknown) {
				set((s) => {
					s.error = (err as Error).message;
					s.loading = false;
				});
				throw err;
			}
		},
	})),
);

// Refresh finance data when payment recorded (affects summary)
eventBus.subscribe((event) => {
	if (event.type === 'PAYMENT_RECORDED' || event.type === 'EXPENSE_CREATED') {
		useFinanceStore.getState().fetchSummary();
	}
});
