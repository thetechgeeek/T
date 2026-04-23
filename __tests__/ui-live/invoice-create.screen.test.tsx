import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import CreateInvoiceScreen from '@/app/(app)/invoices/create';
import { customerService } from '@/src/services/customerService';
import { dashboardService } from '@/src/services/dashboardService';
import { inventoryService } from '@/src/services/inventoryService';
import { invoiceService } from '@/src/services/invoiceService';
import { notificationRepository } from '@/src/repositories/notificationRepository';
import { advanceDebounce, renderScreen } from '../utils/screenHarness';

jest.mock('@/src/services/customerService', () => ({
	customerService: {
		fetchCustomers: jest.fn(),
		fetchCustomerById: jest.fn(),
		fetchLedgerEntries: jest.fn(),
		getLedgerSummary: jest.fn(),
		createCustomer: jest.fn(),
		updateCustomer: jest.fn(),
	},
}));

jest.mock('@/src/services/dashboardService', () => ({
	dashboardService: {
		fetchDashboardStats: jest.fn(),
	},
}));

jest.mock('@/src/services/inventoryService', () => ({
	inventoryService: {
		fetchItems: jest.fn(),
		exportToExcel: jest.fn(),
		createItem: jest.fn(),
		updateItem: jest.fn(),
		fetchItemById: jest.fn(),
		performStockOperation: jest.fn(),
		deleteItem: jest.fn(),
	},
}));

jest.mock('@/src/repositories/notificationRepository', () => ({
	notificationRepository: {
		fetchUnread: jest.fn(),
		markAsRead: jest.fn(),
		markAllAsRead: jest.fn(),
	},
}));

jest.mock('@/src/services/invoiceService', () => ({
	invoiceService: {
		fetchInvoices: jest.fn(),
		fetchInvoiceDetail: jest.fn(),
		createInvoice: jest.fn(),
	},
}));

const inventoryItem = {
	id: 'item-1',
	base_item_number: 'MARBLE-001',
	design_name: 'Marble Gold',
	category: 'GLOSSY',
	size_name: '60x60',
	box_count: 50,
	has_batch_tracking: false,
	has_serial_tracking: false,
	selling_price: 1000,
	cost_price: 700,
	gst_rate: 18,
	hsn_code: '6908',
	low_stock_threshold: 5,
};

describe('Invoice creation screen live wiring', () => {
	beforeEach(() => {
		jest.useFakeTimers();
		jest.clearAllMocks();
		(customerService.fetchCustomers as jest.Mock).mockResolvedValue({
			data: [],
			count: 0,
		});
		(dashboardService.fetchDashboardStats as jest.Mock).mockResolvedValue({
			todaySales: 0,
			totalCustomers: 0,
			totalSuppliers: 0,
			todayExpenses: 0,
			outstandingReceivables: 0,
			outstandingPayables: 0,
			lowStockCount: 0,
			monthlyRevenue: 0,
			monthlyProfit: 0,
		});
		(inventoryService.fetchItems as jest.Mock).mockResolvedValue({
			data: [inventoryItem],
			count: 1,
		});
		(invoiceService.createInvoice as jest.Mock).mockResolvedValue({
			id: 'invoice-1',
			invoice_number: 'TM/2026-27/0001',
		});
		(notificationRepository.fetchUnread as jest.Mock).mockResolvedValue([]);
	});

	afterEach(() => {
		jest.runOnlyPendingTimers();
		jest.useRealTimers();
	});

	it('completes invoice creation through the real stores and mocked service boundary', async () => {
		const screen = await renderScreen(<CreateInvoiceScreen />);

		await waitFor(() => {
			expect(inventoryService.fetchItems).toHaveBeenCalled();
		});

		fireEvent.changeText(screen.getByLabelText('customer-name-input'), 'Test Customer');
		fireEvent.changeText(screen.getByLabelText('customer-phone-input'), '9876543210');
		fireEvent.press(screen.getByLabelText('invoice-next-button'));

		await waitFor(() => {
			expect(screen.getByLabelText('invoice-step-2')).toBeTruthy();
		});

		fireEvent.press(screen.getByLabelText('add-item-button'));
		await advanceDebounce(450);

		fireEvent.press(screen.getByLabelText('Marble Gold'));
		fireEvent.changeText(screen.getByLabelText('item-quantity-input'), '3');
		fireEvent.press(screen.getByLabelText('confirm-add-item'));

		expect(screen.getByText('Marble Gold')).toBeTruthy();

		fireEvent.press(screen.getByLabelText('invoice-next-button'));

		await waitFor(() => {
			expect(screen.getByLabelText('invoice-step-3')).toBeTruthy();
		});

		fireEvent.press(screen.getByLabelText('paid-in-full-chip'));
		fireEvent.press(screen.getByLabelText('generate-invoice-button'));

		await waitFor(() => {
			expect(invoiceService.createInvoice).toHaveBeenCalledWith(
				expect.objectContaining({
					customer_name: 'Test Customer',
					customer_phone: '9876543210',
					amount_paid: expect.any(Number),
					payment_status: 'paid',
					line_items: expect.arrayContaining([
						expect.objectContaining({
							item_id: 'item-1',
							quantity: 3,
						}),
					]),
				}),
			);
		});

		expect(screen.router.replace).toHaveBeenCalledWith('/(app)/invoices/invoice-1');
	});
});
