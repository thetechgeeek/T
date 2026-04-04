import { waitFor } from '@testing-library/react-native';
import { useInventoryStore } from '@/src/stores/inventoryStore';
import { inventoryService } from '@/src/services/inventoryService';

jest.mock('@/src/services/inventoryService');

/**
 * Phase 7: Cross-Screen State Documentation
 * Documents BUG #4: Search Race Condition.
 * Setting filters while loading causes stale data or ignored requests.
 */
describe('Cross-Screen Sync: Bug #4 Documentation', () => {
	beforeEach(() => {
		jest.useFakeTimers();
		jest.clearAllMocks();
		useInventoryStore.getState().reset();
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it('ignores subsequent filter updates if already loading (Race Condition)', async () => {
		let resolveFirst: (val: any) => void;
		const firstPromise = new Promise((resolve) => {
			resolveFirst = resolve;
		});

		// First call hangs (simulating slow network)
		(inventoryService.fetchItems as jest.Mock).mockReturnValueOnce(firstPromise);

		// 1. Initial trigger
		useInventoryStore.getState().setFilters({ search: 'A' });
		jest.advanceTimersByTime(310);
		expect(useInventoryStore.getState().loading).toBe(true);
		expect(inventoryService.fetchItems).toHaveBeenCalledTimes(1);

		// 2. Rapid update while loading
		useInventoryStore.getState().setFilters({ search: 'AB' });
		jest.advanceTimersByTime(310);

		// BUG: In the current implementation, fetchItems returns immediately if loading=true
		// even if reset=true was passed by setFilters.
		// It does NOT queue or restart the fetch with the new filters.
		expect(inventoryService.fetchItems).toHaveBeenCalledTimes(1); // Should have been 2 (or restarted)

		// 3. Resolve the first call (with OLD data)
		resolveFirst!({ data: [{ id: '1', design_name: 'Result for A' }], count: 1 });

		await waitFor(() => {
			expect(useInventoryStore.getState().loading).toBe(false);
		});

		// 4. State check: Filter is 'AB' but data is 'Result for A'
		expect(useInventoryStore.getState().filters.search).toBe('AB');
		// If this were fixed, we'd expect Results for AB or at least a second fetch.
	});
});
