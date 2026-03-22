import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { financeService, type Expense, type Purchase, type ProfitLossSummary } from '../services/financeService';
import { subMonths, format } from 'date-fns';

interface FinanceState {
  expenses: Expense[];
  purchases: Purchase[];
  summary: ProfitLossSummary | null;
  loading: boolean;
  error: string | null;
  
  // Filters
  dateRange: {
    startDate: string;
    endDate: string;
  };
  
  // Actions
  fetchExpenses: (search?: string) => Promise<void>;
  fetchPurchases: () => Promise<void>;
  fetchSummary: () => Promise<void>;
  setDateRange: (start: string, end: string) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'created_at'>) => Promise<void>;
}

export const useFinanceStore = create<FinanceState>()(
  immer((set, get) => ({
    expenses: [],
    purchases: [],
    summary: null,
    loading: false,
    error: null,
    dateRange: {
      startDate: format(subMonths(new Date(), 1), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd'),
    },

    setDateRange: (start, end) => {
      set((state) => {
        state.dateRange = { startDate: start, endDate: end };
      });
      get().fetchSummary();
    },

    fetchExpenses: async (search) => {
      set((s) => { s.loading = true; s.error = null; });
      try {
        const { data } = await financeService.fetchExpenses({
          search,
          startDate: get().dateRange.startDate,
          endDate: get().dateRange.endDate
        });
        set((s) => {
          s.expenses = data;
          s.loading = false;
        });
      } catch (err: any) {
        set((s) => { s.error = err.message; s.loading = false; });
      }
    },

    fetchPurchases: async () => {
      set((s) => { s.loading = true; s.error = null; });
      try {
        const data = await financeService.fetchPurchases({
          startDate: get().dateRange.startDate,
          endDate: get().dateRange.endDate
        });
        set((s) => {
          s.purchases = data;
          s.loading = false;
        });
      } catch (err: any) {
        set((s) => { s.error = err.message; s.loading = false; });
      }
    },

    fetchSummary: async () => {
      set((s) => { s.loading = true; s.error = null; });
      try {
        const summary = await financeService.getProfitLoss(
          get().dateRange.startDate,
          get().dateRange.endDate
        );
        set((s) => {
          s.summary = summary;
          s.loading = false;
        });
      } catch (err: any) {
        set((s) => { s.error = err.message; s.loading = false; });
      }
    },

    addExpense: async (expense) => {
      set((s) => { s.loading = true; s.error = null; });
      try {
        const newExpense = await financeService.createExpense(expense);
        set((s) => {
          s.expenses.unshift(newExpense);
          s.loading = false;
        });
        get().fetchSummary();
      } catch (err: any) {
        set((s) => { s.error = err.message; s.loading = false; });
        throw err;
      }
    }
  }))
);
