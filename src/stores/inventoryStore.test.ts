import { waitFor } from '@testing-library/react-native';
import { useInventoryStore } from './inventoryStore';
import { inventoryService } from '../services/inventoryService';
import { eventBus } from '../events/appEvents';
import {
	makeInventoryItem,
	makeInventoryItemInput,
} from '../../__tests__/fixtures/inventoryFixtures';

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
		useInventoryStore.getState().reset();
	});

	it('fetchItems successfully loads items', async () => {
		(inventoryService.fetchItems as jest.Mock).mockResolvedValue({ data: mockItems, count: 2 });

		await useInventoryStore.getState().fetchItems(true);

		const state = useInventoryStore.getState();
		expect(state.items).toEqual(mockItems);
		expect(state.loading).toBe(false);
		expect(state.error).toBeNull();
		expect(state.totalCount).toBe(2);
		expect(state.hasMore).toBe(false);
	});

	it('fetchItems handles pagination correctly (appending)', async () => {
		const page1 = [{ id: '1', design_name: 'A' }];
		const page2 = [{ id: '2', design_name: 'B' }];

		(inventoryService.fetchItems as jest.Mock)
			.mockResolvedValueOnce({ data: page1, count: 2 })
			.mockResolvedValueOnce({ data: page2, count: 2 });

		// Fetch page 1
		await useInventoryStore.getState().fetchItems(true);
		expect(useInventoryStore.getState().items).toHaveLength(1);
		expect(useInventoryStore.getState().hasMore).toBe(true);

		// Fetch page 2
		await useInventoryStore.getState().fetchItems(false);
		expect(useInventoryStore.getState().items).toHaveLength(2);
		expect(useInventoryStore.getState().items[1].id).toBe('2');
		expect(useInventoryStore.getState().hasMore).toBe(false);
	});

	it('setFilters resets page and fetches items', async () => {
		(inventoryService.fetchItems as jest.Mock).mockResolvedValue({ data: [], count: 0 });

		useInventoryStore.getState().setFilters({ search: 'test' });

		expect(useInventoryStore.getState().filters.search).toBe('test');
		await waitFor(() => expect(inventoryService.fetchItems).toHaveBeenCalled());
	});

	it('fetchItems handles errors', async () => {
		(inventoryService.fetchItems as jest.Mock).mockRejectedValue(new Error('Network Error'));

		await useInventoryStore.getState().fetchItems(true);

		const state = useInventoryStore.getState();
		expect(state.loading).toBe(false);
		expect(state.error).toBe('Network Error');
	});

	it('performStockOperation updates the local state correctly', async () => {
		useInventoryStore.setState({
			items: [mockItems[0] as any],
		});

		(inventoryService.performStockOperation as jest.Mock).mockResolvedValue(70);
		(inventoryService.fetchItemById as jest.Mock).mockResolvedValue({
			...mockItems[0],
			box_count: 70,
		});

		await useInventoryStore.getState().performStockOperation('1', 'stock_in', 20, 'Restock');

		const state = useInventoryStore.getState();
		expect(state.items[0].box_count).toBe(70);
	});

	it('createItem success prepends item and increments totalCount', async () => {
		const newItem = makeInventoryItem({ id: 'new-item' });
		(inventoryService.createItem as jest.Mock).mockResolvedValue(newItem);

		await useInventoryStore.getState().createItem(makeInventoryItemInput());

		const state = useInventoryStore.getState();
		expect(state.items[0].id).toBe('new-item');
		expect(state.totalCount).toBe(1);
	});

	it('deleteItem success removes item and decrements totalCount', async () => {
		const itemA = makeInventoryItem({ id: 'item-1' });
		useInventoryStore.setState({
			items: [itemA] as any[],
			totalCount: 1,
		});
		(inventoryService.deleteItem as jest.Mock).mockResolvedValue(undefined);

		await useInventoryStore.getState().deleteItem('item-1');

		const state = useInventoryStore.getState();
		expect(state.items).toHaveLength(0);
		expect(state.totalCount).toBe(0);
	});

	it('listens to STOCK_CHANGED event and refreshes', async () => {
		(inventoryService.fetchItems as jest.Mock).mockResolvedValue({ data: [], count: 0 });
		(inventoryService.fetchItems as jest.Mock).mockClear();

		eventBus.emit({ type: 'STOCK_CHANGED', itemId: 'any' });

		await waitFor(() => expect(inventoryService.fetchItems).toHaveBeenCalled());
	});
});
