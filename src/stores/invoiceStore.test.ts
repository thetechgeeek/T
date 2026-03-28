import { useInvoiceStore } from './invoiceStore';
import { invoiceService } from '../services/invoiceService';

jest.mock('../services/invoiceService', () => ({
	invoiceService: {
		fetchInvoices: jest.fn(),
		createInvoice: jest.fn(),
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
		const { eventBus } = require('../events/appEvents');
		const emitSpy = jest.spyOn(eventBus, 'emit');

		useInvoiceStore.setState({ totalCount: 1 });

		const newInvoice = { id: '2', invoice_number: 'INV-02' };
		(invoiceService.createInvoice as jest.Mock).mockResolvedValue(newInvoice);

		const result = await useInvoiceStore.getState().createInvoice({} as any);

		expect(result).toEqual(newInvoice);
		const state = useInvoiceStore.getState();
		expect(state.totalCount).toBe(2);
		expect(state.loading).toBe(false);
		expect(emitSpy).toHaveBeenCalledWith({ type: 'INVOICE_CREATED', invoiceId: '2' });
	});
});
