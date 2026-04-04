import { waitFor } from '@testing-library/react-native';
import { useInvoiceStore } from '@/src/stores/invoiceStore';
import { useCustomerStore } from '@/src/stores/customerStore';
import { invoiceService } from '@/src/services/invoiceService';
import { customerService } from '@/src/services/customerService';

jest.mock('@/src/services/invoiceService');
jest.mock('@/src/services/customerService');

describe('Cross-Screen Sync: Invoice to Customer Ledger', () => {
	const customerId = 'cust-1';

	beforeEach(() => {
		jest.clearAllMocks();
		useInvoiceStore.getState().reset();
		useCustomerStore.getState().reset();

		// Set a "selected" customer
		useCustomerStore.setState({
			selectedCustomer: { id: customerId, name: 'Test' } as any,
		});
	});

	it('refreshes customer detailed ledger when a new invoice is created for them', async () => {
		(invoiceService.createInvoice as jest.Mock).mockResolvedValue({
			id: 'inv-1',
			invoice_number: 'TM/001',
		});

		// Mock ledger refresh responses
		(customerService.fetchCustomerById as jest.Mock).mockResolvedValue({
			id: customerId,
			name: 'Test',
		});
		(customerService.fetchLedgerEntries as jest.Mock).mockResolvedValue([
			{ id: 'inv-1', type: 'invoice' },
		]);
		(customerService.getLedgerSummary as jest.Mock).mockResolvedValue({ balance: 1000 });

		// 1. Create invoice for the selected customer
		await useInvoiceStore.getState().createInvoice({
			customer_id: customerId,
			customer_name: 'Test',
			invoice_date: '2026-04-04',
			line_items: [],
			is_inter_state: false,
			payment_status: 'unpaid',
			amount_paid: 0,
		} as any);

		// 2. Verify that customer ledger refresh was triggered
		await waitFor(() => {
			expect(customerService.fetchCustomerById).toHaveBeenCalledWith(customerId);
			expect(customerService.fetchLedgerEntries).toHaveBeenCalledWith(customerId);
		});

		expect(useCustomerStore.getState().ledger).toHaveLength(1);
	});

	it('does NOT refresh ledger if invoice is for a different customer', async () => {
		(invoiceService.createInvoice as jest.Mock).mockResolvedValue({
			id: 'inv-2',
			invoice_number: 'TM/002',
		});

		await useInvoiceStore.getState().createInvoice({
			customer_id: 'different-cust',
			customer_name: 'Other',
			invoice_date: '2026-04-04',
			line_items: [],
		} as any);

		// Should NOT have refreshed the active ledger for 'cust-1'
		expect(customerService.fetchCustomerById).not.toHaveBeenCalled();
	});
});
