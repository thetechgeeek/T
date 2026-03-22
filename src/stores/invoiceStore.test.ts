import { useInvoiceStore } from './invoiceStore';
import { invoiceService } from '../services/invoiceService';

jest.mock('../services/invoiceService', () => ({
  invoiceService: {
    fetchInvoices: jest.fn(),
    createInvoice: jest.fn(),
  }
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
    (invoiceService.fetchInvoices as jest.Mock).mockResolvedValue({ data: mockInvoices, count: 1 });

    await useInvoiceStore.getState().fetchInvoices();

    const state = useInvoiceStore.getState();
    expect(state.invoices).toEqual(mockInvoices);
    expect(state.totalCount).toBe(1);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('createInvoice adds new invoice to the list', async () => {
    // start with 1 invoice
    useInvoiceStore.setState({ invoices: [{ id: '1', invoice_number: 'INV-01' } as any] });

    const newInvoice = { id: '2', invoice_number: 'INV-02' };
    (invoiceService.createInvoice as jest.Mock).mockResolvedValue(newInvoice);

    await useInvoiceStore.getState().createInvoice({} as any);

    const state = useInvoiceStore.getState();
    expect(state.invoices).toHaveLength(2);
    expect(state.invoices[0].id).toBe('2'); // Expected to be unshifted (added to beginning)
  });
});
