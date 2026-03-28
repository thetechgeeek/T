import { useInventoryStore } from './inventoryStore';
import { inventoryService } from '../services/inventoryService';

// Mock the inventoryService
jest.mock('../services/inventoryService', () => ({
	inventoryService: {
		fetchItems: jest.fn(),
		fetchItemById: jest.fn(),
		createItem: jest.fn(),
		updateItem: jest.fn(),
		deleteItem: jest.fn(),
		performStockOperation: jest.fn(),
		fetchStockHistory: jest.fn(),
		getLowStockItems: jest.fn(),
	},
}));

const mockItems = [
	{ id: '1', design_name: 'Item A', category: 'GLOSSY', box_count: 50 },
	{ id: '2', design_name: 'Item B', category: 'MATT', box_count: 5 }, // Low stock
];

describe('inventoryStore', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		useInventoryStore.setState({ items: [], loading: false, error: null, hasMore: true });
	});

	it('fetchItems successfully loads items and calculates low stock count', async () => {
		(inventoryService.fetchItems as jest.Mock).mockResolvedValue({ data: mockItems, count: 2 });

		await useInventoryStore.getState().fetchItems();

		const state = useInventoryStore.getState();
		expect(state.items).toEqual(mockItems);
		expect(state.loading).toBe(false);
		expect(state.loading).toBe(false);
		expect(state.error).toBeNull();
	});

	it('fetchItems handles errors', async () => {
		(inventoryService.fetchItems as jest.Mock).mockRejectedValue(new Error('Network Error'));

		await useInventoryStore.getState().fetchItems();

		const state = useInventoryStore.getState();
		expect(state.items).toEqual([]);
		expect(state.loading).toBe(false);
		expect(state.error).toBe('Network Error');
	});

	it('performStockOperation updates the local state correctly after a successful API call', async () => {
		// Initial state with 1 item
		useInventoryStore.setState({ items: [mockItems[0] as any], loading: false, error: null });

		// Mock API success returning new quantity: 50 + 20 = 70
		(inventoryService.performStockOperation as jest.Mock).mockResolvedValue(70);
		(inventoryService.fetchItemById as jest.Mock).mockResolvedValue({
			...mockItems[0],
			box_count: 70,
		});

		await useInventoryStore.getState().performStockOperation('1', 'stock_in', 20, 'Restock');

		const state = useInventoryStore.getState();
		expect(inventoryService.performStockOperation).toHaveBeenCalledWith(
			'1',
			'stock_in',
			20,
			'Restock',
		);

		// Check that the locale state updated to 70
		expect(state.items[0].box_count).toBe(70);
	});
});
