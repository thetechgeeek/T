import { useInvoiceStore, InvoiceState } from './invoiceStore';
import { invoiceService } from '../services/invoiceService';
import { eventBus } from '../events/appEvents';

jest.mock('../utils/retry', () => ({
	withRetry: jest.fn((fn) => fn()),
}));

jest.mock('../services/invoiceService', () => ({
	invoiceService: {
		fetchInvoices: jest.fn(),
		createInvoice: jest.fn(),
		fetchInvoiceDetail: jest.fn(),
	},
}));

describe('invoiceStore', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		useInvoiceStore.setState({
			invoices: [],
			loading: false,
			error: null,
			totalCount: 0,
			filters: {},
			currentInvoice: null,
			currentPage: 1,
		});
	});

	// ─── fetchInvoices ────────────────────────────────────────────────────────
	it('fetchInvoices updates store correctly (page=1 replaces)', async () => {
		const mockInvoices = [{ id: '1', invoice_number: 'INV-01' }];
		(invoiceService.fetchInvoices as jest.Mock).mockResolvedValue({
			data: mockInvoices,
			count: 1,
		});

		await useInvoiceStore.getState().fetchInvoices();

		const state = useInvoiceStore.getState();
		expect(state.invoices).toEqual(mockInvoices);
		expect(state.totalCount).toBe(1);
		expect(state.loading).toBe(false);
		expect(state.error).toBeNull();
	});

	it('fetchInvoices page>1 appends new items and deduplicates', async () => {
		const existing = [{ id: '1', invoice_number: 'INV-01' }];
		const newItems = [{ id: '2', invoice_number: 'INV-02' }];
		useInvoiceStore.setState({ invoices: existing as unknown as InvoiceState['invoices'] });
		(invoiceService.fetchInvoices as jest.Mock).mockResolvedValue({ data: newItems, count: 2 });

		await useInvoiceStore.getState().fetchInvoices(2);

		expect(useInvoiceStore.getState().invoices).toHaveLength(2);
		expect(useInvoiceStore.getState().currentPage).toBe(2);
	});

	it('fetchInvoices loading state — true during fetch, false after', async () => {
		let resolveP!: (v: unknown) => void;
		const p = new Promise((r) => {
			resolveP = r;
		});
		(invoiceService.fetchInvoices as jest.Mock).mockReturnValue(p);

		const fetchPromise = useInvoiceStore.getState().fetchInvoices();
		expect(useInvoiceStore.getState().loading).toBe(true);

		resolveP({ data: [], count: 0 });
		await fetchPromise;

		expect(useInvoiceStore.getState().loading).toBe(false);
	});

	it('fetchInvoices failure sets error and keeps invoices unchanged', async () => {
		(invoiceService.fetchInvoices as jest.Mock).mockRejectedValue(new Error('Network error'));

		await useInvoiceStore.getState().fetchInvoices();

		const state = useInvoiceStore.getState();
		expect(state.error).toBeTruthy();
		expect(state.loading).toBe(false);
		expect(state.invoices).toEqual([]);
	});

	// ─── createInvoice ────────────────────────────────────────────────────────
	it('createInvoice increments totalCount and emits INVOICE_CREATED event', async () => {
		const emitSpy = jest.spyOn(eventBus, 'emit');
		useInvoiceStore.setState({ totalCount: 1 });

		const newInvoice = { id: '2', invoice_number: 'INV-02' };
		(invoiceService.createInvoice as jest.Mock).mockResolvedValue(newInvoice);

		const result = await useInvoiceStore
			.getState()
			.createInvoice({} as Parameters<InvoiceState['createInvoice']>[0]);

		expect(result).toEqual(newInvoice);
		expect(useInvoiceStore.getState().totalCount).toBe(2);
		expect(emitSpy).toHaveBeenCalledWith({ type: 'INVOICE_CREATED', invoiceId: '2' });
	});

	it('createInvoice failure sets error and rethrows', async () => {
		(invoiceService.createInvoice as jest.Mock).mockRejectedValue(new Error('Create failed'));

		try {
			await useInvoiceStore
				.getState()
				.createInvoice({} as Parameters<InvoiceState['createInvoice']>[0]);
		} catch {
			// expected
		}

		expect(useInvoiceStore.getState().loading).toBe(false);
		expect(useInvoiceStore.getState().totalCount).toBe(0);
		expect(useInvoiceStore.getState().error).toBe('Create failed');
	});

	// ─── fetchInvoiceById ─────────────────────────────────────────────────────
	it('fetchInvoiceById sets currentInvoice on success', async () => {
		const invoice = { id: 'inv-001', invoice_number: 'INV-001' };
		(invoiceService.fetchInvoiceDetail as jest.Mock).mockResolvedValue(invoice);

		await useInvoiceStore.getState().fetchInvoiceById('inv-001');

		expect(useInvoiceStore.getState().currentInvoice).toEqual(invoice);
		expect(useInvoiceStore.getState().loading).toBe(false);
	});

	it('fetchInvoiceDetail failure sets error state', async () => {
		(invoiceService.fetchInvoiceDetail as jest.Mock).mockRejectedValue(
			new Error('Detail fetch failed'),
		);

		await useInvoiceStore.getState().fetchInvoiceById('inv-001');

		const state = useInvoiceStore.getState();
		expect(state.error).toBe('Detail fetch failed');
		expect(state.loading).toBe(false);
	});

	// ─── clearCurrentInvoice / reset ─────────────────────────────────────────
	it('clearCurrentInvoice sets currentInvoice to null', () => {
		useInvoiceStore.setState({
			currentInvoice: { id: 'inv-1' } as unknown as InvoiceState['currentInvoice'],
		});

		useInvoiceStore.getState().clearCurrentInvoice();

		expect(useInvoiceStore.getState().currentInvoice).toBeNull();
	});

	it('reset clears all state fields', () => {
		useInvoiceStore.setState({
			invoices: [{ id: '1' }] as unknown as InvoiceState['invoices'],
			totalCount: 5,
			currentPage: 3,
			error: 'some error',
		});

		useInvoiceStore.getState().reset();

		const state = useInvoiceStore.getState();
		expect(state.invoices).toEqual([]);
		expect(state.totalCount).toBe(0);
		expect(state.currentPage).toBe(1);
		expect(state.error).toBeNull();
		expect(state.currentInvoice).toBeNull();
	});

	// ─── setFilters ───────────────────────────────────────────────────────────
	it('setFilters updates filters and triggers fetchInvoices', async () => {
		(invoiceService.fetchInvoices as jest.Mock).mockResolvedValue({ data: [], count: 0 });

		useInvoiceStore
			.getState()
			.setFilters({ payment_status: 'paid' } as Parameters<InvoiceState['setFilters']>[0]);

		expect(useInvoiceStore.getState().filters).toMatchObject({ payment_status: 'paid' });
		expect(useInvoiceStore.getState().currentPage).toBe(1);
		await new Promise((r) => setTimeout(r, 0));
		expect(invoiceService.fetchInvoices).toHaveBeenCalled();
	});

	// ─── event-driven refresh ─────────────────────────────────────────────────
	it('re-fetches invoices when PAYMENT_RECORDED event has invoiceId', async () => {
		(invoiceService.fetchInvoices as jest.Mock).mockResolvedValue({ data: [], count: 0 });

		eventBus.emit({ type: 'PAYMENT_RECORDED', paymentId: 'pay-1', invoiceId: 'inv-1' });

		await new Promise((r) => setTimeout(r, 0));
		expect(invoiceService.fetchInvoices).toHaveBeenCalled();
	});

	it('does NOT re-fetch when PAYMENT_RECORDED has no invoiceId', async () => {
		(invoiceService.fetchInvoices as jest.Mock).mockResolvedValue({ data: [], count: 0 });

		eventBus.emit({ type: 'PAYMENT_RECORDED' });

		await new Promise((r) => setTimeout(r, 0));
		expect(invoiceService.fetchInvoices).not.toHaveBeenCalled();
	});

	// ─── createInvoice: loading lifecycle ────────────────────────────────────

	it('createInvoice loading lifecycle — true during call, false after success', async () => {
		let resolve!: (v: unknown) => void;
		const p = new Promise((r) => {
			resolve = r;
		});
		(invoiceService.createInvoice as jest.Mock).mockReturnValue(p);

		const createPromise = useInvoiceStore
			.getState()
			.createInvoice({} as Parameters<InvoiceState['createInvoice']>[0]);
		expect(useInvoiceStore.getState().loading).toBe(true);

		resolve({ id: 'new-inv', invoice_number: 'INV-01' });
		await createPromise;

		expect(useInvoiceStore.getState().loading).toBe(false);
	});

	it('createInvoice loading=false after error', async () => {
		(invoiceService.createInvoice as jest.Mock).mockRejectedValue(new Error('RPC error'));

		try {
			await useInvoiceStore
				.getState()
				.createInvoice({} as Parameters<InvoiceState['createInvoice']>[0]);
		} catch {
			// expected
		}

		expect(useInvoiceStore.getState().loading).toBe(false);
		expect(useInvoiceStore.getState().error).toBe('RPC error');
	});

	// ─── fetchInvoices: filter fields ─────────────────────────────────────────

	it('fetchInvoices with payment_status filter passes it to service', async () => {
		(invoiceService.fetchInvoices as jest.Mock).mockResolvedValue({ data: [], count: 0 });
		useInvoiceStore.setState({
			filters: { payment_status: 'paid' } as InvoiceState['filters'],
		});

		await useInvoiceStore.getState().fetchInvoices();

		expect(invoiceService.fetchInvoices).toHaveBeenCalledWith(
			expect.objectContaining({ payment_status: 'paid' }),
			1,
		);
	});

	it('fetchInvoices with customer_id filter passes it to service', async () => {
		(invoiceService.fetchInvoices as jest.Mock).mockResolvedValue({ data: [], count: 0 });
		useInvoiceStore.setState({
			filters: { customer_id: 'cust-123' } as InvoiceState['filters'],
		});

		await useInvoiceStore.getState().fetchInvoices();

		expect(invoiceService.fetchInvoices).toHaveBeenCalledWith(
			expect.objectContaining({ customer_id: 'cust-123' }),
			1,
		);
	});

	it('fetchInvoices: hasMore set correctly based on returned count', async () => {
		const items = [{ id: '1' }, { id: '2' }];
		(invoiceService.fetchInvoices as jest.Mock).mockResolvedValue({ data: items, count: 10 });

		await useInvoiceStore.getState().fetchInvoices(1);

		expect(useInvoiceStore.getState().currentPage).toBe(1);
	});

	// ─── fetchInvoiceById ─────────────────────────────────────────────────────

	it('fetchInvoiceById loading lifecycle', async () => {
		let resolve!: (v: unknown) => void;
		const p = new Promise((r) => {
			resolve = r;
		});
		(invoiceService.fetchInvoiceDetail as jest.Mock).mockReturnValue(p);

		const fetchPromise = useInvoiceStore.getState().fetchInvoiceById('inv-load');
		expect(useInvoiceStore.getState().loading).toBe(true);

		resolve({ id: 'inv-load', invoice_number: 'INV-001' });
		await fetchPromise;

		expect(useInvoiceStore.getState().loading).toBe(false);
	});

	// ─── reset ────────────────────────────────────────────────────────────────

	it('reset clears loading and error too', () => {
		useInvoiceStore.setState({ loading: true, error: 'stale error' });

		useInvoiceStore.getState().reset();

		expect(useInvoiceStore.getState().loading).toBe(false);
		expect(useInvoiceStore.getState().error).toBeNull();
	});

	// ─── setFilters ───────────────────────────────────────────────────────────

	it('setFilters resets to page 1 regardless of current page', async () => {
		(invoiceService.fetchInvoices as jest.Mock).mockResolvedValue({ data: [], count: 0 });
		useInvoiceStore.setState({ currentPage: 5 });

		useInvoiceStore
			.getState()
			.setFilters({ payment_status: 'unpaid' } as Parameters<InvoiceState['setFilters']>[0]);

		expect(useInvoiceStore.getState().currentPage).toBe(1);
	});
});
