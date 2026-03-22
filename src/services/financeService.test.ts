import { financeService } from './financeService';
import { supabase } from '../config/supabase';

// Mock query object
const mockQuery: any = {
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  ilike: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
  lte: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
  then: jest.fn((resolve) => resolve({ data: [], error: null, count: 0 })),
};

jest.mock('../config/supabase', () => ({
  supabase: {
    from: jest.fn(() => mockQuery),
    rpc: jest.fn(),
  }
}));

describe('financeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery.then.mockImplementation((resolve: any) => resolve({ data: [], error: null, count: 0 }));
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
  });

  describe('getProfitLoss', () => {
    it('calls get_profit_loss RPC with correct params', async () => {
      const mockSummary = { total_sales: 1000, net_profit: 200 };
      (supabase.rpc as jest.Mock).mockResolvedValue({ data: mockSummary, error: null });

      const result = await financeService.getProfitLoss('2026-01-01', '2026-01-31');

      expect(supabase.rpc).toHaveBeenCalledWith('get_profit_loss', {
        p_start: '2026-01-01',
        p_end: '2026-01-31'
      });
      expect(result).toEqual(mockSummary);
    });
  });
});
