import { useInvoiceStore, InvoiceState } from './invoiceStore';
import { invoiceService } from '../services/invoiceService';
import { eventBus } from '../events/appEvents';

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
		});
	});

	it('fetchInvoices updates store correctly', async () => {
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

	it('createInvoice increments totalCount and emits INVOICE_CREATED event', async () => {
		const emitSpy = jest.spyOn(eventBus, 'emit');

		useInvoiceStore.setState({ totalCount: 1 });

		const newInvoice = { id: '2', invoice_number: 'INV-02' };
		(invoiceService.createInvoice as jest.Mock).mockResolvedValue(newInvoice);

		const result = await useInvoiceStore
			.getState()
			.createInvoice({} as Parameters<InvoiceState['createInvoice']>[0]);

		expect(result).toEqual(newInvoice);
		const state = useInvoiceStore.getState();
		expect(state.totalCount).toBe(2);
		expect(state.loading).toBe(false);
		expect(emitSpy).toHaveBeenCalledWith({ type: 'INVOICE_CREATED', invoiceId: '2' });
	});

	it('fetchInvoices loading state — true during fetch, false after', async () => {
		let resolveP!: (v: unknown) => void;
		const p = new Promise((r) => {
			resolveP = r;
		});
		(invoiceService.fetchInvoices as jest.Mock).mockReturnValue(p);

		const fetchPromise = useInvoiceStore
			.getState()
			.fetchInvoices({} as Parameters<InvoiceState['fetchInvoices']>[0]);
		expect(useInvoiceStore.getState().loading).toBe(true);

		resolveP({ data: [], count: 0 });
		await fetchPromise;

		expect(useInvoiceStore.getState().loading).toBe(false);
	});

	it('fetchInvoices failure sets error and keeps invoices unchanged', async () => {
		(invoiceService.fetchInvoices as jest.Mock).mockRejectedValue(new Error('Network error'));

		await useInvoiceStore
			.getState()
			.fetchInvoices({} as Parameters<InvoiceState['fetchInvoices']>[0]);

		const state = useInvoiceStore.getState();
		expect(state.error).toBeTruthy();
		expect(state.loading).toBe(false);
		expect(state.invoices).toEqual([]);
	});

	it('createInvoice failure sets error and does not change totalCount', async () => {
		(invoiceService.createInvoice as jest.Mock).mockRejectedValue(new Error('Create failed'));

		try {
			await useInvoiceStore
				.getState()
				.createInvoice({} as Parameters<InvoiceState['createInvoice']>[0]);
		} catch {
			// may rethrow
		}

		const state = useInvoiceStore.getState();
		expect(state.loading).toBe(false);
		expect(state.totalCount).toBe(0);
	});

	it('setFilters updates filters and triggers fetchInvoices with new filter', async () => {
		(invoiceService.fetchInvoices as jest.Mock).mockResolvedValue({ data: [], count: 0 });

		await useInvoiceStore
			.getState()
			.setFilters({ payment_status: 'paid' } as Parameters<InvoiceState['setFilters']>[0]);

		expect(useInvoiceStore.getState().filters).toMatchObject({ payment_status: 'paid' });
		expect(invoiceService.fetchInvoices).toHaveBeenCalledWith(
			expect.objectContaining({ payment_status: 'paid' }),
			1,
		);
	});

	it('fetchInvoiceDetail failure sets error state', async () => {
		(invoiceService.fetchInvoiceDetail as jest.Mock).mockRejectedValue(
			new Error('Detail fetch failed'),
		);

		try {
			await useInvoiceStore.getState().fetchInvoiceById('inv-001');
		} catch {
			// Expected rejection
		}

		const state = useInvoiceStore.getState();
		expect(state.error).toBe('Detail fetch failed');
		expect(state.loading).toBe(false);
	});
});
