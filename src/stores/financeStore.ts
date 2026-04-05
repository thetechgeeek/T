import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { financeService } from '../services/financeService';
import { eventBus } from '../events/appEvents';
import type { Expense, Purchase, ProfitLossReport as ProfitLossSummary } from '../types/finance';

// Returns the current Indian financial year range (April 1 – March 31)
function defaultDateRange() {
	const now = new Date();
	const year = now.getFullYear();
	const month = now.getMonth() + 1; // 1-based
	const fyStartYear = month >= 4 ? year : year - 1;
	return {
		startDate: `${fyStartYear}-04-01`,
		endDate: `${fyStartYear + 1}-03-31`,
	};
}

export interface FinanceState {
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
	reset: () => void;
}

export const useFinanceStore = create<FinanceState>()(
	persist(
		immer((set, get) => ({
			expenses: [],
			purchases: [],
			summary: null,
			loading: false,
			error: null,
			// Lazy date range — calculated when first used, not at module load time
			dateRange: { startDate: '', endDate: '' },

			initialize: async () => {
				if (get().loading) return;

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
				if (get().loading) return;

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
				if (get().loading) return;

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
				if (get().loading) return;

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

			reset: () => {
				set((s) => {
					s.expenses = [];
					s.purchases = [];
					s.summary = null;
					s.loading = false;
					s.error = null;
					s.dateRange = { startDate: '', endDate: '' };
				});
			},
		})),
		{
			name: 'finance-storage',
			storage: createJSONStorage(() => AsyncStorage),
			// Persist the date range so the financial year filter survives app restarts.
			// Expenses and purchases are cached to avoid a blank screen on cold start.
			// Summary (P&L) is intentionally excluded — always re-fetched from DB.
			partialize: (state: FinanceState) => ({
				dateRange: state.dateRange,
				expenses: state.expenses,
				purchases: state.purchases,
			}),
		},
	),
);

// Refresh finance data when relevant business events occur.
// PAYMENT_RECORDED: refresh both the P&L summary AND the expenses list so the
//   finance screen doesn't show stale data after a payment.
// EXPENSE_CREATED: fetchSummary is already called inside addExpense(); the
//   event handler here covers any external triggers.
eventBus.subscribe((event) => {
	if (event.type === 'PAYMENT_RECORDED') {
		const store = useFinanceStore.getState();
		store.fetchSummary();
		store.fetchExpenses();
	} else if (event.type === 'EXPENSE_CREATED') {
		useFinanceStore.getState().fetchSummary();
	}
});
