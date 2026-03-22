import { orderService } from './orderService';
import { supabase } from '@/src/config/supabase';
import { inventoryService } from './inventoryService';

// Mock query object
const mockQuery: any = {
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  range: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
  then: jest.fn((resolve) => resolve({ data: [], error: null })),
};

jest.mock('@/src/config/supabase', () => ({
  supabase: {
    from: jest.fn(() => mockQuery),
  }
}));

jest.mock('./inventoryService', () => ({
  inventoryService: {
    performStockOperation: jest.fn(),
  }
}));

describe('orderService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchOrders', () => {
    it('calls supabase with correct query', async () => {
      mockQuery.then.mockImplementation((resolve: any) => resolve({ data: [{ id: '1' }], error: null }));
      const result = await orderService.fetchOrders({ status: 'ordered' });
      
      expect(supabase.from).toHaveBeenCalledWith('orders');
      expect(mockQuery.eq).toHaveBeenCalledWith('status', 'ordered');
      expect(result).toHaveLength(1);
    });
  });

  describe('importOrder', () => {
    it('creates order and processes items', async () => {
      const partyName = 'Test Party';
      const items = [{ design_name: 'Marble', box_count: 10, price_per_box: 100 }];
      
      // Mock order creation
      mockQuery.single.mockResolvedValueOnce({ data: { id: 'order-123' }, error: null });
      
      // Mock item search (item exists)
      mockQuery.then.mockImplementation((resolve: any) => resolve({ data: [{ id: 'item-1' }], error: null }));

      await orderService.importOrder(partyName, items as any, {});

      expect(supabase.from).toHaveBeenCalledWith('orders');
      expect(inventoryService.performStockOperation).toHaveBeenCalledWith(
        'item-1',
        'stock_in',
        10,
        expect.stringContaining('order-123'),
        'purchase',
        'order-123'
      );
    });
  });
});
