import { waitFor } from '@testing-library/react-native';
import { useCustomerStore } from './customerStore';
import { customerService } from '../services/customerService';
import { eventBus } from '../events/appEvents';

jest.mock('../utils/retry', () => ({
	withRetry: jest.fn((fn) => fn()),
}));
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
			useCustomerStore.getState().createCustomer({
				name: 'Test',
				phone: '9876543210',
				type: 'retail',
				credit_limit: 0,
			} as any),
		).rejects.toThrow(error);

		const state = useCustomerStore.getState();
		expect(state.error).toBe(error.message);
		expect(state.loading).toBe(false);
	});

	it('createCustomer successfully updates state', async () => {
		const mockCustomer = makeCustomer();
		(customerService.createCustomer as jest.Mock).mockResolvedValue(mockCustomer);

		const result = await useCustomerStore.getState().createCustomer({
			name: 'Test',
			phone: '9876543210',
			type: 'retail',
			credit_limit: 0,
		} as any);

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

	// ─── fetchCustomers: loading lifecycle ────────────────────────────────────

	it('fetchCustomers: loading=true during fetch, false after success', async () => {
		let resolve!: (v: unknown) => void;
		const p = new Promise((r) => {
			resolve = r;
		});
		(customerService.fetchCustomers as jest.Mock).mockReturnValue(p);

		const fetchPromise = useCustomerStore.getState().fetchCustomers(true);
		expect(useCustomerStore.getState().loading).toBe(true);

		resolve({ data: [], count: 0 });
		await fetchPromise;

		expect(useCustomerStore.getState().loading).toBe(false);
	});

	it('fetchCustomers error: loading=false, error set', async () => {
		(customerService.fetchCustomers as jest.Mock).mockRejectedValue(new Error('Fetch error'));

		await useCustomerStore.getState().fetchCustomers(true);

		const state = useCustomerStore.getState();
		expect(state.loading).toBe(false);
		expect(state.error).toBeTruthy();
	});

	it('fetchCustomers reset=true replaces customers list', async () => {
		const c1 = makeCustomer({ id: 'old' });
		useCustomerStore.setState({ customers: [c1] as any });

		const c2 = makeCustomer({ id: 'new' });
		(customerService.fetchCustomers as jest.Mock).mockResolvedValue({ data: [c2], count: 1 });

		await useCustomerStore.getState().fetchCustomers(true);

		const state = useCustomerStore.getState();
		expect(state.customers).toHaveLength(1);
		expect(state.customers[0].id).toBe('new');
	});

	// ─── createCustomer ───────────────────────────────────────────────────────

	it('createCustomer loading lifecycle', async () => {
		let resolve!: (v: unknown) => void;
		const p = new Promise((r) => {
			resolve = r;
		});
		(customerService.createCustomer as jest.Mock).mockReturnValue(p);

		const createPromise = useCustomerStore.getState().createCustomer({
			name: 'Test',
			phone: '9876543210',
			type: 'retail',
			credit_limit: 0,
		} as any);
		expect(useCustomerStore.getState().loading).toBe(true);

		const newCustomer = makeCustomer();
		resolve(newCustomer);
		await createPromise;

		expect(useCustomerStore.getState().loading).toBe(false);
	});

	it('createCustomer success prepends to list and increments totalCount', async () => {
		const existing = makeCustomer({ id: 'exist' });
		useCustomerStore.setState({ customers: [existing] as any, totalCount: 1 });

		const newCustomer = makeCustomer({ id: 'new-cust' });
		(customerService.createCustomer as jest.Mock).mockResolvedValue(newCustomer);

		await useCustomerStore.getState().createCustomer({
			name: 'New',
			phone: '9123456789',
			type: 'retail',
			credit_limit: 0,
		} as any);

		const state = useCustomerStore.getState();
		expect(state.customers[0].id).toBe('new-cust');
		expect(state.customers[1].id).toBe('exist');
		expect(state.totalCount).toBe(2);
	});

	// ─── updateCustomer ───────────────────────────────────────────────────────

	it('updateCustomer: updated item replaces old one at same index', async () => {
		const c1 = makeCustomer({ id: 'c1', name: 'Old Name' });
		const c2 = makeCustomer({ id: 'c2' });
		useCustomerStore.setState({ customers: [c1, c2] as any });

		const updated = { ...c1, name: 'New Name' };
		(customerService.updateCustomer as jest.Mock).mockResolvedValue(updated);

		await useCustomerStore.getState().updateCustomer('c1', { name: 'New Name' } as any);

		const state = useCustomerStore.getState();
		expect(state.customers[0].name).toBe('New Name');
		expect(state.customers[1].id).toBe('c2');
		expect(state.loading).toBe(false);
	});

	it('updateCustomer error: loading=false, error set, original item unchanged', async () => {
		const c1 = makeCustomer({ id: 'c-err', name: 'Original' });
		useCustomerStore.setState({ customers: [c1] as any });
		(customerService.updateCustomer as jest.Mock).mockRejectedValue(new Error('Update error'));

		await expect(
			useCustomerStore.getState().updateCustomer('c-err', { name: 'New' } as any),
		).rejects.toThrow('Update error');

		const state = useCustomerStore.getState();
		expect(state.loading).toBe(false);
		expect(state.error).toBe('Update error');
		expect(state.customers[0].name).toBe('Original');
	});

	it('updateCustomer also updates selectedCustomer if it matches the id', async () => {
		const c1 = makeCustomer({ id: 'sel-cust', name: 'Old' });
		useCustomerStore.setState({ customers: [c1] as any, selectedCustomer: c1 as any });

		const updated = { ...c1, name: 'Updated' };
		(customerService.updateCustomer as jest.Mock).mockResolvedValue(updated);

		await useCustomerStore.getState().updateCustomer('sel-cust', { name: 'Updated' } as any);

		expect(useCustomerStore.getState().selectedCustomer?.name).toBe('Updated');
	});

	// ─── fetchCustomerDetail ──────────────────────────────────────────────────

	it('fetchCustomerDetail success sets selectedCustomer, ledger, summary', async () => {
		const customer = makeCustomer({ id: 'detail-id' });
		const ledger = [{ id: 'l1', amount: 100 }];
		const summary = { total_credit: 1000, total_debit: 500, balance: 500 };

		(customerService.fetchCustomerById as jest.Mock).mockResolvedValue(customer);
		(customerService.fetchLedgerEntries as jest.Mock).mockResolvedValue(ledger);
		(customerService.getLedgerSummary as jest.Mock).mockResolvedValue(summary);

		await useCustomerStore.getState().fetchCustomerDetail('detail-id');

		const state = useCustomerStore.getState();
		expect(state.selectedCustomer?.id).toBe('detail-id');
		expect(state.ledger).toEqual(ledger);
		expect(state.summary).toEqual(summary);
		expect(state.loading).toBe(false);
	});

	it('fetchCustomerDetail error: loading=false, error set', async () => {
		(customerService.fetchCustomerById as jest.Mock).mockRejectedValue(
			new Error('Detail failed'),
		);
		(customerService.fetchLedgerEntries as jest.Mock).mockResolvedValue([]);
		(customerService.getLedgerSummary as jest.Mock).mockResolvedValue(null);

		await useCustomerStore.getState().fetchCustomerDetail('no-id');

		const state = useCustomerStore.getState();
		expect(state.loading).toBe(false);
		expect(state.error).toBe('Detail failed');
	});

	// ─── setFilters ───────────────────────────────────────────────────────────

	it('setFilters with type filter triggers fetchCustomers with new filter', async () => {
		(customerService.fetchCustomers as jest.Mock).mockResolvedValue({ data: [], count: 0 });

		useCustomerStore.getState().setFilters({ type: 'DEALER' } as any);

		expect(useCustomerStore.getState().filters.type).toBe('DEALER');
		await waitFor(() => expect(customerService.fetchCustomers).toHaveBeenCalled());
	});
});
