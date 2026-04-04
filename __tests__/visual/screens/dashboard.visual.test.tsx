import React from 'react';
import DashboardScreen from '@/app/(app)/(tabs)/index';
import { renderLight, renderDark } from '../setup/renderToSnapshot';
import { useDashboardStore } from '@/src/stores/dashboardStore';

// Mock the dashboard service to provide consistent data for snapshots
jest.mock('@/src/services/dashboardService', () => ({
	dashboardService: {
		fetchDashboardStats: jest.fn().mockResolvedValue({
			today_invoice_count: 5,
			today_invoice_amount: 15000,
			pending_payments_count: 12,
			pending_payments_amount: 45000,
			low_stock_count: 8,
			monthly_revenue: [
				{ month: 'Jan', amount: 120000 },
				{ month: 'Feb', amount: 150000 },
				{ month: 'Mar', amount: 180000 },
			],
		}),
	},
}));

describe.skip('Visual Regression: Dashboard Screen', () => {
	beforeEach(() => {
		useDashboardStore.getState().reset();
	});

	it('renders Dashboard in Light Mode correctly', async () => {
		const { toJSON } = renderLight(<DashboardScreen />);
		// In a real visual regression setup, we'd use:
		// expect(toJSON()).toMatchImageSnapshot();
		expect(toJSON()).toMatchSnapshot();
	});

	it('renders Dashboard in Dark Mode correctly', async () => {
		const { toJSON } = renderDark(<DashboardScreen />);
		expect(toJSON()).toMatchSnapshot();
	});

	it('renders Dashboard in Loading State correctly', async () => {
		useDashboardStore.setState({ loading: true });
		const { toJSON } = renderLight(<DashboardScreen />);
		expect(toJSON()).toMatchSnapshot();
	});
});
