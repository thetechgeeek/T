import { useCustomerStore } from './customerStore';
import { customerService } from '../services/customerService';
import { makeCustomer } from '../../__tests__/fixtures/customerFixtures';

// Mock the customerService
jest.mock('../services/customerService', () => ({
	customerService: {
		createCustomer: jest.fn(),
		fetchCustomers: jest.fn(),
	},
}));

describe('customerStore', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		useCustomerStore.setState({ customers: [], loading: false, error: null, totalCount: 0 });
	});

	it('createCustomer handles errors correctly', async () => {
		const error = new Error("Could not find the table 'public.customers' in the schema cache");
		(customerService.createCustomer as jest.Mock).mockRejectedValue(error);

		await expect(
			useCustomerStore
				.getState()
				.createCustomer({ name: 'Test' } as import('../types/customer').CustomerInsert),
		).rejects.toThrow(error);

		const state = useCustomerStore.getState();
		expect(state.error).toBe(error.message);
		expect(state.loading).toBe(false);
	});

	it('createCustomer successfully updates state after success', async () => {
		const mockCustomer = { id: '123', name: 'Test' };
		(customerService.createCustomer as jest.Mock).mockResolvedValue(mockCustomer);

		const result = await useCustomerStore
			.getState()
			.createCustomer({ name: 'Test' } as import('../types/customer').CustomerInsert);

		expect(result).toEqual(mockCustomer);
		const state = useCustomerStore.getState();
		expect(state.customers[0]).toEqual(mockCustomer);
		expect(state.totalCount).toBe(1);
		expect(state.loading).toBe(false);
	});

	it('fetchCustomers success updates customers and totalCount', async () => {
		const customer = makeCustomer();
		(customerService.fetchCustomers as jest.Mock).mockResolvedValue({
			data: [customer],
			count: 1,
		});

		await useCustomerStore.getState().fetchCustomers({});

		const state = useCustomerStore.getState();
		expect(state.customers).toHaveLength(1);
		expect(state.totalCount).toBe(1);
		expect(state.loading).toBe(false);
	});

	it('fetchCustomers failure sets error and leaves customers unchanged', async () => {
		(customerService.fetchCustomers as jest.Mock).mockRejectedValue(new Error('Fetch failed'));

		try {
			await useCustomerStore.getState().fetchCustomers({});
		} catch {
			// may rethrow
		}

		const state = useCustomerStore.getState();
		expect(state.error).toBeTruthy();
		expect(state.loading).toBe(false);
		expect(state.customers).toEqual([]);
	});

	it('createCustomer loading state — true during create, false after', async () => {
		let resolveP!: (v: unknown) => void;
		const p = new Promise((r) => {
			resolveP = r;
		});
		(customerService.createCustomer as jest.Mock).mockReturnValue(p);

		const createPromise = useCustomerStore
			.getState()
			.createCustomer({ name: 'Test' } as import('../types/customer').CustomerInsert);

		expect(useCustomerStore.getState().loading).toBe(true);

		resolveP({ id: '1', name: 'Test' });
		await createPromise;

		expect(useCustomerStore.getState().loading).toBe(false);
	});
});
