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
			loading: false,
			error: null,
			totalCount: 0,
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
			useCustomerStore
				.getState()
				.createCustomer({ name: 'Test' } as import('../types/customer').CustomerInsert),
		).rejects.toThrow(error);

		const state = useCustomerStore.getState();
		expect(state.error).toBe(error.message);
		expect(state.loading).toBe(false);
	});

	it('createCustomer successfully updates state', async () => {
		const mockCustomer = makeCustomer();
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

		resolveP(makeCustomer());
		await createPromise;

		expect(useCustomerStore.getState().loading).toBe(false);
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

	it('fetchCustomers failure sets error and leaves customers unchanged', async () => {
		(customerService.fetchCustomers as jest.Mock).mockRejectedValue(new Error('Fetch failed'));

		try {
			await useCustomerStore.getState().fetchCustomers(true);
		} catch {
			// may rethrow
		}

		const state = useCustomerStore.getState();
		expect(state.error).toBeTruthy();
		expect(state.loading).toBe(false);
		expect(state.customers).toEqual([]);
	});

	// ─── updateCustomer ───────────────────────────────────────────────────────
	it('updateCustomer replaces the customer in the list and updates selectedCustomer', async () => {
		const original = makeCustomer({ name: 'Original' });
		const updated = makeCustomer({ name: 'Updated' });

		useCustomerStore.setState({
			customers: [original],
			selectedCustomer: original,
		});
		(customerService.updateCustomer as jest.Mock).mockResolvedValue(updated);

		await useCustomerStore.getState().updateCustomer(original.id, { name: 'Updated' });

		const state = useCustomerStore.getState();
		expect(state.customers[0].name).toBe('Updated');
		expect(state.selectedCustomer?.name).toBe('Updated');
		expect(state.loading).toBe(false);
	});

	it('updateCustomer emits CUSTOMER_UPDATED event', async () => {
		const updated = makeCustomer();
		(customerService.updateCustomer as jest.Mock).mockResolvedValue(updated);

		const handler = jest.fn();
		const unsub = eventBus.subscribe(handler);
		await useCustomerStore.getState().updateCustomer(updated.id, { name: 'x' });
		unsub();

		expect(handler).toHaveBeenCalledWith(
			expect.objectContaining({ type: 'CUSTOMER_UPDATED', customerId: updated.id }),
		);
	});

	it('updateCustomer sets error and rethrows on failure', async () => {
		const err = new Error('Update failed');
		(customerService.updateCustomer as jest.Mock).mockRejectedValue(err);

		await expect(
			useCustomerStore.getState().updateCustomer('any-id', { name: 'x' }),
		).rejects.toThrow(err);

		expect(useCustomerStore.getState().error).toBe(err.message);
	});

	// ─── fetchCustomerDetail ──────────────────────────────────────────────────
	it('fetchCustomerDetail populates selectedCustomer, ledger, and summary', async () => {
		const customer = makeCustomer();
		const ledger = [
			{
				date: '2026-01-10',
				type: 'invoice' as const,
				reference: 'INV-001',
				debit: 1000,
				credit: 0,
				balance: 1000,
			},
		];
		const summary = {
			customer_id: customer.id,
			total_invoiced: 1000,
			total_paid: 0,
			outstanding_balance: 1000,
		};

		(customerService.fetchCustomerById as jest.Mock).mockResolvedValue(customer);
		(customerService.fetchLedgerEntries as jest.Mock).mockResolvedValue(ledger);
		(customerService.getLedgerSummary as jest.Mock).mockResolvedValue(summary);

		await useCustomerStore.getState().fetchCustomerDetail(customer.id);

		const state = useCustomerStore.getState();
		expect(state.selectedCustomer).toEqual(customer);
		expect(state.ledger).toEqual(ledger);
		expect(state.summary).toEqual(summary);
		expect(state.loading).toBe(false);
	});

	it('fetchCustomerDetail sets error on failure', async () => {
		(customerService.fetchCustomerById as jest.Mock).mockRejectedValue(
			new Error('Detail error'),
		);

		await useCustomerStore.getState().fetchCustomerDetail('any-id');

		expect(useCustomerStore.getState().error).toBe('Detail error');
		expect(useCustomerStore.getState().loading).toBe(false);
	});

	// ─── setFilters ───────────────────────────────────────────────────────────
	it('setFilters merges filters and triggers fetchCustomers', async () => {
		(customerService.fetchCustomers as jest.Mock).mockResolvedValue({ data: [], count: 0 });

		useCustomerStore.getState().setFilters({ search: 'test' });

		expect(useCustomerStore.getState().filters.search).toBe('test');
		// fetchCustomers should be called as a side-effect
		await new Promise((r) => setTimeout(r, 0));
		expect(customerService.fetchCustomers).toHaveBeenCalled();
	});

	// ─── event-driven refresh ─────────────────────────────────────────────────
	it('refreshes customers when INVOICE_CREATED event is emitted', async () => {
		(customerService.fetchCustomers as jest.Mock).mockResolvedValue({ data: [], count: 0 });

		eventBus.emit({ type: 'INVOICE_CREATED', invoiceId: 'inv-1' });

		await new Promise((r) => setTimeout(r, 0));
		expect(customerService.fetchCustomers).toHaveBeenCalled();
	});
});
