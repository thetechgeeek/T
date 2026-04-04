import { waitFor } from '@testing-library/react-native';
import { useInvoiceStore } from '@/src/stores/invoiceStore';
import { invoiceService } from '@/src/services/invoiceService';
import { eventBus } from '@/src/events/appEvents';

jest.mock('@/src/services/invoiceService');

describe('Cross-Screen Sync: Payment to Invoice Status', () => {
	const invoiceId = 'inv-123';
	const initialInvoice = {
		id: invoiceId,
		payment_status: 'unpaid',
		amount_paid: 0,
		grand_total: 1000,
	};

	beforeEach(() => {
		jest.clearAllMocks();
		useInvoiceStore.getState().reset();
	});

	it('refreshes the current invoice detail when a payment is recorded against it', async () => {
		// 1. Set current invoice in store
		useInvoiceStore.setState({ currentInvoice: initialInvoice as any });

		// 2. Mock the refresh fetch
		(invoiceService.fetchInvoiceDetail as jest.Mock).mockResolvedValue({
			...initialInvoice,
			payment_status: 'paid',
			amount_paid: 1000,
		});

		// 3. Emit payment event
		eventBus.emit({ type: 'PAYMENT_RECORDED', paymentId: 'p-1', invoiceId });

		// 4. Verify refresh
		await waitFor(() => {
			expect(invoiceService.fetchInvoiceDetail).toHaveBeenCalledWith(invoiceId);
		});

		expect(useInvoiceStore.getState().currentInvoice?.payment_status).toBe('paid');
	});

	it('refreshes the invoice list when a payment is recorded', async () => {
		(invoiceService.fetchInvoices as jest.Mock).mockResolvedValue({ data: [], count: 0 });

		eventBus.emit({ type: 'PAYMENT_RECORDED', paymentId: 'p-2', invoiceId: 'any-inv' });

		await waitFor(() => {
			expect(invoiceService.fetchInvoices).toHaveBeenCalled();
		});
	});
});
