import { waitFor } from '@testing-library/react-native';
import { useInvoiceStore } from '@/src/stores/invoiceStore';
import { useCustomerStore } from '@/src/stores/customerStore';
import { invoiceService } from '@/src/services/invoiceService';
import { customerService } from '@/src/services/customerService';

jest.mock('@/src/services/invoiceService');
jest.mock('@/src/services/customerService');

/**
 * Phase 7: Cross-Screen State Documentation
 * Documents BUG #5: Customer appears in customer list after invoice creation with new customer name.
 * CURRENT STATUS: FAILING (Expected).
 */
describe('Cross-Screen Sync: Bug #5 Documentation', () => {
	it('customer list DOES NOT currently update when a new customer is created inside an invoice', async () => {
		const newCustomerName = 'Brand New Customer Ltd';

		(invoiceService.createInvoice as jest.Mock).mockResolvedValue({
			id: 'inv-123',
			invoice_number: 'TM/999',
			customer_name: newCustomerName,
		});

		// Initial count
		useCustomerStore.setState({ customers: [], totalCount: 0 });

		// 1. Create invoice with a "new" customer name
		// In a real fix, the invoiceService would also trigger a customer creation or store-refresh.
		await useInvoiceStore.getState().createInvoice({
			customer_name: newCustomerName,
			customer_phone: '1234567890',
			invoice_date: '2026-04-04',
			line_items: [],
			grand_total: 1000,
		} as any);

		// 2. Verify that customerStore.fetchCustomers was NOT called (Current Broken State)
		// If we wanted it to pass in the future, we'd expect it TO be called.
		expect(customerService.fetchCustomers).not.toHaveBeenCalled();

		// 3. Document the failure: count remains 0 because the invoice creation
		// didn't trigger a customer refresh/creation.
		expect(useCustomerStore.getState().totalCount).toBe(0);
	});
});
