import React from 'react';
import DashboardScreen from '@/app/(app)/(tabs)/index';
import { renderLight, renderDark } from '../setup/renderToSnapshot';
import { useDashboardStore } from '@/src/stores/dashboardStore';
import { useInvoiceStore } from '@/src/stores/invoiceStore';
import { act } from '@testing-library/react-native';

// Mock the services to provide consistent data for snapshots
jest.mock('@/src/services/dashboardService', () => ({
	dashboardService: {
		fetchDashboardStats: jest.fn().mockResolvedValue({}),
	},
}));

jest.mock('@/src/services/invoiceService', () => ({
	invoiceService: {
		fetchInvoices: jest.fn().mockResolvedValue({ data: [], count: 0 }),
	},
}));

// Mock large sub-components to keep snapshot size manageable
jest.mock('@/src/components/organisms/RecentInvoicesList', () => ({
	RecentInvoicesList: 'RecentInvoicesList',
}));
jest.mock('@/src/components/organisms/QuickActionsGrid', () => ({
	QuickActionsGrid: 'QuickActionsGrid',
}));
jest.mock('@/src/components/organisms/DashboardHeader', () => ({
	DashboardHeader: 'DashboardHeader',
}));

describe.skip('Visual Regression: Dashboard Screen', () => {
	const mockStats = {
		today_invoice_count: 5,
		today_sales: 15000,
		total_outstanding_credit: 45000,
		low_stock_count: 8,
	};

	beforeEach(() => {
		useDashboardStore.getState().reset();
		useInvoiceStore.getState().reset();
	});

	it('renders Dashboard in Light Mode correctly', async () => {
		useDashboardStore.setState({ stats: mockStats as any });

		let renderResult!: ReturnType<typeof renderLight>;
		await act(async () => {
			renderResult = renderLight(<DashboardScreen />);
		});

		expect(renderResult.toJSON()).toMatchSnapshot();
	});

	it('renders Dashboard in Dark Mode correctly', async () => {
		useDashboardStore.setState({ stats: mockStats as any });

		let renderResult!: ReturnType<typeof renderDark>;
		await act(async () => {
			renderResult = renderDark(<DashboardScreen />);
		});

		expect(renderResult.toJSON()).toMatchSnapshot();
	});

	it('renders Dashboard in Loading State correctly', async () => {
		useDashboardStore.setState({ loading: true });

		let renderResult!: ReturnType<typeof renderLight>;
		await act(async () => {
			renderResult = renderLight(<DashboardScreen />);
		});

		expect(renderResult.toJSON()).toMatchSnapshot();
	});
});
