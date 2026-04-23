import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import InvoicesListScreen from '@/app/(app)/(tabs)/invoices';
import { invoiceService } from '@/src/services/invoiceService';
import { renderScreen } from '../utils/screenHarness';

jest.mock('@/src/services/invoiceService', () => ({
	invoiceService: {
		fetchInvoices: jest.fn(),
		fetchInvoiceDetail: jest.fn(),
		createInvoice: jest.fn(),
	},
}));

const unpaidInvoice = {
	id: 'invoice-1',
	invoice_number: 'TM/2026-27/0001',
	customer_name: 'Rajesh Tiles',
	invoice_date: '2026-04-21',
	grand_total: 12000,
	amount_paid: 0,
	payment_status: 'unpaid',
	line_items: [],
};

const paidInvoice = {
	...unpaidInvoice,
	id: 'invoice-2',
	invoice_number: 'TM/2026-27/0002',
	customer_name: 'Walk-in Customer',
	amount_paid: 8000,
	grand_total: 8000,
	payment_status: 'paid',
};

describe('Invoice list screen live wiring', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		(invoiceService.fetchInvoices as jest.Mock).mockResolvedValue({
			data: [unpaidInvoice, paidInvoice],
			count: 2,
		});
	});

	it('loads invoices through the real store and filters the visible list locally', async () => {
		const screen = await renderScreen(<InvoicesListScreen />);

		await waitFor(() => {
			expect(invoiceService.fetchInvoices).toHaveBeenCalledWith({}, 1);
		});

		expect(screen.getByText('TM/2026-27/0001')).toBeTruthy();
		expect(screen.getByText('TM/2026-27/0002')).toBeTruthy();

		fireEvent.changeText(screen.getByLabelText('invoice-search-input'), 'Rajesh');

		await waitFor(() => {
			expect(screen.getByText('TM/2026-27/0001')).toBeTruthy();
		});

		expect(screen.queryByText('TM/2026-27/0002')).toBeNull();
	});

	it('navigates to invoice creation from the real screen', async () => {
		const screen = await renderScreen(<InvoicesListScreen />);

		await waitFor(() => {
			expect(invoiceService.fetchInvoices).toHaveBeenCalledTimes(1);
		});

		fireEvent.press(screen.getByLabelText('new-invoice-button'));

		expect(screen.router.push).toHaveBeenCalledWith('/(app)/invoices/create');
	});
});
