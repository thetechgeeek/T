import { waitFor } from '@testing-library/react-native';
import { useCustomerStore } from './customerStore';
import { customerService } from '../services/customerService';
import { eventBus } from '../events/appEvents';
import { makeCustomer } from '../../__tests__/fixtures/customerFixtures';

jest.mock('../services/customerService', () => ({
	customerService: {
		createCustomer: jest.fn(),
		fetchCustomers: jest.fn(),
		updateCustomer: jest.fn(),
		fetchCustomerById: jest.fn(),
		fetchLedgerEntries: jest.fn(),
		getLedgerSummary: jest.fn(),
	},
}));

describe('customerStore', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		useCustomerStore.setState({
			customers: [],
			totalCount: 0,
			loading: false,
			error: null,
			selectedCustomer: null,
			ledger: [],
			summary: null,
			filters: { search: '', type: 'ALL', sortBy: 'name', sortDir: 'asc' },
		});
	});

	// ─── createCustomer ───────────────────────────────────────────────────────
	it('createCustomer handles errors correctly', async () => {
		const error = new Error("Could not find the table 'public.customers'");
		(customerService.createCustomer as jest.Mock).mockRejectedValue(error);

		await expect(
			useCustomerStore.getState().createCustomer({ name: 'Test' } as any),
		).rejects.toThrow(error);

		const state = useCustomerStore.getState();
		expect(state.error).toBe(error.message);
		expect(state.loading).toBe(false);
	});

	it('createCustomer successfully updates state', async () => {
		const mockCustomer = makeCustomer();
		(customerService.createCustomer as jest.Mock).mockResolvedValue(mockCustomer);

		const result = await useCustomerStore.getState().createCustomer({ name: 'Test' } as any);

		expect(result).toEqual(mockCustomer);
		const state = useCustomerStore.getState();
		expect(state.customers[0]).toEqual(mockCustomer);
		expect(state.totalCount).toBe(1);
		expect(state.loading).toBe(false);
	});

	// ─── fetchCustomers ───────────────────────────────────────────────────────
	it('fetchCustomers success updates customers and totalCount', async () => {
		const customer = makeCustomer();
		(customerService.fetchCustomers as jest.Mock).mockResolvedValue({
			data: [customer],
			count: 1,
		});

		await useCustomerStore.getState().fetchCustomers(true);

		const state = useCustomerStore.getState();
		expect(state.customers).toHaveLength(1);
		expect(state.totalCount).toBe(1);
		expect(state.loading).toBe(false);
	});

	it('fetchCustomers pagination appends unique items', async () => {
		const c1 = makeCustomer({ id: '1' });
		const c2 = makeCustomer({ id: '2' });

		(customerService.fetchCustomers as jest.Mock)
			.mockResolvedValueOnce({ data: [c1], count: 2 })
			.mockResolvedValueOnce({ data: [c2], count: 2 });

		await useCustomerStore.getState().fetchCustomers(true);
		expect(useCustomerStore.getState().customers).toHaveLength(1);

		await useCustomerStore.getState().fetchCustomers(false);
		expect(useCustomerStore.getState().customers).toHaveLength(2);
		expect(useCustomerStore.getState().customers[1].id).toBe('2');
	});

	// ─── reset ───────────────────────────────────────────────────────────────
	it('reset action clears the state', () => {
		useCustomerStore.setState({
			customers: [makeCustomer()],
			totalCount: 1,
			selectedCustomer: makeCustomer(),
			error: 'error',
		});

		useCustomerStore.getState().reset();

		const state = useCustomerStore.getState();
		expect(state.customers).toEqual([]);
		expect(state.totalCount).toBe(0);
		expect(state.selectedCustomer).toBeNull();
		expect(state.error).toBeNull();
	});

	// ─── setFilters ───────────────────────────────────────────────────────────
	it('setFilters merges filters and triggers fetchCustomers', async () => {
		(customerService.fetchCustomers as jest.Mock).mockResolvedValue({ data: [], count: 0 });

		useCustomerStore.getState().setFilters({ search: 'test' });

		expect(useCustomerStore.getState().filters.search).toBe('test');
		await waitFor(() => expect(customerService.fetchCustomers).toHaveBeenCalled());
	});

	// ─── event-driven refresh ─────────────────────────────────────────────────
	it('refreshes customers when INVOICE_CREATED event is emitted', async () => {
		(customerService.fetchCustomers as jest.Mock).mockResolvedValue({ data: [], count: 0 });
		(customerService.fetchCustomers as jest.Mock).mockClear();

		eventBus.emit({ type: 'INVOICE_CREATED', invoiceId: 'inv-1' });

		await waitFor(() => expect(customerService.fetchCustomers).toHaveBeenCalled());
	});

	it('refreshes customers when PAYMENT_RECORDED event is emitted', async () => {
		(customerService.fetchCustomers as jest.Mock).mockResolvedValue({ data: [], count: 0 });
		(customerService.fetchCustomers as jest.Mock).mockClear();

		eventBus.emit({ type: 'PAYMENT_RECORDED', paymentId: 'pay-1' });

		await waitFor(() => expect(customerService.fetchCustomers).toHaveBeenCalled());
	});
});
