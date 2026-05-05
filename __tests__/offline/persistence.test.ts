import { useCustomerStore } from '@/src/stores/customerStore';
import { customerService } from '@/src/services/customerService';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@/src/services/customerService');

describe('Offline Resilience: Persistence Verification', () => {
	beforeEach(async () => {
		jest.clearAllMocks();
		// Clear AsyncStorage mock
		await AsyncStorage.clear();
		useCustomerStore.getState().reset();
	});

	it('does not persist customer records to AsyncStorage', async () => {
		const mockCustomers = [
			{ id: '1', name: 'John Doe', phone: '123' },
			{ id: '2', name: 'Jane Smith', phone: '456' },
		];
		(customerService.fetchCustomers as jest.Mock).mockResolvedValue({
			data: mockCustomers,
			count: 2,
		});

		// Set data in store
		await useCustomerStore.getState().fetchCustomers(true);
		expect(useCustomerStore.getState().customers).toHaveLength(2);

		// Verify it's in AsyncStorage
		const stored = await AsyncStorage.getItem('customer-storage');
		expect(stored).not.toBeNull();
		const parsed = JSON.parse(stored!);
		expect(parsed.state.customers).toBeUndefined();
		expect(parsed.state.totalCount).toBeUndefined();
		expect(parsed.state.filters).toEqual({
			search: '',
			type: 'ALL',
			sortBy: 'name',
			sortDir: 'asc',
		});
	});

	it('should partialise state to only store essential data', async () => {
		// Mock a state with detail data (which shouldn't be persisted)
		useCustomerStore.setState({
			customers: [
				{
					id: '1',
					name: 'John',
					phone: '123',
					type: 'RETAIL',
					credit_limit: 0,
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
				} as any,
			],
			selectedCustomer: { id: '1', name: 'John' } as any,
			ledger: [{ id: 'l1' }] as any,
		});

		const stored = await AsyncStorage.getItem('customer-storage');
		const parsed = JSON.parse(stored!);

		// PII/business records should not be persisted.
		expect(parsed.state.customers).toBeUndefined();

		// Detail data should NOT be there (to save space/prevent stale details)
		expect(parsed.state.selectedCustomer).toBeUndefined();
		expect(parsed.state.ledger).toBeUndefined();
		expect(parsed.state.filters.search).toBe('');
	});
});
