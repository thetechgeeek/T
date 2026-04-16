import React from 'react';
import { waitFor, type RenderAPI } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from '@/app/(auth)/login';
import SetupScreen from '@/app/(auth)/setup';
import CustomersScreen from '@/app/(app)/customers/index';
import CustomerDetailScreen from '@/app/(app)/customers/[id]';
import FinanceOverviewScreen from '@/app/(app)/finance/index';
import CashInHandScreen from '@/app/(app)/finance/cash';
import PaymentsScreen from '@/app/(app)/finance/payments';
import ItemDetailScreen from '@/app/(app)/inventory/[id]';
import InvoicesListScreen from '@/app/(app)/(tabs)/invoices';
import InventoryTab from '@/app/(app)/(tabs)/inventory';
import InvoiceDetailScreen from '@/app/(app)/invoices/[id]';
import CreateInvoiceScreen from '@/app/(app)/invoices/create';
import OrdersListScreen from '@/app/(app)/orders/index';
import OrderDetailScreen from '@/app/(app)/orders/[id]';
import ReportsHubScreen from '@/app/(app)/reports/index';
import AllTransactionsScreen from '@/app/(app)/reports/all-transactions';
import StockSummaryScreen from '@/app/(app)/reports/stock-summary';
import SettingsScreen from '@/app/(app)/settings/index';
import BusinessProfileScreen from '@/app/(app)/settings/business-profile';
import PreferencesScreen from '@/app/(app)/settings/preferences';
import OnlineStoreScreen from '@/app/(app)/store/index';
import SupplierListScreen from '@/app/(app)/suppliers/index';
import EstimatesScreen from '@/app/(app)/transactions/estimates/index';
import UtilitiesHubScreen from '@/app/(app)/utilities/index';
import { renderToSnapshot } from './setup/renderToSnapshot';
import { useAuthStore } from '@/src/stores/authStore';
import { useCustomerStore } from '@/src/stores/customerStore';
import { useFinanceStore } from '@/src/stores/financeStore';
import { useInventoryStore } from '@/src/stores/inventoryStore';
import { useInvoiceStore } from '@/src/stores/invoiceStore';
import { useOrderStore } from '@/src/stores/orderStore';
import { useSyncStore } from '@/src/stores/syncStore';
import { businessProfileService } from '@/src/services/businessProfileService';
import { inventoryService } from '@/src/services/inventoryService';
import { itemPartyRateService } from '@/src/services/itemPartyRateService';
import { orderService } from '@/src/services/orderService';
import { paymentService } from '@/src/services/paymentService';
import { supplierRepository } from '@/src/repositories/supplierRepository';
import { useNetworkStatus } from '@/src/hooks/useNetworkStatus';
import { useLocalSearchParams, useRouter } from 'expo-router';

function mockTranslate(key: string, options?: Record<string, unknown>) {
	const map: Record<string, string> = {
		'branding.appName': 'TileMaster',
		'auth.sendOtp': 'Send OTP',
		'auth.welcome': 'Welcome back',
		'auth.loginHelpText': 'We will send a verification code to this number.',
		'auth.contactSupport': 'Contact support',
		'common.back': 'Back',
		'common.next': 'Next',
		'common.ok': 'OK',
		'common.payments': 'Payments',
		'common.retry': 'Retry',
		'common.errorTitle': 'Error',
		'common.successTitle': 'Success',
		'common.stepIndicator': 'Step {{current}} of {{total}}: {{label}}',
		'customer.agingReport': 'Aging Report',
		'dashboard.recordPayment': 'Record Payment',
		'finance.currencySymbol': '₹',
		'finance.expenses': 'Expenses',
		'finance.grossProfit': 'Gross Profit',
		'finance.netProfit': 'Net Profit',
		'finance.profitLoss': 'Profit & Loss',
		'finance.purchases': 'Purchases',
		'finance.reportsAndManagement': 'Reports & Management',
		'finance.title': 'Finance',
		'finance.totalExpenses': 'Total Expenses',
		'inventory.addFirstItem': 'Add your first item',
		'inventory.loadError': 'Failed to load inventory',
		'inventory.noItems': 'No items found',
		'inventory.stepItems': 'Items',
		'inventory.title': 'Inventory',
		'invoice.createInvoice': 'Create Invoice',
		'invoice.generatePDF': 'Generate Invoice',
		'invoice.generating': 'Generating...',
		'invoice.newInvoice': 'New Invoice',
		'invoice.noInvoices': 'No invoices found.',
		'invoice.stepCustomer': 'Customer',
		'invoice.stepItems': 'Items',
		'invoice.stepReview': 'Review',
		'order.doubleTapToOpen': 'Double tap to open',
		'order.importBtn': 'Import Order (AI)',
		'order.importFirst': 'Import your first order to get started.',
		'order.importFirstBtn': 'Import Order (AI)',
		'order.itemsImportedCount': '{{count}} items imported',
		'order.noOrders': 'No Orders Yet',
		'order.title': 'Orders',
		'supplier.title': 'Suppliers',
	};

	let value = map[key] ?? key.split('.').pop() ?? key;
	if (options) {
		value = value.replace(/\{\{(\w+)\}\}/g, (_match, token) =>
			token in options ? String(options[token]) : `{{${token}}}`,
		);
	}
	return value;
}

function mockFormatCurrency(amount: number) {
	return `₹${amount.toFixed(2)}`;
}

function mockFormatDate(value: string) {
	return value;
}

jest.mock('react-native', () => {
	const actual = jest.requireActual('react-native') as typeof import('react-native');
	return {
		...actual,
		RefreshControl: () => null,
	};
});

jest.mock('expo-router', () => ({
	useRouter: jest.fn(),
	useLocalSearchParams: jest.fn(),
	useNavigation: jest.fn(() => ({
		navigate: jest.fn(),
		setOptions: jest.fn(),
		addListener: jest.fn(() => jest.fn()),
	})),
	useFocusEffect: jest.fn((callback: () => void) => {
		const React = jest.requireActual('react') as typeof import('react');
		React.useEffect(() => {
			const cleanup = callback();
			return cleanup;
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, []);
	}),
}));

jest.mock('@react-native-async-storage/async-storage', () =>
	require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('@/src/hooks/useLocale', () => ({
	useLocale: () => ({
		t: mockTranslate,
		formatCurrency: mockFormatCurrency,
		formatDate: mockFormatDate,
		formatDateShort: mockFormatDate,
		currentLanguage: 'en',
	}),
}));

jest.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: mockTranslate,
		i18n: { language: 'en' },
	}),
}));

jest.mock('i18next', () => ({
	__esModule: true,
	default: {
		language: 'en',
		changeLanguage: jest.fn().mockResolvedValue(undefined),
		t: mockTranslate,
	},
	language: 'en',
	changeLanguage: jest.fn().mockResolvedValue(undefined),
	t: mockTranslate,
}));

jest.mock('@/src/stores/authStore', () => ({
	useAuthStore: jest.fn(),
}));

jest.mock('@/src/stores/customerStore', () => ({
	useCustomerStore: jest.fn(),
}));

jest.mock('@/src/stores/financeStore', () => ({
	useFinanceStore: jest.fn(),
}));

jest.mock('@/src/stores/inventoryStore', () => ({
	useInventoryStore: jest.fn(),
}));

jest.mock('@/src/stores/invoiceStore', () => ({
	useInvoiceStore: jest.fn(),
}));

jest.mock('@/src/stores/orderStore', () => ({
	useOrderStore: jest.fn(),
}));

jest.mock('@/src/stores/syncStore', () => ({
	useSyncStore: jest.fn(),
}));

jest.mock('@/src/hooks/useNetworkStatus', () => ({
	useNetworkStatus: jest.fn(),
}));

jest.mock('@/src/services/businessProfileService', () => ({
	businessProfileService: {
		fetch: jest.fn(),
		get: jest.fn(),
		upsert: jest.fn(),
	},
}));

jest.mock('@/src/services/inventoryService', () => ({
	inventoryService: {
		fetchItemById: jest.fn(),
		fetchStockHistory: jest.fn(),
	},
}));

jest.mock('@/src/services/itemPartyRateService', () => ({
	itemPartyRateService: {
		fetchByItem: jest.fn(),
		upsertRate: jest.fn(),
	},
}));

jest.mock('@/src/services/orderService', () => ({
	orderService: {
		fetchOrderById: jest.fn(),
		fetchItemsByOrderId: jest.fn(),
	},
}));

jest.mock('@/src/services/paymentService', () => ({
	paymentService: {
		fetchPayments: jest.fn(),
		recordPayment: jest.fn(),
	},
}));

jest.mock('@/src/repositories/supplierRepository', () => ({
	supplierRepository: {
		findMany: jest.fn(),
	},
}));

jest.mock('@/src/services/storageService', () => ({
	storageService: {
		uploadFile: jest.fn().mockResolvedValue('branding/logo.png'),
		getPublicUrl: jest.fn().mockReturnValue('https://example.com/logo.png'),
	},
}));

jest.mock('expo-image-picker', () => ({
	requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
	launchImageLibraryAsync: jest.fn().mockResolvedValue({ canceled: true, assets: [] }),
}));

jest.mock('expo-image', () => ({
	Image: 'ExpoImage',
}));

jest.mock('react-native-qrcode-svg', () => 'QRCode');

jest.mock('@/src/components/organisms/PaymentModal', () => ({
	PaymentModal: () => null,
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

const THEME_MATRIX = [
	{ themeLabel: 'light', isDark: false },
	{ themeLabel: 'dark', isDark: true },
] as const;

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockReplace = jest.fn();

const invoiceRows = [
	{
		id: 'inv-123',
		invoice_number: 'TM/2026-27/0001',
		customer_name: 'Rajesh Shah',
		invoice_date: '2026-04-10',
		grand_total: 11682,
		amount_paid: 11682,
		payment_status: 'paid',
	},
	{
		id: 'inv-124',
		invoice_number: 'TM/2026-27/0002',
		customer_name: 'Kajaria Retail',
		invoice_date: '2026-04-05',
		grand_total: 8425,
		amount_paid: 3000,
		payment_status: 'partial',
	},
];

const currentInvoice = {
	id: 'inv-123',
	invoice_number: 'TM/2026-27/0001',
	invoice_date: '2026-04-10',
	customer_name: 'Rajesh Shah',
	subtotal: 9900,
	cgst_total: 891,
	sgst_total: 891,
	grand_total: 11682,
	amount_paid: 11682,
	payment_status: 'paid',
	payment_mode: 'upi',
	line_items: [
		{
			id: 'li-1',
			design_name: 'Marble Gold',
			quantity: 10,
			rate_per_unit: 1000,
			line_total: 11682,
		},
	],
};

const inventoryRows = [
	{
		id: 'item-1',
		design_name: 'Marble Premium Gold',
		base_item_number: 'MPG-001',
		category: 'GLOSSY',
		box_count: 50,
		has_batch_tracking: false,
		has_serial_tracking: false,
		low_stock_threshold: 10,
		selling_price: 1200,
		cost_price: 950,
		size_name: '600x600',
		pcs_per_box: 4,
		gst_rate: 18,
		hsn_code: '6908',
	},
	{
		id: 'item-2',
		design_name: 'Rustic Stone',
		base_item_number: 'RST-002',
		category: 'MATT',
		box_count: 8,
		has_batch_tracking: false,
		has_serial_tracking: false,
		low_stock_threshold: 10,
		selling_price: 980,
		cost_price: 760,
		size_name: '600x1200',
		pcs_per_box: 2,
		gst_rate: 18,
		hsn_code: '6908',
	},
];

const inventoryHistory = [
	{
		id: 'op-1',
		operation_type: 'stock_in',
		quantity_change: 20,
		reason: 'New Shipment',
		created_at: '2026-04-11T00:00:00.000Z',
	},
];

const customerRows = [
	{
		id: 'c-1',
		name: 'Rajesh Shah',
		phone: '9876543210',
		city: 'Morbi',
		type: 'wholesale',
	},
];

const selectedCustomer = {
	id: 'c-1',
	name: 'Rajesh Shah',
	phone: '9876543210',
	city: 'Morbi',
	state: 'Gujarat',
	type: 'wholesale',
	current_balance: 5000,
};

const customerSummary = {
	outstanding_balance: 5000,
	total_invoiced: 15000,
	total_paid: 10000,
};

const customerLedger = [
	{
		reference: 'INV-001',
		date: '2026-04-01',
		type: 'invoice',
		debit: 5000,
		credit: 0,
		balance: 5000,
	},
];

const financeSummary = {
	gross_profit: 50000,
	net_profit: 35000,
	total_expenses: 15000,
};

const financeExpenses = [
	{
		id: 'exp-1',
		expense_date: '2026-04-06',
		amount: 3500,
		category: 'Transport',
		notes: 'Truck hire',
	},
];

const financePurchases = [
	{
		id: 'pur-1',
		purchase_number: 'PUR-001',
		supplier_name: 'Kajaria Ceramics',
		purchase_date: '2026-04-08',
		grand_total: 24500,
	},
];

const paymentRows = [
	{
		id: 'pay-1',
		payment_date: '2026-04-12',
		direction: 'received',
		amount: 2500,
		payment_mode: 'upi',
		customer: { name: 'Rajesh Shah' },
		supplier: null,
	},
];

const supplierRows = [
	{
		id: 'sup-1',
		name: 'Kajaria Wholesale',
		contact_person: 'Mukesh Jain',
		phone: '9876500000',
		city: 'Ahmedabad',
	},
];

const orderRows = [
	{
		id: 'order-1',
		party_name: 'Kajaria Wholesale',
		total_quantity: 100,
		created_at: '2026-04-02T00:00:00Z',
		status: 'completed',
	},
];

const orderItems = [
	{
		id: 'item-1',
		design_name: 'Marble Elite',
		category: 'GLOSSY',
		size_name: '60x60',
		box_count: 50,
		has_batch_tracking: false,
		has_serial_tracking: false,
	},
	{
		id: 'item-2',
		design_name: 'Rustic Wood',
		category: 'WOODEN',
		size_name: '120x60',
		box_count: 50,
		has_batch_tracking: false,
		has_serial_tracking: false,
	},
];

const existingProfile = {
	id: 'bp-1',
	business_name: 'Sharma Tiles',
	phone: '+919876543210',
	gstin: '29AABCT1332L1ZV',
	address: '12, MG Road',
	city: 'Jaipur',
	state: 'Rajasthan',
	email: '',
	website: '',
	alternate_phone: '',
	business_description: '',
	logo_url: '',
	signature_url: '',
	upi_id: '',
	bank_details: {},
	invoice_prefix: 'INV-',
	invoice_sequence: 5,
};

type Selector<TState> = ((state: TState) => unknown) | undefined;

let authStoreState: {
	sendOtp: jest.Mock;
	loading: boolean;
	user: { phone: string };
};
let customerStoreState: {
	customers: typeof customerRows;
	loading: boolean;
	fetchCustomers: jest.Mock;
	setFilters: jest.Mock;
	filters: Record<string, unknown>;
	selectedCustomer: typeof selectedCustomer;
	ledger: typeof customerLedger;
	summary: typeof customerSummary;
	fetchCustomerDetail: jest.Mock;
};
let financeStoreState: {
	summary: typeof financeSummary;
	loading: boolean;
	fetchSummary: jest.Mock;
	expenses: typeof financeExpenses;
	purchases: typeof financePurchases;
	fetchExpenses: jest.Mock;
	addExpense: jest.Mock;
};
let inventoryStoreState: {
	items: typeof inventoryRows;
	loading: boolean;
	hasMore: boolean;
	filters: { category: string; search: string };
	page: number;
	fetchItems: jest.Mock;
	setFilters: jest.Mock;
};
let invoiceStoreState: {
	invoices: typeof invoiceRows;
	loading: boolean;
	totalCount: number;
	fetchInvoices: jest.Mock;
	currentInvoice: typeof currentInvoice;
	fetchInvoiceById: jest.Mock;
	clearCurrentInvoice: jest.Mock;
	createInvoice: jest.Mock;
	error: null;
};
let orderStoreState: {
	orders: typeof orderRows;
	loading: boolean;
	fetchOrders: jest.Mock;
	parseDocument: jest.Mock;
	parseText: jest.Mock;
	isParsing: boolean;
	parsedData: typeof orderItems;
	importParsedData: jest.Mock;
	clearParsedData: jest.Mock;
};
let syncStoreState: {
	lastSyncedAt: string | null;
	isSyncing: boolean;
	pendingCount: number;
};

function selectState<TState>(state: TState, selector?: Selector<TState>) {
	return typeof selector === 'function' ? selector(state) : state;
}

const mockUseAuthStore = useAuthStore as unknown as jest.Mock;
const mockUseCustomerStore = useCustomerStore as unknown as jest.Mock;
const mockUseFinanceStore = useFinanceStore as unknown as jest.Mock;
const mockUseInventoryStore = useInventoryStore as unknown as jest.Mock;
const mockUseInvoiceStore = useInvoiceStore as unknown as jest.Mock;
const mockUseOrderStore = useOrderStore as unknown as jest.Mock;
const mockUseSyncStore = useSyncStore as unknown as jest.Mock;
const mockUseNetworkStatus = useNetworkStatus as unknown as jest.Mock;
const SNAPSHOT_INVOICE_CREATE_NOW = new Date('2026-04-14T00:00:00.000Z');

async function expectSnapshotMatch(
	element: React.ReactElement,
	{
		isDark,
		waitForReady,
	}: {
		isDark: boolean;
		waitForReady?: (screen: RenderAPI) => Promise<void>;
	},
) {
	const renderResult = renderToSnapshot(element, { isDark });

	if (waitForReady) {
		await waitForReady(renderResult);
	}

	expect(renderResult.toJSON()).toMatchSnapshot();
}

describe('Visual Regression: Representative Screen Snapshots', () => {
	beforeEach(async () => {
		jest.clearAllMocks();
		await AsyncStorage.clear();

		authStoreState = {
			sendOtp: jest.fn().mockResolvedValue(undefined),
			loading: false,
			user: { phone: '+919876543210' },
		};
		customerStoreState = {
			customers: customerRows,
			loading: false,
			fetchCustomers: jest.fn().mockResolvedValue(undefined),
			setFilters: jest.fn(),
			filters: {},
			selectedCustomer,
			ledger: customerLedger,
			summary: customerSummary,
			fetchCustomerDetail: jest.fn().mockResolvedValue(undefined),
		};
		financeStoreState = {
			summary: financeSummary,
			loading: false,
			fetchSummary: jest.fn().mockResolvedValue(undefined),
			expenses: financeExpenses,
			purchases: financePurchases,
			fetchExpenses: jest.fn().mockResolvedValue(undefined),
			addExpense: jest.fn(),
		};
		inventoryStoreState = {
			items: inventoryRows,
			loading: false,
			hasMore: false,
			filters: { category: 'ALL', search: '' },
			page: 1,
			fetchItems: jest.fn().mockResolvedValue(undefined),
			setFilters: jest.fn(),
		};
		invoiceStoreState = {
			invoices: invoiceRows,
			loading: false,
			totalCount: invoiceRows.length,
			fetchInvoices: jest.fn().mockResolvedValue(undefined),
			currentInvoice,
			fetchInvoiceById: jest.fn().mockResolvedValue(currentInvoice),
			clearCurrentInvoice: jest.fn(),
			createInvoice: jest.fn().mockResolvedValue({ id: 'inv-999' }),
			error: null,
		};
		orderStoreState = {
			orders: orderRows,
			loading: false,
			fetchOrders: jest.fn().mockResolvedValue(undefined),
			parseDocument: jest.fn(),
			parseText: jest.fn(),
			isParsing: false,
			parsedData: orderItems,
			importParsedData: jest.fn(),
			clearParsedData: jest.fn(),
		};
		syncStoreState = {
			lastSyncedAt: null,
			isSyncing: false,
			pendingCount: 0,
		};

		(useRouter as jest.Mock).mockReturnValue({
			push: mockPush,
			back: mockBack,
			replace: mockReplace,
		});
		(useLocalSearchParams as jest.Mock).mockReturnValue({});

		mockUseAuthStore.mockImplementation((selector?: Selector<typeof authStoreState>) =>
			selectState(authStoreState, selector),
		);
		mockUseCustomerStore.mockImplementation((selector?: Selector<typeof customerStoreState>) =>
			selectState(customerStoreState, selector),
		);
		mockUseFinanceStore.mockImplementation((selector?: Selector<typeof financeStoreState>) =>
			selectState(financeStoreState, selector),
		);
		mockUseInventoryStore.mockImplementation(
			(selector?: Selector<typeof inventoryStoreState>) =>
				selectState(inventoryStoreState, selector),
		);
		mockUseInvoiceStore.mockImplementation((selector?: Selector<typeof invoiceStoreState>) =>
			selectState(invoiceStoreState, selector),
		);
		mockUseOrderStore.mockImplementation((selector?: Selector<typeof orderStoreState>) =>
			selectState(orderStoreState, selector),
		);
		mockUseSyncStore.mockImplementation((selector?: Selector<typeof syncStoreState>) =>
			selectState(syncStoreState, selector),
		);
		mockUseNetworkStatus.mockReturnValue({ isConnected: true });

		jest.mocked(useInventoryStore).getState = jest
			.fn()
			.mockReturnValue(
				inventoryStoreState as unknown as ReturnType<typeof useInventoryStore.getState>,
			);
		jest.mocked(useInvoiceStore).getState = jest
			.fn()
			.mockReturnValue(
				invoiceStoreState as unknown as ReturnType<typeof useInvoiceStore.getState>,
			);

		(businessProfileService.fetch as jest.Mock).mockResolvedValue(existingProfile);
		(businessProfileService.get as jest.Mock).mockResolvedValue(existingProfile);
		(businessProfileService.upsert as jest.Mock).mockResolvedValue(undefined);
		(inventoryService.fetchItemById as jest.Mock).mockResolvedValue(inventoryRows[0]);
		(inventoryService.fetchStockHistory as jest.Mock).mockResolvedValue(inventoryHistory);
		(itemPartyRateService.fetchByItem as jest.Mock).mockResolvedValue([]);
		(itemPartyRateService.upsertRate as jest.Mock).mockResolvedValue(undefined);
		(orderService.fetchOrderById as jest.Mock).mockResolvedValue(orderRows[0]);
		(orderService.fetchItemsByOrderId as jest.Mock).mockResolvedValue(orderItems);
		(paymentService.fetchPayments as jest.Mock).mockResolvedValue(paymentRows);
		(supplierRepository.findMany as jest.Mock).mockResolvedValue({ data: supplierRows });
	});

	describe.each(THEME_MATRIX)('$themeLabel theme', ({ isDark }) => {
		it('captures auth login', async () => {
			await expectSnapshotMatch(<LoginScreen />, { isDark });
		});

		it('captures auth setup', async () => {
			await expectSnapshotMatch(<SetupScreen />, { isDark });
		});

		it('captures invoice list', async () => {
			await expectSnapshotMatch(<InvoicesListScreen />, {
				isDark,
				waitForReady: async ({ getByText }) => {
					await waitFor(() => expect(getByText('TM/2026-27/0001')).toBeTruthy());
				},
			});
		});

		it('captures invoice create flow', async () => {
			jest.useFakeTimers();
			jest.setSystemTime(SNAPSHOT_INVOICE_CREATE_NOW);

			try {
				await expectSnapshotMatch(<CreateInvoiceScreen />, { isDark });
			} finally {
				jest.useRealTimers();
			}
		});

		it('captures invoice detail', async () => {
			(useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'inv-123' });
			await expectSnapshotMatch(<InvoiceDetailScreen />, {
				isDark,
				waitForReady: async ({ getAllByText }) => {
					await waitFor(() =>
						expect(getAllByText('TM/2026-27/0001').length).toBeGreaterThan(0),
					);
				},
			});
		});

		it('captures customer list', async () => {
			await expectSnapshotMatch(<CustomersScreen />, {
				isDark,
				waitForReady: async ({ getByText }) => {
					await waitFor(() => expect(getByText('Rajesh Shah')).toBeTruthy());
				},
			});
		});

		it('captures customer detail', async () => {
			(useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'c-1' });
			await expectSnapshotMatch(<CustomerDetailScreen />, {
				isDark,
				waitForReady: async ({ getByText }) => {
					await waitFor(() => expect(getByText('Rajesh Shah')).toBeTruthy());
				},
			});
		});

		it('captures supplier list', async () => {
			await expectSnapshotMatch(<SupplierListScreen />, {
				isDark,
				waitForReady: async ({ getByText }) => {
					await waitFor(() => expect(getByText('Kajaria Wholesale')).toBeTruthy());
				},
			});
		});

		it('captures inventory list', async () => {
			await expectSnapshotMatch(<InventoryTab />, {
				isDark,
				waitForReady: async ({ getByText }) => {
					await waitFor(() => expect(getByText('Marble Premium Gold')).toBeTruthy());
				},
			});
		});

		it('captures inventory detail', async () => {
			(useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'item-1' });
			await expectSnapshotMatch(<ItemDetailScreen />, {
				isDark,
				waitForReady: async ({ getByText }) => {
					await waitFor(() => expect(getByText('Marble Premium Gold')).toBeTruthy());
				},
			});
		});

		it('captures finance overview', async () => {
			const renderResult = renderToSnapshot(<FinanceOverviewScreen />, { isDark });
			await waitFor(() => expect(renderResult.getByText('₹50000.00')).toBeTruthy());
			expect({
				stats: [
					renderResult.getByLabelText('stat-gross-profit').props.accessibilityLabel,
					renderResult.getByLabelText('stat-net-profit').props.accessibilityLabel,
					renderResult.getByLabelText('stat-total-expenses').props.accessibilityLabel,
				],
				actions: [
					renderResult.getByLabelText('receive-payment').props.accessibilityLabel,
					renderResult.getByLabelText('make-payment').props.accessibilityLabel,
					renderResult.getByLabelText('menu-expenses').props.accessibilityLabel,
					renderResult.getByLabelText('menu-purchases').props.accessibilityLabel,
					renderResult.getByLabelText('menu-aging-report').props.accessibilityLabel,
					renderResult.getByLabelText('menu-profit-loss').props.accessibilityLabel,
				],
			}).toMatchSnapshot();
		});

		it('captures cash in hand', async () => {
			await expectSnapshotMatch(<CashInHandScreen />, { isDark });
		});

		it('captures payments index', async () => {
			await expectSnapshotMatch(<PaymentsScreen />, {
				isDark,
				waitForReady: async ({ getByText }) => {
					await waitFor(() => expect(getByText('Rajesh Shah')).toBeTruthy());
				},
			});
		});

		it('captures reports hub', async () => {
			await expectSnapshotMatch(<ReportsHubScreen />, { isDark });
		});

		it('captures stock summary', async () => {
			await expectSnapshotMatch(<StockSummaryScreen />, {
				isDark,
				waitForReady: async ({ getByText }) => {
					await waitFor(() => expect(getByText('Marble Premium Gold')).toBeTruthy());
				},
			});
		});

		it('captures all transactions', async () => {
			await expectSnapshotMatch(<AllTransactionsScreen />, {
				isDark,
				waitForReady: async ({ getByText }) => {
					await waitFor(() => expect(getByText('Rajesh Shah')).toBeTruthy());
				},
			});
		});

		it('captures settings index', async () => {
			await expectSnapshotMatch(<SettingsScreen />, { isDark });
		});

		it('captures preferences', async () => {
			await expectSnapshotMatch(<PreferencesScreen />, { isDark });
		});

		it('captures business profile', async () => {
			await expectSnapshotMatch(<BusinessProfileScreen />, {
				isDark,
				waitForReady: async ({ getByDisplayValue }) => {
					await waitFor(() => expect(getByDisplayValue('Sharma Tiles')).toBeTruthy());
				},
			});
		});

		it('captures online store', async () => {
			await expectSnapshotMatch(<OnlineStoreScreen />, { isDark });
		});

		it('captures orders index', async () => {
			await expectSnapshotMatch(<OrdersListScreen />, {
				isDark,
				waitForReady: async ({ getByText }) => {
					await waitFor(() => expect(getByText('Kajaria Wholesale')).toBeTruthy());
				},
			});
		});

		it('captures order detail', async () => {
			(useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'order-1' });
			await expectSnapshotMatch(<OrderDetailScreen />, {
				isDark,
				waitForReady: async ({ getAllByText }) => {
					await waitFor(() =>
						expect(getAllByText('Kajaria Wholesale').length).toBeGreaterThan(0),
					);
				},
			});
		});

		it('captures utilities hub', async () => {
			await expectSnapshotMatch(<UtilitiesHubScreen />, { isDark });
		});

		it('captures estimates index', async () => {
			await expectSnapshotMatch(<EstimatesScreen />, { isDark });
		});
	});
});
