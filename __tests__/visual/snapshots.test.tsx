import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { useCustomerStore } from '@/src/stores/customerStore';
import { useInvoiceStore } from '@/src/stores/invoiceStore';
import { useInventoryStore } from '@/src/stores/inventoryStore';

// We'll mock the screens or parts of them since they are complex
jest.mock('expo-router', () => ({
	useLocalSearchParams: jest.fn(() => ({ id: '123' })),
	useRouter: jest.fn(() => ({ push: jest.fn(), back: jest.fn() })),
	useNavigation: jest.fn(() => ({
		navigate: jest.fn(),
		setOptions: jest.fn(),
		addListener: jest.fn(() => jest.fn()),
	})),
	useFocusEffect: jest.fn((cb) => cb()),
}));

// Mock the components we want to snapshot
import CustomerDetail from '@/app/(app)/customers/[id]';
import InvoiceList from '@/app/(app)/(tabs)/invoices';
import InventoryManagement from '@/app/(app)/(tabs)/inventory';

describe.skip('Visual Regression: Component Snapshots', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('CustomerDetail matches snapshot', () => {
		useCustomerStore.setState({
			selectedCustomer: {
				id: 'c1',
				name: 'John Doe',
				phone: '1234567890',
				type: 'RETAIL',
			} as any,
			summary: { outstanding_balance: 5000, total_invoiced: 10000, total_paid: 5000 } as any,
			loading: false,
		});
		const { toJSON } = render(
			<ThemeProvider>
				<CustomerDetail />
			</ThemeProvider>,
		);
		expect(toJSON()).toMatchSnapshot();
	});

	it('InvoiceList matches snapshot', () => {
		useInvoiceStore.setState({
			invoices: [
				{
					id: 'i1',
					invoice_number: 'INV-001',
					grand_total: 1000,
					created_at: '2024-01-01',
				},
				{
					id: 'i2',
					invoice_number: 'INV-002',
					grand_total: 2000,
					created_at: '2024-01-02',
				},
			] as any,
			loading: false,
		});
		const { toJSON } = render(
			<ThemeProvider>
				<InvoiceList />
			</ThemeProvider>,
		);
		expect(toJSON()).toMatchSnapshot();
	});

	it('InventoryManagement matches snapshot', () => {
		useInventoryStore.setState({
			items: [
				{ id: 'it1', design_name: 'D1', box_count: 50, category: 'GLOSSY' },
				{ id: 'it2', design_name: 'D2', box_count: 5, category: 'MATT' }, // Low stock
			] as any,
			loading: false,
		});
		const { toJSON } = render(
			<ThemeProvider>
				<InventoryManagement />
			</ThemeProvider>,
		);
		expect(toJSON()).toMatchSnapshot();
	});
});
