import { useInventoryStore } from '@/src/stores/inventoryStore';
import { useDashboardStore } from '@/src/stores/dashboardStore'; // IMPORTED
import { dashboardService } from '@/src/services/dashboardService';
import { inventoryService } from '@/src/services/inventoryService';
import { makeInventoryItem } from '../fixtures/inventoryFixtures';
import { waitFor } from '@testing-library/react-native';

// Mock only the Supabase network boundary (as per Phase 12 requirement)
jest.mock('@/src/config/supabase', () => {
	const { createSupabaseMock } = require('../utils/supabaseMock');
	return {
		supabase: createSupabaseMock(),
	};
});

// Access the mock instance
const { supabase: mockSupabase } = require('@/src/config/supabase');

describe('Stock Operation Flow Integration', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		useInventoryStore.getState().reset();
		useDashboardStore.getState(); // Initialize
	});

	it('completes the full call chain for stock operation', async () => {
		const itemId = 'b5b5b5b5-b5b5-4b5b-8b5b-b5b5b5b5b5b5';

		// Mock RPC response
		mockSupabase.rpc.mockResolvedValue({
			data: { new_box_count: 60 },
			error: null,
		});

		// Mock fetchItemById (called after performStockOperation to refresh state)
		const mockItem = makeInventoryItem({ id: itemId, box_count: 60 });
		const fetchSpy = jest.spyOn(inventoryService, 'fetchItemById');
		fetchSpy.mockResolvedValue(mockItem);

		// Seed store with initial item
		useInventoryStore.setState((s) => {
			s.items = [makeInventoryItem({ id: itemId, box_count: 50 })];
		});

		await useInventoryStore.getState().performStockOperation(itemId, 'stock_in', 10, 'Arrival');

		// 1. Verify RPC call with correct params
		expect(mockSupabase.rpc).toHaveBeenCalledWith(
			'perform_stock_operation_v1',
			expect.objectContaining({
				p_item_id: itemId,
				p_operation_type: 'stock_in',
				p_quantity_change: 10,
				p_reason: 'Arrival',
			}),
		);

		// 2. Verify Store state was updated
		expect(useInventoryStore.getState().items[0].box_count).toBe(60);
	});

	it('triggers cross-store refreshes via eventBus after stock change', async () => {
		const itemId = 'b5b5b5b5-b5b5-4b5b-8b5b-b5b5b5b5b5b5';
		mockSupabase.rpc.mockResolvedValue({ data: {}, error: null });
		jest.spyOn(inventoryService, 'fetchItemById').mockResolvedValue(
			makeInventoryItem({ id: itemId }),
		);

		// Spy on dashboard service
		const dashboardSpy = jest.spyOn(dashboardService, 'fetchDashboardStats');
		dashboardSpy.mockResolvedValue({} as any);

		// Spy on inventoryService.fetchItems (called by store listener)
		const fetchItemsSpy = jest.spyOn(inventoryService, 'fetchItems');
		fetchItemsSpy.mockResolvedValue({ data: [], count: 0 });

		await useInventoryStore.getState().performStockOperation(itemId, 'stock_in', 5);

		// Verify refreshes triggered by STOCK_CHANGED event
		await waitFor(() => {
			expect(dashboardSpy).toHaveBeenCalled();
			expect(fetchItemsSpy).toHaveBeenCalled();
		});
	});
});
