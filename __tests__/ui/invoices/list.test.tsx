import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import InvoicesListScreen from '@/app/(app)/(tabs)/invoices';
import { useInvoiceStore } from '@/src/stores/invoiceStore';
import { renderWithTheme } from '../../utils/renderWithTheme';

// Mock store
jest.mock('@/src/stores/invoiceStore', () => ({
	useInvoiceStore: jest.fn(),
}));

const mockInvoices = [
	{
		id: 'inv-1',
		invoice_number: 'INV-001',
		customer_name: 'Test Customer',
		invoice_date: '2026-03-22',
		grand_total: 1000,
		payment_status: 'paid',
	},
];

describe('InvoicesListScreen', () => {
	const mockFetchInvoices = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		mockFetchInvoices.mockResolvedValue(undefined);
		(useInvoiceStore as unknown as jest.Mock).mockReturnValue({
			invoices: [],
			loading: false,
			totalCount: 0,
			fetchInvoices: mockFetchInvoices,
		});
	});

	it('renders invoices correctly', async () => {
		(useInvoiceStore as unknown as jest.Mock).mockReturnValue({
			invoices: mockInvoices,
			loading: false,
			totalCount: 1,
			fetchInvoices: mockFetchInvoices,
		});

		const { getByText } = renderWithTheme(<InvoicesListScreen />);

		await waitFor(() => {
			expect(getByText('INV-001')).toBeTruthy();
			expect(getByText('Test Customer')).toBeTruthy();
			expect(getByText('₹1000')).toBeTruthy();
		});

		expect(mockFetchInvoices).toHaveBeenCalled();
	});

	it('shows an alert when fetching invoices fails', async () => {
		const errorMessage = 'Public table missing';
		mockFetchInvoices.mockRejectedValue(new Error(errorMessage));

		renderWithTheme(<InvoicesListScreen />);

		const { Alert } = require('react-native');
		await waitFor(() => {
			expect(mockFetchInvoices).toHaveBeenCalled();
			expect(Alert.alert).toHaveBeenCalledWith(
				'Error',
				expect.stringContaining(errorMessage),
				expect.any(Array),
			);
		});
	});
});
