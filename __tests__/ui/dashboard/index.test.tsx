import React from 'react';
import { waitFor } from '@testing-library/react-native';
import DashboardScreen from '@/app/(app)/(tabs)/index';
import { useDashboardStore, DashboardState } from '@/src/stores/dashboardStore';
import { useInvoiceStore, InvoiceState } from '@/src/stores/invoiceStore';
import { renderWithTheme } from '../../utils/renderWithTheme';
import { makeDashboardStats } from '../../fixtures/financeFixtures';

jest.mock('@/src/stores/dashboardStore', () => ({
	useDashboardStore: jest.fn(),
}));

jest.mock('@/src/stores/invoiceStore', () => ({
	useInvoiceStore: jest.fn(),
}));

// useLocale needs i18n + AsyncStorage mocks
jest.mock('@/src/hooks/useLocale', () => ({
	useLocale: () => ({
		t: (key: string) => key.split('.').pop() ?? key,
		formatCurrency: (amount: number) => `₹${amount.toFixed(2)}`,
		currentLanguage: 'en',
	}),
}));

const mockFetchStats = jest.fn().mockResolvedValue(undefined);
const mockFetchInvoices = jest.fn().mockResolvedValue(undefined);

describe('DashboardScreen', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		(useDashboardStore as unknown as jest.Mock).mockImplementation(
			(selector: (s: DashboardState) => unknown) =>
				selector({
					stats: null,
					fetchStats: mockFetchStats,
					loading: false,
					error: null,
				} as unknown as DashboardState),
		);
		(useInvoiceStore as unknown as jest.Mock).mockImplementation(
			(selector: (s: InvoiceState) => unknown) =>
				selector({
					invoices: [],
					fetchInvoices: mockFetchInvoices,
					loading: false,
					error: null,
				} as unknown as InvoiceState),
		);
	});

	it('renders today_sales stat from dashboardStore.stats', async () => {
		const stats = makeDashboardStats({ today_sales: 12345 });
		(useDashboardStore as unknown as jest.Mock).mockImplementation(
			(selector: (s: DashboardState) => unknown) =>
				selector({ stats, fetchStats: mockFetchStats } as unknown as DashboardState),
		);

		const { getByText } = renderWithTheme(<DashboardScreen />);

		await waitFor(() => {
			expect(getByText('₹12345.00')).toBeTruthy();
		});
	});

	it('renders total_outstanding_credit stat', async () => {
		const stats = makeDashboardStats({ total_outstanding_credit: 8000 });
		(useDashboardStore as unknown as jest.Mock).mockImplementation(
			(selector: (s: DashboardState) => unknown) =>
				selector({ stats, fetchStats: mockFetchStats } as unknown as DashboardState),
		);

		const { getByText } = renderWithTheme(<DashboardScreen />);

		await waitFor(() => {
			expect(getByText('₹8000.00')).toBeTruthy();
		});
	});

	it('renders low_stock_count stat', async () => {
		const stats = makeDashboardStats({ low_stock_count: 3 });
		(useDashboardStore as unknown as jest.Mock).mockImplementation(
			(selector: (s: DashboardState) => unknown) =>
				selector({ stats, fetchStats: mockFetchStats } as unknown as DashboardState),
		);

		const { getByText } = renderWithTheme(<DashboardScreen />);

		await waitFor(() => {
			expect(getByText('3 items')).toBeTruthy();
		});
	});

	it('shows "0 items" for low_stock_count when stats is null', () => {
		(useDashboardStore as unknown as jest.Mock).mockImplementation(
			(selector: (s: DashboardState) => unknown) =>
				selector({ stats: null, fetchStats: mockFetchStats } as unknown as DashboardState),
		);

		const { getByText } = renderWithTheme(<DashboardScreen />);
		expect(getByText('0 items')).toBeTruthy();
	});

	it('renders ₹0.00 for today_sales when stats is null', () => {
		const { getAllByText } = renderWithTheme(<DashboardScreen />);
		// When stats is null, both today_sales and total_outstanding_credit default to 0 (shows two ₹0.00)
		expect(getAllByText('₹0.00').length).toBeGreaterThan(0);
	});

	it('calls fetchStats on mount', async () => {
		renderWithTheme(<DashboardScreen />);

		await waitFor(() => {
			expect(mockFetchStats).toHaveBeenCalled();
		});
	});
});
