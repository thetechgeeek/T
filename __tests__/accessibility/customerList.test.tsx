import React from 'react';
import { render } from '@testing-library/react-native';
import CustomersScreen from '@/app/(app)/customers/index';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Mock the customer store to provide data
jest.mock('@/src/stores/customerStore', () => ({
	useCustomerStore: (selector: (state: any) => any) =>
		selector({
			customers: [
				{
					id: 'cust-1',
					name: 'John Doe',
					phone: '9876543210',
					type: 'retail',
					city: 'Delhi',
				},
				{
					id: 'cust-2',
					name: 'Jane Smith',
					phone: '8765432109',
					type: 'contractor',
					city: 'Mumbai',
				},
			],
			loading: false,
			fetchCustomers: jest.fn().mockResolvedValue([]),
			setFilters: jest.fn(),
			filters: {},
		}),
}));

// Mock useLocale
jest.mock('@/src/hooks/useLocale', () => ({
	useLocale: () => ({
		t: (key: string) => key,
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

describe('Customer List Accessibility', () => {
	it('provides a stable labels for list items', async () => {
		const { findByLabelText } = renderWithTheme(<CustomersScreen />);

		// ListItem.tsx uses "title, subtitle" as default accessibilityLabel
		expect(await findByLabelText('John Doe, 9876543210')).toBeTruthy();
		expect(await findByLabelText('Jane Smith, 8765432109')).toBeTruthy();
	});

	it('has a functional search bar with appropriate label', async () => {
		const { findByPlaceholderText } = renderWithTheme(<CustomersScreen />);
		// SearchBar should have accessibilityLabel or placeholder
		expect(await findByPlaceholderText(/search customers/i)).toBeTruthy();
	});

	it('has an identifiable Add Customer FAB', async () => {
		const { findByLabelText } = renderWithTheme(<CustomersScreen />);
		const fab = await findByLabelText('add-customer-button');
		expect(fab.props.accessibilityRole).toBe('button');
	});
});
