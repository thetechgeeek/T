import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { QuickActionsGrid } from '../QuickActionsGrid';
import { FilePlus, Package, UserPlus, CreditCard } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const mockPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({ push: mockPush, replace: jest.fn(), back: jest.fn() });

const testActions = [
	{
		label: 'New Invoice',
		accessibilityLabel: 'new-invoice-button',
		icon: FilePlus,
		route: '/invoices/create',
		color: '#2196F3',
	},
	{
		label: 'Add Stock',
		accessibilityLabel: 'add-stock-button',
		icon: Package,
		route: '/inventory/stock-op',
		color: '#4CAF50',
	},
	{
		label: 'New Customer',
		accessibilityLabel: 'new-customer-button',
		icon: UserPlus,
		route: '/customers/add',
		color: '#FF9800',
	},
	{
		label: 'Record Payment',
		accessibilityLabel: 'record-payment-button',
		icon: CreditCard,
		route: '/finance/payments',
		color: '#9C27B0',
	},
];

const renderWithTheme = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

beforeEach(() => {
	jest.clearAllMocks();
	(useRouter as jest.Mock).mockReturnValue({
		push: mockPush,
		replace: jest.fn(),
		back: jest.fn(),
	});
});

describe('QuickActionsGrid', () => {
	it('renders all action labels', () => {
		const { getByText } = renderWithTheme(<QuickActionsGrid actions={testActions} />);
		expect(getByText('New Invoice')).toBeTruthy();
		expect(getByText('Add Stock')).toBeTruthy();
		expect(getByText('New Customer')).toBeTruthy();
		expect(getByText('Record Payment')).toBeTruthy();
	});

	it('calls router.push with the correct route when an action is pressed', () => {
		const { getByLabelText } = renderWithTheme(<QuickActionsGrid actions={testActions} />);
		fireEvent.press(getByLabelText('new-invoice-button'));
		expect(mockPush).toHaveBeenCalledWith('/invoices/create');
	});

	it('navigates to stock-op route when Add Stock is pressed', () => {
		const { getByLabelText } = renderWithTheme(<QuickActionsGrid actions={testActions} />);
		fireEvent.press(getByLabelText('add-stock-button'));
		expect(mockPush).toHaveBeenCalledWith('/inventory/stock-op');
	});

	it('navigates to customers/add when New Customer is pressed', () => {
		const { getByLabelText } = renderWithTheme(<QuickActionsGrid actions={testActions} />);
		fireEvent.press(getByLabelText('new-customer-button'));
		expect(mockPush).toHaveBeenCalledWith('/customers/add');
	});

	it('renders empty grid without crashing when no actions provided', () => {
		expect(() => renderWithTheme(<QuickActionsGrid actions={[]} />)).not.toThrow();
	});

	it('renders all action icons (via lucide mock)', () => {
		const { toJSON } = renderWithTheme(<QuickActionsGrid actions={testActions} />);
		const json = JSON.stringify(toJSON());
		expect(json).toContain('FilePlus');
		expect(json).toContain('Package');
		expect(json).toContain('UserPlus');
		expect(json).toContain('CreditCard');
	});

	it('each action button has accessibilityRole=button in the output', () => {
		const { toJSON } = renderWithTheme(<QuickActionsGrid actions={testActions} />);
		const json = JSON.stringify(toJSON());
		// Each action renders a TouchableOpacity with accessibilityRole="button"
		const buttonMatches = (json.match(/"button"/g) || []).length;
		expect(buttonMatches).toBeGreaterThanOrEqual(testActions.length);
	});
});
