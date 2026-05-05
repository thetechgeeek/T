import { act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useInventoryStore } from '@/src/stores/inventoryStore';
import { inventoryService } from '@/src/services/inventoryService';

jest.mock('@/src/services/inventoryService', () => ({
	inventoryService: {
		fetchItems: jest.fn(),
		exportToExcel: jest.fn(),
		createItem: jest.fn(),
		updateItem: jest.fn(),
		fetchItemById: jest.fn(),
		performStockOperation: jest.fn(),
		deleteItem: jest.fn(),
	},
}));

const defaultPersistedFilters = {
	search: '',
	category: 'ALL' as const,
	lowStockOnly: false,
	sortBy: 'created_at' as const,
	sortDir: 'desc' as const,
};

describe('Inventory store regression guards', () => {
	beforeEach(async () => {
		jest.useFakeTimers();
		jest.clearAllMocks();
		useInventoryStore.getState().reset();
		await AsyncStorage.clear();
	});

	afterEach(() => {
		jest.runOnlyPendingTimers();
		jest.useRealTimers();
	});

	it('restarts a reset fetch with the latest filters when search changes mid-flight', async () => {
		let resolveFirst:
			| ((value: { data: Array<{ id: string; design_name: string }>; count: number }) => void)
			| undefined;

		const firstPromise = new Promise<{
			data: Array<{ id: string; design_name: string }>;
			count: number;
		}>((resolve) => {
			resolveFirst = resolve;
		});

		(inventoryService.fetchItems as jest.Mock)
			.mockReturnValueOnce(firstPromise)
			.mockResolvedValueOnce({
				data: [{ id: '2', design_name: 'Result for AB' }],
				count: 1,
			});

		useInventoryStore.getState().setFilters({ search: 'A' });
		act(() => {
			jest.advanceTimersByTime(310);
		});

		expect(useInventoryStore.getState().loading).toBe(true);
		expect(inventoryService.fetchItems).toHaveBeenCalledTimes(1);
		expect(inventoryService.fetchItems).toHaveBeenNthCalledWith(
			1,
			expect.objectContaining({ search: 'A' }),
			1,
			20,
		);

		useInventoryStore.getState().setFilters({ search: 'AB' });
		act(() => {
			jest.advanceTimersByTime(310);
		});

		expect(inventoryService.fetchItems).toHaveBeenCalledTimes(1);
		expect(useInventoryStore.getState().filters.search).toBe('AB');

		resolveFirst?.({
			data: [{ id: '1', design_name: 'Result for A' }],
			count: 1,
		});

		await waitFor(() => {
			expect(inventoryService.fetchItems).toHaveBeenCalledTimes(2);
		});

		expect(inventoryService.fetchItems).toHaveBeenNthCalledWith(
			2,
			expect.objectContaining({ search: 'AB' }),
			1,
			20,
		);

		await waitFor(() => {
			expect(useInventoryStore.getState().items).toEqual([
				{ id: '2', design_name: 'Result for AB' },
			]);
		});
	});

	it('does not schedule a new fetch when filters are unchanged', async () => {
		(inventoryService.fetchItems as jest.Mock).mockResolvedValue({
			data: [],
			count: 0,
		});

		useInventoryStore.getState().setFilters({ search: '' });
		act(() => {
			jest.advanceTimersByTime(310);
		});

		expect(inventoryService.fetchItems).not.toHaveBeenCalled();
	});

	it('rehydrates persisted filters while dropping sensitive search text', async () => {
		await AsyncStorage.setItem(
			'inventory-storage',
			JSON.stringify({
				state: {
					items: [],
					totalCount: 0,
					filters: {
						...defaultPersistedFilters,
						search: 'Persisted Marble',
						lowStockOnly: true,
					},
					hasMore: true,
				},
				version: 0,
			}),
		);

		await act(async () => {
			await useInventoryStore.persist.rehydrate();
		});

		expect(useInventoryStore.getState().filters).toEqual({
			...defaultPersistedFilters,
			search: '',
			lowStockOnly: true,
		});
	});
});
