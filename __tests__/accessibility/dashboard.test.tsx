import React from 'react';
import { render } from '@testing-library/react-native';
import DashboardScreen from '@/app/(app)/(tabs)/index';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Mock the dashboard stats to ensure content is rendered
jest.mock('@/src/services/dashboardService', () => ({
	dashboardService: {
		fetchDashboardStats: jest.fn().mockResolvedValue({
			today_invoice_count: 5,
			today_invoice_amount: 15000,
			pending_payments_count: 12,
			pending_payments_amount: 45000,
			low_stock_count: 8,
			monthly_revenue: [],
		}),
	},
}));

// Mock useLocale to provide consistent translations for accessibility
jest.mock('@/src/hooks/useLocale', () => ({
	useLocale: () => ({
		t: (key: string) => {
			const keys: Record<string, string> = {
				'dashboard.greeting': 'Namaste',
				'dashboard.todaySales': "Today's Sales",
				'dashboard.outstandingCredit': 'Outstanding Credit',
				'dashboard.lowStock': 'Low Stock',
				'dashboard.quickActions': 'Quick Actions',
				'dashboard.recentInvoices': 'Recent Invoices',
				'common.seeAll': 'See All',
			};
			return keys[key] || key;
		},
		formatCurrency: (val: number) => `₹${val}`,
		currentLanguage: 'en',
	}),
}));

const renderWithTheme = (component: React.ReactElement) => {
	return render(
		<SafeAreaProvider
			initialMetrics={{
				frame: { x: 0, y: 0, width: 390, height: 844 },
				insets: { top: 0, bottom: 0, left: 0, right: 0 },
			}}
		>
			<ThemeProvider>{component}</ThemeProvider>
		</SafeAreaProvider>,
	);
};

describe('Dashboard Accessibility', () => {
	it('has a descriptive header for screen readers', async () => {
		const { findByLabelText } = renderWithTheme(<DashboardScreen />);
		// Business name or screen ID
		expect(await findByLabelText(/dashboard-screen/i)).toBeTruthy();
	});

	it('provides stable accessibility labels for quick action buttons', async () => {
		const { findByLabelText } = renderWithTheme(<DashboardScreen />);

		// Using the stable English identifiers specified in DashboardScreen and QuickActionsGrid
		expect(await findByLabelText('quick-action-new-invoice')).toBeTruthy();
		expect(await findByLabelText('quick-action-record-payment')).toBeTruthy();
		expect(await findByLabelText('quick-action-scan-item')).toBeTruthy();
		expect(await findByLabelText('quick-action-add-stock')).toBeTruthy();
	});

	it('uses correct accessibility roles for statutory summary cards', async () => {
		const { findByLabelText } = renderWithTheme(<DashboardScreen />);

		// Using stable IDs for stats
		const salesCard = await findByLabelText('stat-today-sales');
		expect(salesCard.props.accessibilityRole).toBe('summary');

		const pendingCard = await findByLabelText('stat-outstanding');
		expect(pendingCard.props.accessibilityRole).toBe('summary');
	});

	it('ensures recent invoices list navigation is identifiable', async () => {
		const { findByLabelText } = renderWithTheme(<DashboardScreen />);
		expect(await findByLabelText('see-all-invoices')).toBeTruthy();
	});
});
