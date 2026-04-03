import React from 'react';
import { waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import InvoicesListScreen from '@/app/(app)/(tabs)/invoices';
import { useInvoiceStore } from '@/src/stores/invoiceStore';
import { renderWithTheme } from '../../utils/renderWithTheme';

// Mock store
jest.mock('@/src/stores/invoiceStore', () => ({
	useInvoiceStore: jest.fn(),
}));

jest.mock('@/src/hooks/useLocale', () => ({
	useLocale: () => ({
		t: (key: string) => {
			const map: Record<string, string> = {
				'common.errorTitle': 'Error',
				'common.ok': 'OK',
				'invoice.loadError': 'Failed to load invoices',
			};
			return map[key] ?? key.split('.').pop() ?? key;
		},
		formatCurrency: (amount: number) => `₹${amount}`,
	}),
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
		mockFetchInvoices.mockRejectedValue(new Error('Public table missing'));

		renderWithTheme(<InvoicesListScreen />);

		await waitFor(() => {
			expect(mockFetchInvoices).toHaveBeenCalled();
			// Component shows translated 'invoice.loadError' string, not raw error
			expect(Alert.alert).toHaveBeenCalledWith(
				'Error',
				'Failed to load invoices',
				expect.any(Array),
			);
		});
	});

	// ─── Phase 3: Loading & Empty UI States ──────────────────────────────────

	it('shows empty state text when invoices=[] and loading=false', async () => {
		const { getByText } = renderWithTheme(<InvoicesListScreen />);
		await waitFor(() => expect(getByText('No invoices found.')).toBeTruthy());
	});

	it('shows empty state even when loading=true — documents absence of loading guard', async () => {
		// Unlike inventory tab, invoices list has no ActivityIndicator guard —
		// ListEmptyComponent renders regardless of loading state.
		(useInvoiceStore as unknown as jest.Mock).mockReturnValue({
			invoices: [],
			loading: true,
			totalCount: 0,
			fetchInvoices: mockFetchInvoices,
		});

		const { getByText } = renderWithTheme(<InvoicesListScreen />);
		await waitFor(() => expect(getByText('No invoices found.')).toBeTruthy());
	});
});
