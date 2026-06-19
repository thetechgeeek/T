import { waitFor } from '@testing-library/react-native';
import { useInvoiceStore } from '@/src/stores/invoiceStore';
import { useCustomerStore } from '@/src/stores/customerStore';
import { invoiceService } from '@/src/services/invoiceService';
import { customerService } from '@/src/services/customerService';
import {
	startStoreOrchestrator,
	stopStoreOrchestrator,
} from '@/src/orchestrators/storeOrchestrator';

jest.mock('@/src/services/invoiceService');
jest.mock('@/src/services/customerService');

/**
 * Phase 7: Cross-Screen State
 * Verifies that the customer list appropriately refreshes when a new invoice is created.
 */
describe('Cross-Screen Sync: Customer List Refresh', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		useInvoiceStore.getState().reset();
		useCustomerStore.getState().reset();
		startStoreOrchestrator();
	});

	afterEach(() => {
		stopStoreOrchestrator();
	});

	it('refreshes customer list when a new invoice is created', async () => {
		const newCustomerName = 'Brand New Customer Ltd';

		(invoiceService.createInvoice as jest.Mock).mockResolvedValue({
			id: 'inv-123',
			invoice_number: 'TM/999',
			customer_name: newCustomerName,
		});
		(customerService.fetchCustomers as jest.Mock).mockResolvedValue({ data: [], count: 0 });

		// 1. Create invoice with a "new" customer name
		await useInvoiceStore.getState().createInvoice({
			customer_name: newCustomerName,
			customer_phone: '1234567890',
			invoice_date: '2026-04-04',
			line_items: [],
			grand_total: 1000,
		} as any);

		// 2. Verify that customerStore.fetchCustomers WAS called (Sync Fixed)
		await waitFor(() => {
			expect(customerService.fetchCustomers).toHaveBeenCalled();
		});

		// 3. Verify store state update
		expect(useCustomerStore.getState().loading).toBe(false);
	});
});
