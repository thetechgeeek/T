import React from 'react';
import { waitFor, fireEvent } from '@testing-library/react-native';
import InvoicesListScreen from '@/app/(app)/(tabs)/invoices';
import { useInvoiceStore, InvoiceState } from '@/src/stores/invoiceStore';
import { renderWithTheme } from '../../utils/renderWithTheme';
import { useRouter } from 'expo-router';

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
		formatCurrency: (amount: number) => `₹${amount.toFixed(2)}`,
	}),
}));

const mockFetchInvoices = jest.fn();
const mockPush = jest.fn();

const mockInvoices = [
	{
		id: 'inv-1',
		invoice_number: 'TM-001',
		invoice_date: '2026-03-01',
		customer_name: 'Rajesh Shah',
		payment_status: 'paid',
		grand_total: 12000,
	},
	{
		id: 'inv-2',
		invoice_number: 'TM-002',
		invoice_date: '2026-03-15',
		customer_name: 'Mohan Tiles',
		payment_status: 'pending',
		grand_total: 8500,
	},
];

beforeEach(() => {
	jest.clearAllMocks();
	mockFetchInvoices.mockResolvedValue(undefined);
	(useRouter as jest.Mock).mockReturnValue({ push: mockPush, back: jest.fn() });
	(useInvoiceStore as unknown as jest.Mock).mockImplementation(
		(selector: (state: InvoiceState) => unknown) =>
			selector({
				invoices: mockInvoices,
				fetchInvoices: mockFetchInvoices,
				loading: false,
				totalCount: 2,
			} as unknown as InvoiceState),
	);
});

describe('InvoicesListScreen', () => {
	it('renders Invoices heading', () => {
		const { getByText } = renderWithTheme(<InvoicesListScreen />);
		expect(getByText('Invoices')).toBeTruthy();
	});

	it('renders New Invoice button', () => {
		const { getByText } = renderWithTheme(<InvoicesListScreen />);
		expect(getByText('New Invoice')).toBeTruthy();
	});

	it('calls fetchInvoices on mount', async () => {
		renderWithTheme(<InvoicesListScreen />);
		await waitFor(() => {
			expect(mockFetchInvoices).toHaveBeenCalled();
		});
	});

	it('renders invoice numbers', async () => {
		const { getByText } = renderWithTheme(<InvoicesListScreen />);
		await waitFor(() => {
			expect(getByText('TM-001')).toBeTruthy();
			expect(getByText('TM-002')).toBeTruthy();
		});
	});

	it('renders customer names', async () => {
		const { getByText } = renderWithTheme(<InvoicesListScreen />);
		await waitFor(() => {
			expect(getByText('Rajesh Shah')).toBeTruthy();
			expect(getByText('Mohan Tiles')).toBeTruthy();
		});
	});

	it('renders grand totals formatted', async () => {
		const { getByText } = renderWithTheme(<InvoicesListScreen />);
		await waitFor(() => {
			expect(getByText('₹12000.00')).toBeTruthy();
			expect(getByText('₹8500.00')).toBeTruthy();
		});
	});

	it('renders payment status badges', async () => {
		const { getByText } = renderWithTheme(<InvoicesListScreen />);
		await waitFor(() => {
			expect(getByText('paid')).toBeTruthy();
			expect(getByText('pending')).toBeTruthy();
		});
	});

	it('shows empty state when no invoices', async () => {
		(useInvoiceStore as unknown as jest.Mock).mockImplementation(
			(selector: (state: InvoiceState) => unknown) =>
				selector({
					invoices: [],
					fetchInvoices: mockFetchInvoices,
					loading: false,
					totalCount: 0,
				} as unknown as InvoiceState),
		);

		const { getByText } = renderWithTheme(<InvoicesListScreen />);
		await waitFor(() => {
			expect(getByText('No invoices found.')).toBeTruthy();
		});
	});

	it('navigates to create invoice on New Invoice press', async () => {
		const { getByText } = renderWithTheme(<InvoicesListScreen />);
		fireEvent.press(getByText('New Invoice'));
		expect(mockPush).toHaveBeenCalledWith('/(app)/invoices/create');
	});

	it('navigates to invoice detail on item press', async () => {
		const { getByText } = renderWithTheme(<InvoicesListScreen />);
		await waitFor(() => expect(getByText('TM-001')).toBeTruthy());
		fireEvent.press(getByText('TM-001'));
		expect(mockPush).toHaveBeenCalledWith('/(app)/invoices/inv-1');
	});
});
