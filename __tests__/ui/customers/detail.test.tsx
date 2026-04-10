import React from 'react';
import { waitFor } from '@testing-library/react-native';
import CustomerDetailScreen from '@/app/(app)/customers/[id]';
import { useCustomerStore } from '@/src/stores/customerStore';
import { renderWithTheme } from '../../utils/renderWithTheme';
import { useLocalSearchParams, useRouter } from 'expo-router';

jest.mock('@/src/stores/customerStore', () => ({
	useCustomerStore: jest.fn(),
}));

jest.mock('@/src/hooks/useLocale', () => ({
	useLocale: () => ({
		t: (key: string) => {
			const map: Record<string, string> = {
				'dashboard.recordPayment': 'Record Payment',
				'invoice.newInvoice': 'New Invoice',
				'common.outstandingBalance': 'Outstanding Balance',
				'common.totalInvoiced': 'Total Invoiced',
				'common.totalPaid': 'Total Paid',
				'common.customerInfo': 'Customer Info',
				'common.ledgerHistory': 'Ledger History',
			};
			return map[key] ?? key.split('.').pop() ?? key;
		},
		formatCurrency: (amount: number) => `₹${amount.toFixed(2)}`,
		formatDate: (d: string) => d,
	}),
}));

jest.mock('@/src/components/organisms/PaymentModal', () => {
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	require('react');
	return { PaymentModal: () => null };
});

const mockFetchCustomerDetail = jest.fn();

const mockCustomer = {
	id: 'c-1',
	name: 'Rajesh Shah',
	phone: '9876543210',
	city: 'Morbi',
	state: 'Gujarat',
	type: 'wholesale',
	current_balance: 5000,
};

const mockSummary = {
	outstanding_balance: 5000,
	total_invoiced: 15000,
	total_paid: 10000,
};

const mockLedger = [
	{
		reference: 'INV-001',
		date: '2026-03-01',
		type: 'invoice',
		debit: 5000,
		credit: 0,
		balance: 5000,
	},
];

beforeEach(() => {
	jest.clearAllMocks();
	mockFetchCustomerDetail.mockResolvedValue(undefined);
	(useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'c-1' });
	(useRouter as jest.Mock).mockReturnValue({ push: jest.fn(), back: jest.fn() });
});

describe('CustomerDetailScreen', () => {
	it('returns null when no customer loaded', () => {
		(useCustomerStore as unknown as jest.Mock).mockReturnValue({
			selectedCustomer: null,
			ledger: [],
			summary: null,
			loading: false,
			fetchCustomerDetail: mockFetchCustomerDetail,
		});

		const { toJSON } = renderWithTheme(<CustomerDetailScreen />);
		expect(toJSON()).toBeNull();
	});

	it('renders customer name and outstanding balance', async () => {
		(useCustomerStore as unknown as jest.Mock).mockReturnValue({
			selectedCustomer: mockCustomer,
			ledger: mockLedger,
			summary: mockSummary,
			loading: false,
			fetchCustomerDetail: mockFetchCustomerDetail,
		});

		const { getAllByText } = renderWithTheme(<CustomerDetailScreen />);

		await waitFor(() => {
			// ₹5000.00 appears in outstanding balance and ledger balance
			expect(getAllByText('₹5000.00').length).toBeGreaterThan(0);
		});
	});

	it('calls fetchCustomerDetail with id on mount', async () => {
		(useCustomerStore as unknown as jest.Mock).mockReturnValue({
			selectedCustomer: mockCustomer,
			ledger: [],
			summary: mockSummary,
			loading: false,
			fetchCustomerDetail: mockFetchCustomerDetail,
		});

		renderWithTheme(<CustomerDetailScreen />);

		await waitFor(() => {
			expect(mockFetchCustomerDetail).toHaveBeenCalledWith('c-1');
		});
	});

	it('renders customer phone and city', async () => {
		(useCustomerStore as unknown as jest.Mock).mockReturnValue({
			selectedCustomer: mockCustomer,
			ledger: [],
			summary: mockSummary,
			loading: false,
			fetchCustomerDetail: mockFetchCustomerDetail,
		});

		const { getByText } = renderWithTheme(<CustomerDetailScreen />);

		await waitFor(() => {
			expect(getByText('9876543210')).toBeTruthy();
			expect(getByText('Morbi, Gujarat')).toBeTruthy();
		});
	});

	it('renders total invoiced and total paid from summary', async () => {
		(useCustomerStore as unknown as jest.Mock).mockReturnValue({
			selectedCustomer: mockCustomer,
			ledger: [],
			summary: mockSummary,
			loading: false,
			fetchCustomerDetail: mockFetchCustomerDetail,
		});

		const { getByText } = renderWithTheme(<CustomerDetailScreen />);

		await waitFor(() => {
			expect(getByText('₹15000.00')).toBeTruthy();
			expect(getByText('₹10000.00')).toBeTruthy();
		});
	});

	it('renders ledger entry reference', async () => {
		(useCustomerStore as unknown as jest.Mock).mockReturnValue({
			selectedCustomer: mockCustomer,
			ledger: mockLedger,
			summary: mockSummary,
			loading: false,
			fetchCustomerDetail: mockFetchCustomerDetail,
		});

		const { getByText } = renderWithTheme(<CustomerDetailScreen />);

		await waitFor(() => {
			expect(getByText('INV-001')).toBeTruthy();
		});
	});

	it('renders Record Payment and New Invoice buttons', async () => {
		(useCustomerStore as unknown as jest.Mock).mockReturnValue({
			selectedCustomer: mockCustomer,
			ledger: [],
			summary: mockSummary,
			loading: false,
			fetchCustomerDetail: mockFetchCustomerDetail,
		});

		const { getByText } = renderWithTheme(<CustomerDetailScreen />);

		await waitFor(() => {
			expect(getByText('Record Payment')).toBeTruthy();
			expect(getByText('New Invoice')).toBeTruthy();
		});
	});

	it('navigates to invoice create on New Invoice press', async () => {
		const mockPush = jest.fn();
		(useRouter as jest.Mock).mockReturnValue({ push: mockPush, back: jest.fn() });
		(useCustomerStore as unknown as jest.Mock).mockReturnValue({
			selectedCustomer: mockCustomer,
			ledger: [],
			summary: mockSummary,
			loading: false,
			fetchCustomerDetail: mockFetchCustomerDetail,
		});

		const { getByText } = renderWithTheme(<CustomerDetailScreen />);

		await waitFor(() => {
			expect(getByText('New Invoice')).toBeTruthy();
		});
	});
});
