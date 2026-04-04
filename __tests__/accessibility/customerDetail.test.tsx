import React from 'react';
import { render } from '@testing-library/react-native';
import CustomerDetailScreen from '@/app/(app)/customers/[id]';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Mock useLocalSearchParams
jest.mock('expo-router', () => ({
	useLocalSearchParams: () => ({ id: 'cust-1' }),
	useRouter: () => ({ back: jest.fn(), push: jest.fn() }),
	Stack: { Screen: () => null },
}));

// Mock the customer store
jest.mock('@/src/stores/customerStore', () => ({
	useCustomerStore: () => ({
		selectedCustomer: {
			id: 'cust-1',
			name: 'John Doe',
			phone: '9876543210',
			type: 'retail',
			city: 'Delhi',
		},
		ledger: [
			{
				type: 'invoice',
				reference: 'INV-001',
				date: '2026-04-01',
				debit: 5000,
				credit: 0,
				balance: 5000,
			},
			{
				type: 'payment',
				reference: 'PAY-001',
				date: '2026-04-02',
				debit: 0,
				credit: 2000,
				balance: 3000,
			},
		],
		summary: { outstanding_balance: 3000, total_invoiced: 5000, total_paid: 2000 },
		loading: false,
		fetchCustomerDetail: jest.fn(),
	}),
}));

// Mock useLocale
jest.mock('@/src/hooks/useLocale', () => ({
	useLocale: () => ({
		t: (key: string) => key,
		formatCurrency: (val: number) => `₹${val}`,
		formatDate: (val: string) => val,
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

describe('Customer Detail Accessibility', () => {
	it('has an identifiable Back button', async () => {
		const { findByLabelText } = renderWithTheme(<CustomerDetailScreen />);
		const backBtn = await findByLabelText('back-button');
		expect(backBtn).toBeTruthy();
	});

	it('provides accessibility labels for ledger entries', async () => {
		const { findByText } = renderWithTheme(<CustomerDetailScreen />);
		// Ledger entries show reference and amount
		expect(await findByText('INV-001')).toBeTruthy();
		expect(await findByText('PAY-001')).toBeTruthy();
	});

	it('has actionable buttons for New Invoice and Record Payment', async () => {
		const { findByText } = renderWithTheme(<CustomerDetailScreen />);
		// Buttons have titles that should be accessible
		expect(await findByText(/record payment/i)).toBeTruthy();
		expect(await findByText(/new invoice/i)).toBeTruthy();
	});

	it('renders customer info with accessible items', async () => {
		const { findByLabelText } = renderWithTheme(<CustomerDetailScreen />);
		// Phone should be in a ListItem which generates accessibilityLabel from title
		expect(await findByLabelText(/9876543210/i)).toBeTruthy();
		expect(await findByLabelText(/Delhi/i)).toBeTruthy();
	});
});
