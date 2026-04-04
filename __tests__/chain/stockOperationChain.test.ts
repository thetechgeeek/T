import { useInventoryStore } from '@/src/stores/inventoryStore';
import { supabase } from '@/src/config/supabase';
import { eventBus } from '@/src/events/appEvents';
import { createSupabaseMock } from '../utils/supabaseMock';

// 1. Mock supabase (prefixed with 'mock' to allow hoisting)
jest.mock('@/src/config/supabase', () => {
	const { createSupabaseMock } = jest.requireActual('../utils/supabaseMock');
	return {
		supabase: createSupabaseMock(),
	};
});

const mockSupabase = jest.requireMock('@/src/config/supabase').supabase;

describe('Stock Operation Chain (Mocked DB)', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		useInventoryStore.getState().reset();
	});

	it('completes the full chain: RPC then fetch updated item', async () => {
		const itemId = '11111111-1111-1111-1111-111111111111';
		const itemBefore = { id: itemId, design_name: 'Tile A', box_count: 50 };

		// Seed store
		useInventoryStore.setState({ items: [itemBefore] as any });

		// Setup mocks
		mockSupabase.rpc.mockResolvedValueOnce({ data: 60, error: null });

		mockSupabase.from.mockReturnValue({
			select: jest.fn().mockReturnThis(),
			eq: jest.fn().mockReturnThis(),
			single: jest.fn().mockResolvedValue({
				data: { ...itemBefore, box_count: 60 },
				error: null,
			}),
		} as any);

		const emitSpy = jest.spyOn(eventBus, 'emit');

		// 2. Trigger
		await useInventoryStore.getState().performStockOperation(itemId, 'stock_in', 10, 'Restock');

		// 3. Assertions
		expect(mockSupabase.rpc).toHaveBeenCalledWith('perform_stock_operation_v1', {
			p_item_id: itemId,
			p_operation_type: 'stock_in',
			p_quantity_change: 10,
			p_reason: 'Restock',
			p_reference_id: null,
			p_reference_type: null,
		});

		const state = useInventoryStore.getState();
		expect(state.items[0].box_count).toBe(60);
		expect(emitSpy).toHaveBeenCalledWith({ type: 'STOCK_CHANGED', itemId });
	});

	it('handles RPC failure', async () => {
		mockSupabase.rpc.mockResolvedValue({
			data: null,
			error: { message: 'Stock RPC failed', code: 'PGRST123' },
		});

		const uuid = '11111111-1111-1111-1111-111111111111';
		await expect(
			useInventoryStore.getState().performStockOperation(uuid, 'stock_in', 5),
		).rejects.toThrow('Stock RPC failed');

		expect(useInventoryStore.getState().loading).toBe(false);
	});
});
