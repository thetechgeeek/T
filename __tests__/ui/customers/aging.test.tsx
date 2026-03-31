import React from 'react';
import { waitFor } from '@testing-library/react-native';
import AgingReportScreen from '@/app/(app)/customers/aging';
import { useCustomerStore } from '@/src/stores/customerStore';
import { renderWithTheme } from '../../utils/renderWithTheme';

jest.mock('@/src/stores/customerStore', () => ({
	useCustomerStore: jest.fn(),
}));

jest.mock('@/src/hooks/useLocale', () => ({
	useLocale: () => ({
		t: (key: string) => key.split('.').pop() ?? key,
		formatCurrency: (amount: number) => `₹${amount.toFixed(2)}`,
	}),
}));

const mockFetchCustomers = jest.fn();

beforeEach(() => {
	jest.clearAllMocks();
	mockFetchCustomers.mockResolvedValue(undefined);
});

describe('AgingReportScreen', () => {
	it('renders "No outstanding balances" empty state when no customers have balance', async () => {
		(useCustomerStore as unknown as jest.Mock).mockImplementation((selector: any) =>
			selector({
				customers: [{ id: 'c1', name: 'Zero Balance', type: 'retail', current_balance: 0 }],
				fetchCustomers: mockFetchCustomers,
				loading: false,
			}),
		);

		const { getByText } = renderWithTheme(<AgingReportScreen />);

		await waitFor(() => {
			expect(getByText('No outstanding balances')).toBeTruthy();
		});
	});

	it('calls fetchCustomers on mount', async () => {
		(useCustomerStore as unknown as jest.Mock).mockImplementation((selector: any) =>
			selector({
				customers: [],
				fetchCustomers: mockFetchCustomers,
				loading: false,
			}),
		);

		renderWithTheme(<AgingReportScreen />);

		await waitFor(() => {
			expect(mockFetchCustomers).toHaveBeenCalled();
		});
	});

	it('renders customers with outstanding balance', async () => {
		const customers = [
			{ id: 'c1', name: 'Rajesh Shah', type: 'wholesale', current_balance: 10000 },
			{ id: 'c2', name: 'Mohan Tiles', type: 'retail', current_balance: 5000 },
		];

		(useCustomerStore as unknown as jest.Mock).mockImplementation((selector: any) =>
			selector({ customers, fetchCustomers: mockFetchCustomers, loading: false }),
		);

		const { getByText } = renderWithTheme(<AgingReportScreen />);

		await waitFor(() => {
			expect(getByText('Rajesh Shah')).toBeTruthy();
			expect(getByText('Mohan Tiles')).toBeTruthy();
		});
	});

	it('filters out customers with zero balance', async () => {
		const customers = [
			{ id: 'c1', name: 'Paid Customer', type: 'retail', current_balance: 0 },
			{ id: 'c2', name: 'Owing Customer', type: 'wholesale', current_balance: 3000 },
		];

		(useCustomerStore as unknown as jest.Mock).mockImplementation((selector: any) =>
			selector({ customers, fetchCustomers: mockFetchCustomers, loading: false }),
		);

		const { getByText, queryByText } = renderWithTheme(<AgingReportScreen />);

		await waitFor(() => {
			expect(getByText('Owing Customer')).toBeTruthy();
			expect(queryByText('Paid Customer')).toBeNull();
		});
	});

	it('shows total outstanding sum', async () => {
		const customers = [
			{ id: 'c1', name: 'A', type: 'retail', current_balance: 3000 },
			{ id: 'c2', name: 'B', type: 'retail', current_balance: 7000 },
		];

		(useCustomerStore as unknown as jest.Mock).mockImplementation((selector: any) =>
			selector({ customers, fetchCustomers: mockFetchCustomers, loading: false }),
		);

		const { getByText } = renderWithTheme(<AgingReportScreen />);

		await waitFor(() => {
			// Total = 10000
			expect(getByText('₹10000.00')).toBeTruthy();
		});
	});

	it('renders "Total Outstanding" label', async () => {
		(useCustomerStore as unknown as jest.Mock).mockImplementation((selector: any) =>
			selector({ customers: [], fetchCustomers: mockFetchCustomers, loading: false }),
		);

		const { getByText } = renderWithTheme(<AgingReportScreen />);
		expect(getByText('Total Outstanding')).toBeTruthy();
	});

	it('renders Customer Breakup heading', async () => {
		(useCustomerStore as unknown as jest.Mock).mockImplementation((selector: any) =>
			selector({ customers: [], fetchCustomers: mockFetchCustomers, loading: false }),
		);

		const { getByText } = renderWithTheme(<AgingReportScreen />);
		expect(getByText('Customer Breakup')).toBeTruthy();
	});
});
