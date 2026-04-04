import { useInventoryStore } from '@/src/stores/inventoryStore';
import { inventoryService } from '@/src/services/inventoryService';

jest.mock('@/src/services/inventoryService');

describe('Cross-Screen Sync: Item Detail Stock Sync', () => {
	const itemId = 'item-123';
	const initialItem = { id: itemId, design_name: 'Tile A', box_count: 50 };

	beforeEach(() => {
		jest.clearAllMocks();
		useInventoryStore.getState().reset();
		useInventoryStore.setState({ items: [initialItem as any], totalCount: 1 });
	});

	it('refreshes the local item in store immediately after performing a stock operation', async () => {
		// 1. Mock the stock operation and the subsequent refresh fetch
		(inventoryService.performStockOperation as jest.Mock).mockResolvedValue(true);
		(inventoryService.fetchItemById as jest.Mock).mockResolvedValue({
			...initialItem,
			box_count: 60,
		});

		// 2. Perform operation
		await useInventoryStore
			.getState()
			.performStockOperation(itemId, 'stock_in', 10, 'Test reason');

		// 3. Verify store state was updated
		expect(inventoryService.fetchItemById).toHaveBeenCalledWith(itemId);

		const itemInStore = useInventoryStore.getState().items.find((i) => i.id === itemId);
		expect(itemInStore?.box_count).toBe(60);
	});
});
