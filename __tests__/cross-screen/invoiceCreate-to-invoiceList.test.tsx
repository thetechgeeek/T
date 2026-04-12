import { waitFor } from '@testing-library/react-native';
import { useInvoiceStore } from '@/src/stores/invoiceStore';
import { useDashboardStore } from '@/src/stores/dashboardStore';
import { invoiceService } from '@/src/services/invoiceService';
import { dashboardService } from '@/src/services/dashboardService';
import type { InvoiceInput } from '@/src/types/invoice';

jest.mock('@/src/services/invoiceService');
jest.mock('@/src/services/dashboardService');

describe('Cross-Screen Sync: Invoice Creation Sync', () => {
	// Explicitly reference the stores to ensure their top-level listeners are registered by Jest
	useDashboardStore.getState();

	beforeEach(() => {
		jest.clearAllMocks();
		useInvoiceStore.getState().reset();
		// Dashboard store refresh logic is in its own subscription
	});

	it('adds newly created invoice to the top of the invoice list store', async () => {
		const newInvoice = {
			id: 'inv-1',
			invoice_number: 'TM/001',
			customer_name: 'Test',
			grand_total: 1000,
			invoice_date: '2026-04-04',
		};

		(invoiceService.createInvoice as jest.Mock).mockResolvedValue(newInvoice);

		// 1. Create invoice
		await useInvoiceStore.getState().createInvoice({
			customer_name: 'Test',
			line_items: [],
		} as unknown as InvoiceInput);

		// 2. Verify store list
		const invoices = useInvoiceStore.getState().invoices;
		expect(invoices).toHaveLength(1);
		expect(invoices[0].id).toBe('inv-1');
	});

	it('triggers dashboard stats refresh when an invoice is created', async () => {
		(invoiceService.createInvoice as jest.Mock).mockResolvedValue({ id: 'inv-2' });
		(dashboardService.fetchDashboardStats as jest.Mock).mockResolvedValue({
			today_invoice_count: 5,
		});

		// 1. Create invoice
		await useInvoiceStore.getState().createInvoice({} as unknown as InvoiceInput);

		// 2. Verify dashboard refresh was triggered via EventBus
		await waitFor(() => {
			expect(dashboardService.fetchDashboardStats).toHaveBeenCalled();
		});
	});
});
