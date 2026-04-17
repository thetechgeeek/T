import React from 'react';
import { render } from '@testing-library/react-native';
import DashboardScreen from '@/app/(app)/(tabs)/index';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Mock the services to ensure stable data
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

// We'll use a counter in a mock to track renders of a key sub-component
let mockStatCardRenderCount = 0;
jest.mock('@/src/design-system/components/molecules/StatCard', () => {
	const ActualStatCard = jest.requireActual(
		'@/src/design-system/components/molecules/StatCard',
	).StatCard;
	return {
		StatCard: (props: Record<string, unknown>) => {
			mockStatCardRenderCount++;
			return <ActualStatCard {...props} />;
		},
	};
});

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

describe('Performance: Render Cycle Verification', () => {
	beforeEach(() => {
		mockStatCardRenderCount = 0;
		jest.clearAllMocks();
	});

	it('Dashboard: StatCards should not exceed 3 render cycles on initial mount and data load', async () => {
		const { findByText } = renderWithTheme(<DashboardScreen />);

		// Wait for data to load
		await findByText('Low Stock Items');

		// 3 StatCards are rendered.
		// Initial render: 3 calls
		// Data load (fetchStats): 1 state update in store -> 1 re-render of Dashboard -> 3 more calls
		// Total expected: 6 calls (2 cycles * 3 cards).
		// If it's 10+, there's an infinite loop or excessive updates.
		expect(mockStatCardRenderCount).toBeLessThanOrEqual(9); // Allow up to 3 cycles (initial, fetchStats, fetchInvoices)
	});
});
