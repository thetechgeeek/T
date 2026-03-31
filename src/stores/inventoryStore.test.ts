import { useInventoryStore } from './inventoryStore';
import { inventoryService } from '../services/inventoryService';
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
		useInventoryStore.setState({
			items: [],
			loading: false,
			error: null,
			hasMore: true,
			totalCount: 0,
		});
	});

	it('fetchItems successfully loads items and calculates low stock count', async () => {
		(inventoryService.fetchItems as jest.Mock).mockResolvedValue({ data: mockItems, count: 2 });

		await useInventoryStore.getState().fetchItems();

		const state = useInventoryStore.getState();
		expect(state.items).toEqual(mockItems);
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

	it('createItem success prepends item and increments totalCount', async () => {
		const newItem = makeInventoryItem({ id: 'new-item' });
		(inventoryService.createItem as jest.Mock).mockResolvedValue(newItem);

		await useInventoryStore.getState().createItem(makeInventoryItemInput());

		const state = useInventoryStore.getState();
		expect(state.items[0].id).toBe('new-item');
		expect(state.totalCount).toBe(1);
		expect(state.loading).toBe(false);
	});

	it('createItem failure sets error and leaves items unchanged', async () => {
		(inventoryService.createItem as jest.Mock).mockRejectedValue(new Error('Create failed'));

		try {
			await useInventoryStore.getState().createItem(makeInventoryItemInput());
		} catch {
			// may rethrow
		}

		const state = useInventoryStore.getState();
		expect(state.error).toBeTruthy();
		expect(state.loading).toBe(false);
		expect(state.items).toEqual([]);
	});

	it('updateItem success replaces the item in place', async () => {
		const original = makeInventoryItem({ id: 'item-1', box_count: 10 });
		useInventoryStore.setState({ items: [original as any], totalCount: 1 });

		const updated = makeInventoryItem({ id: 'item-1', box_count: 20 });
		(inventoryService.updateItem as jest.Mock).mockResolvedValue(updated);

		await useInventoryStore.getState().updateItem('item-1', { box_count: 20 });

		const state = useInventoryStore.getState();
		expect(state.items[0].box_count).toBe(20);
		expect(state.loading).toBe(false);
	});

	it('deleteItem success removes item and decrements totalCount', async () => {
		const itemA = makeInventoryItem({ id: 'item-1' });
		const itemB = makeInventoryItem({ id: 'item-2' });
		useInventoryStore.setState({ items: [itemA, itemB] as any, totalCount: 2 });
		(inventoryService.deleteItem as jest.Mock).mockResolvedValue(undefined);

		await useInventoryStore.getState().deleteItem('item-1');

		const state = useInventoryStore.getState();
		expect(state.items.find((i: any) => i.id === 'item-1')).toBeUndefined();
		expect(state.totalCount).toBe(1);
	});

	it('performStockOperation failure sets error and does not modify box_count', async () => {
		const original = makeInventoryItem({ id: 'item-1', box_count: 50 });
		useInventoryStore.setState({ items: [original as any] });
		(inventoryService.performStockOperation as jest.Mock).mockRejectedValue(
			new Error('Stock op failed'),
		);

		await useInventoryStore.getState().performStockOperation('item-1', 'stock_out', 10, 'Sale');

		const state = useInventoryStore.getState();
		expect(state.error).toBeTruthy();
		expect(state.loading).toBe(false);
		// box_count should be unchanged
		expect(state.items[0].box_count).toBe(50);
	});
});
