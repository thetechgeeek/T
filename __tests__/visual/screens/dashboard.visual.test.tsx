import React from 'react';
import DashboardScreen from '@/app/(app)/(tabs)/index';
import {
	renderToSnapshot,
	IPHONE_15_PRO_MAX_FRAME,
	IPHONE_SE_FRAME,
} from '../setup/renderToSnapshot';
import { useDashboardStore } from '@/src/stores/dashboardStore';
import { useInvoiceStore } from '@/src/stores/invoiceStore';

jest.mock('react-native', () => {
	const actual = jest.requireActual('react-native') as typeof import('react-native');
	return {
		...actual,
		RefreshControl: () => null,
	};
});

jest.mock('@/src/stores/dashboardStore', () => ({
	useDashboardStore: jest.fn(),
}));

jest.mock('@/src/stores/invoiceStore', () => ({
	useInvoiceStore: jest.fn(),
}));

jest.mock('@/src/hooks/useLocale', () => ({
	useLocale: () => ({
		t: (key: string, opts?: Record<string, unknown>) => {
			const map: Record<string, string> = {
				'inventory.stockStatus': '{{count}} items',
				'branding.appName': 'TileMaster',
				'dashboard.todaySales': 'Today Sales',
				'dashboard.lowStock': 'Low Stock',
				'dashboard.newInvoice': 'New Invoice',
				'dashboard.addStock': 'Add Stock',
			};
			let value = map[key] ?? key.split('.').pop() ?? key;
			if (opts) {
				value = value.replace(/\{\{(\w+)\}\}/g, (_match, token) =>
					token in opts ? String(opts[token]) : `{{${token}}}`,
				);
			}
			return value;
		},
		formatCurrency: (amount: number) => `₹${amount.toFixed(2)}`,
		currentLanguage: 'en',
	}),
}));

jest.mock('@/src/components/molecules/StatCard', () => ({
	StatCard: ({
		label,
		value,
		accessibilityLabel,
	}: {
		label: string;
		value: string | number;
		accessibilityLabel?: string;
	}) => {
		const { View, Text } = jest.requireActual('react-native') as typeof import('react-native');
		return (
			<View accessibilityLabel={accessibilityLabel}>
				<Text>{label}</Text>
				<Text>{String(value)}</Text>
			</View>
		);
	},
}));

// Mock large sub-components to keep snapshot size manageable
jest.mock('@/src/components/organisms/RecentInvoicesList', () => ({
	RecentInvoicesList: () => {
		const React = jest.requireActual('react') as typeof import('react');
		const { Text } = jest.requireActual('react-native') as typeof import('react-native');
		return <Text>RecentInvoicesList</Text>;
	},
}));
jest.mock('@/src/components/organisms/QuickActionsGrid', () => ({
	QuickActionsGrid: () => {
		const React = jest.requireActual('react') as typeof import('react');
		const { Text } = jest.requireActual('react-native') as typeof import('react-native');
		return <Text>QuickActionsGrid</Text>;
	},
}));
jest.mock('@/src/components/organisms/DashboardHeader', () => ({
	DashboardHeader: () => {
		const React = jest.requireActual('react') as typeof import('react');
		const { Text } = jest.requireActual('react-native') as typeof import('react-native');
		return <Text>DashboardHeader</Text>;
	},
}));

const DASHBOARD_THEME_MATRIX = [
	{ themeLabel: 'light', isDark: false },
	{ themeLabel: 'dark', isDark: true },
] as const;

const DASHBOARD_DEVICE_MATRIX = [
	{ deviceLabel: 'iphone-se', frame: IPHONE_SE_FRAME },
	{ deviceLabel: 'iphone-15-pro-max', frame: IPHONE_15_PRO_MAX_FRAME },
] as const;

const mockStats = {
	today_invoice_count: 5,
	today_sales: 15000,
	total_outstanding_credit: 45000,
	low_stock_count: 8,
	recentTransactions: [],
};

const mockInvoices = [
	{
		id: 'inv-1',
		invoice_number: 'TM/2026-27/0001',
		customer_name: 'Rajesh Shah',
		invoice_date: '2026-04-10',
		grand_total: 11682,
		payment_status: 'paid',
	},
];

function selectState<TState>(state: TState, selector?: (value: TState) => unknown) {
	return typeof selector === 'function' ? selector(state) : state;
}

const mockUseDashboardStore = useDashboardStore as unknown as jest.Mock;
const mockUseInvoiceStore = useInvoiceStore as unknown as jest.Mock;

describe('Visual Regression: Dashboard Screen', () => {
	beforeEach(() => {
		jest.clearAllMocks();

		mockUseDashboardStore.mockImplementation(
			(selector?: (state: typeof mockStatsState) => unknown) =>
				selectState(mockStatsState, selector),
		);
		mockUseInvoiceStore.mockImplementation(
			(selector?: (state: typeof mockInvoiceState) => unknown) =>
				selectState(mockInvoiceState, selector),
		);
	});

	const mockStatsState = {
		stats: mockStats,
		fetchStats: jest.fn().mockResolvedValue(undefined),
		loading: false,
		error: null,
	};

	const mockInvoiceState = {
		invoices: mockInvoices,
		fetchInvoices: jest.fn().mockResolvedValue(undefined),
		loading: false,
		error: null,
	};

	it.each(
		DASHBOARD_THEME_MATRIX.flatMap((theme) =>
			DASHBOARD_DEVICE_MATRIX.map((device) => ({ ...theme, ...device })),
		),
	)('renders $themeLabel mode on $deviceLabel', ({ isDark, frame }) => {
		const renderResult = renderToSnapshot(<DashboardScreen />, {
			isDark,
			frame,
		});

		expect({
			frame,
			stats: [
				renderResult.getByLabelText('stat-today-sales').props.accessibilityLabel,
				renderResult.getByLabelText('stat-outstanding').props.accessibilityLabel,
				renderResult.getByLabelText('stat-low-stock').props.accessibilityLabel,
			],
			chrome: ['DashboardHeader', 'QuickActionsGrid', 'RecentInvoicesList'],
		}).toMatchSnapshot();
	});
});
