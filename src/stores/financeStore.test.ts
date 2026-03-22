import { useFinanceStore } from './financeStore';
import { financeService } from '../services/financeService';

jest.mock('../services/financeService', () => ({
  financeService: {
    fetchExpenses: jest.fn(),
    fetchPurchases: jest.fn(),
    getProfitLoss: jest.fn(),
    createExpense: jest.fn(),
  }
}));

describe('financeStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useFinanceStore.setState({
      expenses: [],
      purchases: [],
      summary: null,
      loading: false,
      error: null,
      dateRange: { startDate: '2026-02-22', endDate: '2026-03-22' }
    });
  });

  it('fetchExpenses updates store', async () => {
    const mockExpenses = [{ id: '1', amount: 100, category: 'Food' }];
    (financeService.fetchExpenses as jest.Mock).mockResolvedValue({ data: mockExpenses, count: 1 });

    await useFinanceStore.getState().fetchExpenses('Food');

    const state = useFinanceStore.getState();
    expect(state.expenses).toEqual(mockExpenses);
    expect(state.loading).toBe(false);
  });

  it('addExpense adds to list and refreshes summary', async () => {
    const newExpense = { amount: 50, category: 'Tools', expense_date: '2026-03-22' };
    const savedExpense = { id: '2', ...newExpense };
    (financeService.createExpense as jest.Mock).mockResolvedValue(savedExpense);
    (financeService.getProfitLoss as jest.Mock).mockResolvedValue({ net_profit: -50 } as any);

    await useFinanceStore.getState().addExpense(newExpense);

    const state = useFinanceStore.getState();
    expect(state.expenses[0]).toEqual(savedExpense);
    expect(financeService.getProfitLoss).toHaveBeenCalled();
  });
});
