import { useCustomerStore } from '@/src/stores/customerStore';
import { customerService } from '@/src/services/customerService';

jest.mock('@/src/services/customerService');

describe('Performance: Debounce Verification', () => {
	beforeEach(() => {
		jest.useFakeTimers();
		jest.clearAllMocks();
		useCustomerStore.getState().reset();
		(customerService.fetchCustomers as jest.Mock).mockResolvedValue({
			data: [],
			count: 0,
		});
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it('Bug #13: setFilters is debounced to prevent excessive service calls', async () => {
		const store = useCustomerStore.getState();

		// Simulate multiple rapid keystrokes within 300ms
		store.setFilters({ search: 'a' });
		store.setFilters({ search: 'ab' });
		store.setFilters({ search: 'abc' });

		// Fast-forward time
		jest.advanceTimersByTime(300);

		// With 300ms debounce, 3 rapid calls should only trigger ONE service call
		// Note: reset() might call it once if not careful, but store state reset
		// should clear that. We check the net calls after filters.
		expect(customerService.fetchCustomers).toHaveBeenCalledTimes(1);
	});
});
