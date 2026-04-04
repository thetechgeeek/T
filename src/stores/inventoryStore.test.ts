import { waitFor } from '@testing-library/react-native';
import { useInventoryStore } from './inventoryStore';
import { inventoryService } from '../services/inventoryService';
import { eventBus } from '../events/appEvents';

jest.mock('../utils/retry', () => ({
	withRetry: jest.fn((fn) => fn()),
}));
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

	// ─── fetchItems: loading flag lifecycle ──────────────────────────────────

	it('fetchItems sets loading=true before resolve, loading=false after', async () => {
		let resolve!: (v: unknown) => void;
		const p = new Promise((r) => {
			resolve = r;
		});
		(inventoryService.fetchItems as jest.Mock).mockReturnValue(p);

		const fetchPromise = useInventoryStore.getState().fetchItems(true);
		expect(useInventoryStore.getState().loading).toBe(true);

		resolve({ data: [], count: 0 });
		await fetchPromise;

		expect(useInventoryStore.getState().loading).toBe(false);
	});

	it('fetchItems: second call while loading=true returns immediately (race guard)', async () => {
		let resolve!: (v: unknown) => void;
		const p = new Promise((r) => {
			resolve = r;
		});
		(inventoryService.fetchItems as jest.Mock).mockReturnValue(p);

		const first = useInventoryStore.getState().fetchItems(true);
		expect(useInventoryStore.getState().loading).toBe(true);

		// Second call should return immediately without calling service again
		await useInventoryStore.getState().fetchItems(true);
		expect(inventoryService.fetchItems).toHaveBeenCalledTimes(1);

		resolve({ data: [], count: 0 });
		await first;
	});

	it('fetchItems: hasMore=false and reset=false returns immediately without service call', async () => {
		useInventoryStore.setState({ hasMore: false });

		await useInventoryStore.getState().fetchItems(false);

		expect(inventoryService.fetchItems).not.toHaveBeenCalled();
	});

	it('fetchItems: hasMore=false but reset=true still fetches', async () => {
		useInventoryStore.setState({ hasMore: false });
		(inventoryService.fetchItems as jest.Mock).mockResolvedValue({ data: [], count: 0 });

		await useInventoryStore.getState().fetchItems(true);

		expect(inventoryService.fetchItems).toHaveBeenCalled();
	});

	it('fetchItems reset=true replaces items and resets page to 1', async () => {
		const initial = [makeInventoryItem({ id: 'old' })];
		useInventoryStore.setState({ items: initial as any, page: 3 });

		const newItems = [makeInventoryItem({ id: 'new' })];
		(inventoryService.fetchItems as jest.Mock).mockResolvedValue({ data: newItems, count: 1 });

		await useInventoryStore.getState().fetchItems(true);

		const state = useInventoryStore.getState();
		expect(state.items).toHaveLength(1);
		expect(state.items[0].id).toBe('new');
		expect(state.page).toBe(1);
	});

	it('fetchItems page 2 deduplicates: same id in page 2 not re-added', async () => {
		const existing = makeInventoryItem({ id: 'dup-id' });
		(inventoryService.fetchItems as jest.Mock)
			.mockResolvedValueOnce({ data: [existing], count: 2 })
			.mockResolvedValueOnce({ data: [existing], count: 2 }); // returns same item

		await useInventoryStore.getState().fetchItems(true);
		await useInventoryStore.getState().fetchItems(false);

		expect(useInventoryStore.getState().items).toHaveLength(1);
	});

	// ─── setFilters ───────────────────────────────────────────────────────────

	it('setFilters: category change triggers fetchItems(true) with new filter', async () => {
		(inventoryService.fetchItems as jest.Mock).mockResolvedValue({ data: [], count: 0 });

		useInventoryStore.getState().setFilters({ category: 'GLOSSY' });

		expect(useInventoryStore.getState().filters.category).toBe('GLOSSY');
		await waitFor(() => expect(inventoryService.fetchItems).toHaveBeenCalled());
	});

	it('setFilters while loading=true: only one service call fires', async () => {
		let resolve!: (v: unknown) => void;
		const p = new Promise((r) => {
			resolve = r;
		});
		(inventoryService.fetchItems as jest.Mock)
			.mockReturnValueOnce(p)
			.mockResolvedValue({ data: [], count: 0 });

		// Start first fetch
		const firstFetch = useInventoryStore.getState().fetchItems(true);
		expect(useInventoryStore.getState().loading).toBe(true);

		// setFilters triggers fetchItems(true), but loading guard prevents duplicate call
		useInventoryStore.getState().setFilters({ search: 'abc' });
		await new Promise((r) => setTimeout(r, 0));

		// Only 1 call because the race guard fires
		expect(inventoryService.fetchItems).toHaveBeenCalledTimes(1);

		resolve({ data: [], count: 0 });
		await firstFetch;
	});

	// ─── createItem ───────────────────────────────────────────────────────────

	it('createItem loading lifecycle — true during call, false after success', async () => {
		const newItem = makeInventoryItem({ id: 'new-item-2' });
		let resolve!: (v: unknown) => void;
		const p = new Promise((r) => {
			resolve = r;
		});
		(inventoryService.createItem as jest.Mock).mockReturnValue(p);

		const createPromise = useInventoryStore.getState().createItem(makeInventoryItemInput());
		expect(useInventoryStore.getState().loading).toBe(true);

		resolve(newItem);
		await createPromise;

		expect(useInventoryStore.getState().loading).toBe(false);
	});

	it('createItem error: loading=false, error set, items unchanged, error re-thrown', async () => {
		const err = new Error('Create failed');
		(inventoryService.createItem as jest.Mock).mockRejectedValue(err);

		await expect(
			useInventoryStore.getState().createItem(makeInventoryItemInput()),
		).rejects.toThrow('Create failed');

		const state = useInventoryStore.getState();
		expect(state.loading).toBe(false);
		expect(state.error).toBe('Create failed');
		expect(state.items).toHaveLength(0);
	});

	it('createItem emits STOCK_CHANGED event on success', async () => {
		const newItem = makeInventoryItem({ id: 'emit-test' });
		(inventoryService.createItem as jest.Mock).mockResolvedValue(newItem);

		const emitSpy = jest.spyOn(eventBus, 'emit');
		await useInventoryStore.getState().createItem(makeInventoryItemInput());

		expect(emitSpy).toHaveBeenCalledWith({ type: 'STOCK_CHANGED', itemId: 'emit-test' });
		emitSpy.mockRestore();
	});

	// ─── performStockOperation ────────────────────────────────────────────────

	it('performStockOperation: loading lifecycle', async () => {
		useInventoryStore.setState({ items: [makeInventoryItem({ id: 'item-x' })] as any });
		let resolve!: (v: unknown) => void;
		const p = new Promise((r) => {
			resolve = r;
		});
		(inventoryService.performStockOperation as jest.Mock).mockReturnValue(p);

		const opPromise = useInventoryStore
			.getState()
			.performStockOperation('item-x', 'stock_in', 10);
		expect(useInventoryStore.getState().loading).toBe(true);

		resolve(undefined);
		(inventoryService.fetchItemById as jest.Mock).mockResolvedValue(
			makeInventoryItem({ id: 'item-x', box_count: 60 }),
		);
		await opPromise;

		expect(useInventoryStore.getState().loading).toBe(false);
	});

	it('performStockOperation: fetchItemById failing after successful RPC sets error (infinite spinner bug)', async () => {
		useInventoryStore.setState({ items: [makeInventoryItem({ id: 'item-bug' })] as any });
		(inventoryService.performStockOperation as jest.Mock).mockResolvedValue(undefined);
		(inventoryService.fetchItemById as jest.Mock).mockRejectedValue(
			new Error('fetchItemById failed'),
		);

		await expect(
			useInventoryStore.getState().performStockOperation('item-bug', 'stock_in', 10),
		).rejects.toThrow('fetchItemById failed');

		const state = useInventoryStore.getState();
		expect(state.loading).toBe(false);
		expect(state.error).toBe('fetchItemById failed');
	});

	it('performStockOperation: RPC error sets loading=false, error set, items unchanged', async () => {
		const item = makeInventoryItem({ id: 'item-rpc-err', box_count: 50 });
		useInventoryStore.setState({ items: [item] as any });
		(inventoryService.performStockOperation as jest.Mock).mockRejectedValue(
			new Error('RPC failed'),
		);

		await expect(
			useInventoryStore.getState().performStockOperation('item-rpc-err', 'stock_out', 5),
		).rejects.toThrow('RPC failed');

		const state = useInventoryStore.getState();
		expect(state.loading).toBe(false);
		expect(state.error).toBe('RPC failed');
		expect(state.items[0].box_count).toBe(50);
	});

	it('performStockOperation emits STOCK_CHANGED on success', async () => {
		useInventoryStore.setState({ items: [makeInventoryItem({ id: 'item-ev' })] as any });
		(inventoryService.performStockOperation as jest.Mock).mockResolvedValue(undefined);
		(inventoryService.fetchItemById as jest.Mock).mockResolvedValue(
			makeInventoryItem({ id: 'item-ev', box_count: 60 }),
		);

		const emitSpy = jest.spyOn(eventBus, 'emit');
		await useInventoryStore.getState().performStockOperation('item-ev', 'stock_in', 10);

		expect(emitSpy).toHaveBeenCalledWith({ type: 'STOCK_CHANGED', itemId: 'item-ev' });
		emitSpy.mockRestore();
	});

	// ─── deleteItem ───────────────────────────────────────────────────────────

	it('deleteItem error: loading=false, error set, items length unchanged', async () => {
		const item = makeInventoryItem({ id: 'item-del' });
		useInventoryStore.setState({ items: [item] as any, totalCount: 1 });
		(inventoryService.deleteItem as jest.Mock).mockRejectedValue(new Error('Delete failed'));

		await expect(useInventoryStore.getState().deleteItem('item-del')).rejects.toThrow(
			'Delete failed',
		);

		const state = useInventoryStore.getState();
		expect(state.loading).toBe(false);
		expect(state.error).toBe('Delete failed');
		expect(state.items).toHaveLength(1);
		expect(state.totalCount).toBe(1);
	});

	it('deleteItem emits STOCK_CHANGED on success', async () => {
		const item = makeInventoryItem({ id: 'item-del-ev' });
		useInventoryStore.setState({ items: [item] as any, totalCount: 1 });
		(inventoryService.deleteItem as jest.Mock).mockResolvedValue(undefined);

		const emitSpy = jest.spyOn(eventBus, 'emit');
		await useInventoryStore.getState().deleteItem('item-del-ev');

		expect(emitSpy).toHaveBeenCalledWith({ type: 'STOCK_CHANGED', itemId: 'item-del-ev' });
		emitSpy.mockRestore();
	});

	// ─── reset ────────────────────────────────────────────────────────────────

	it('reset returns all state to defaults: items=[], page=1, hasMore=true, error=null, loading=false', () => {
		useInventoryStore.setState({
			items: [makeInventoryItem()] as any,
			page: 5,
			hasMore: false,
			error: 'some error',
			loading: true,
			filters: {
				search: 'abc',
				category: 'MATT',
				lowStockOnly: true,
				sortBy: 'created_at',
				sortDir: 'asc',
			},
		});

		useInventoryStore.getState().reset();

		const state = useInventoryStore.getState();
		expect(state.items).toEqual([]);
		expect(state.page).toBe(1);
		expect(state.hasMore).toBe(true);
		expect(state.error).toBeNull();
		expect(state.loading).toBe(false);
		expect(state.filters.search).toBe('');
		expect(state.filters.category).toBe('ALL');
		expect(state.totalCount).toBe(0);
	});

	// ─── updateItem ───────────────────────────────────────────────────────────

	it('updateItem success: updated item replaces old one at same index', async () => {
		const itemA = makeInventoryItem({ id: 'a', design_name: 'Old Name' });
		const itemB = makeInventoryItem({ id: 'b' });
		useInventoryStore.setState({ items: [itemA, itemB] as any });

		const updated = { ...itemA, design_name: 'New Name' };
		(inventoryService.updateItem as jest.Mock).mockResolvedValue(updated);

		await useInventoryStore.getState().updateItem('a', { design_name: 'New Name' });

		const state = useInventoryStore.getState();
		expect(state.items[0].design_name).toBe('New Name');
		expect(state.items[1].id).toBe('b');
		expect(state.loading).toBe(false);
	});

	it('updateItem error: loading=false, error set, original item unchanged', async () => {
		const item = makeInventoryItem({ id: 'upd-err', design_name: 'Original' });
		useInventoryStore.setState({ items: [item] as any });
		(inventoryService.updateItem as jest.Mock).mockRejectedValue(new Error('Update failed'));

		await expect(
			useInventoryStore.getState().updateItem('upd-err', { design_name: 'New' }),
		).rejects.toThrow('Update failed');

		const state = useInventoryStore.getState();
		expect(state.loading).toBe(false);
		expect(state.error).toBe('Update failed');
		expect(state.items[0].design_name).toBe('Original');
	});
});
