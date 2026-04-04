import React from 'react';
import { waitFor } from '@testing-library/react-native';
import InvoicesListScreen from '@/app/(app)/(tabs)/invoices';
import { useInvoiceStore } from '@/src/stores/invoiceStore';
import { renderWithTheme } from '../../utils/renderWithTheme';

// Only mock what's NOT in jest.setup.ts or what needs specific override
jest.mock('@/src/stores/invoiceStore', () => ({
	useInvoiceStore: jest.fn(),
}));

beforeEach(() => {
	jest.clearAllMocks();
});

describe('InvoiceList Loading & Error UI States', () => {
	it('shows "No invoices found" when invoices=[] and loading=false', async () => {
		(useInvoiceStore as unknown as jest.Mock).mockReturnValue({
			invoices: [],
			loading: false,
			totalCount: 0,
			fetchInvoices: jest.fn().mockResolvedValue(undefined),
		});

		const { getByText } = renderWithTheme(<InvoicesListScreen />);
		await waitFor(() => expect(getByText('No invoices found.')).toBeTruthy());
	});

	it('documents the lack of loading guard — shows "No invoices found" even when loading=true', async () => {
		// Unlike inventory tab, invoices list has no ActivityIndicator guard —
		// ListEmptyComponent renders regardless of loading state.
		(useInvoiceStore as unknown as jest.Mock).mockReturnValue({
			invoices: [],
			loading: true,
			totalCount: 0,
			fetchInvoices: jest.fn().mockResolvedValue(undefined),
		});

		const { getByText } = renderWithTheme(<InvoicesListScreen />);
		await waitFor(() => expect(getByText('No invoices found.')).toBeTruthy());
	});

	it('renders invoice row and NO empty state after successful fetch', async () => {
		(useInvoiceStore as unknown as jest.Mock).mockReturnValue({
			invoices: [
				{
					id: 'inv-123',
					invoice_number: 'INV-123',
					customer_name: 'Test Customer',
					grand_total: 1000,
					payment_status: 'paid',
				},
			],
			loading: false,
			totalCount: 1,
			fetchInvoices: jest.fn().mockResolvedValue(undefined),
		});

		const { getByText, queryByText } = renderWithTheme(<InvoicesListScreen />);

		await waitFor(() => expect(getByText('INV-123')).toBeTruthy());
		expect(queryByText('No invoices found.')).toBeNull();
	});
});
