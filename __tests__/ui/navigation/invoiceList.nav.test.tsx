import React from 'react';
import { waitFor, fireEvent } from '@testing-library/react-native';
import InvoicesListScreen from '@/app/(app)/(tabs)/invoices';
import { useInvoiceStore } from '@/src/stores/invoiceStore';
import { renderWithTheme } from '../../utils/renderWithTheme';
import { useRouter } from 'expo-router';

// Only mock what's NOT in jest.setup.ts or what needs specific override
jest.mock('@/src/stores/invoiceStore', () => ({
	useInvoiceStore: jest.fn(),
}));

const mockPush = jest.fn();

beforeEach(() => {
	jest.clearAllMocks();

	// Rely on global expo-router mock but set specific return values
	(useRouter as jest.Mock).mockReturnValue({ push: mockPush, back: jest.fn() });

	(useInvoiceStore as unknown as jest.Mock).mockReturnValue({
		invoices: [],
		loading: false,
		totalCount: 0,
		fetchInvoices: jest.fn().mockResolvedValue(undefined),
	});
});

describe('InvoiceList Navigation Wiring', () => {
	it('Press create button -> correct create route called', async () => {
		const { getByLabelText } = renderWithTheme(<InvoicesListScreen />);
		await waitFor(() => expect(getByLabelText('new-invoice-button')).toBeTruthy());
		fireEvent.press(getByLabelText('new-invoice-button'));
		expect(mockPush).toHaveBeenCalledWith('/(app)/invoices/create');
	});

	it('Press invoice row -> router.push("/(app)/invoices/${invoice.id}") called', async () => {
		const mockInvoice = {
			id: 'inv-123',
			invoice_number: 'INV-123',
			customer_name: 'Test Customer',
			invoice_date: '2026-03-22',
			grand_total: 1000,
			payment_status: 'paid',
		};

		(useInvoiceStore as unknown as jest.Mock).mockReturnValue({
			invoices: [mockInvoice],
			loading: false,
			totalCount: 1,
			fetchInvoices: jest.fn().mockResolvedValue(undefined),
		});

		const { getByText } = renderWithTheme(<InvoicesListScreen />);
		await waitFor(() => expect(getByText('INV-123')).toBeTruthy());
		fireEvent.press(getByText('INV-123'));

		expect(mockPush).toHaveBeenCalledWith('/(app)/invoices/inv-123');
	});
});
