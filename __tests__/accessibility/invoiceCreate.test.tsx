import React from 'react';
import { render } from '@testing-library/react-native';
import InvoiceCreateScreen from '@/src/features/invoice-create/InvoiceCreateScreen';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Mock the hook that manages the flow
jest.mock('@/src/features/invoice-create/useInvoiceCreateFlow', () => ({
	useInvoiceCreateFlow: () => ({
		step: 1,
		customer: null,
		setCustomer: jest.fn(),
		lineItems: [],
		removeLineItem: jest.fn(),
		isAddingItem: false,
		setIsAddingItem: jest.fn(),
		inventoryItems: [],
		inventoryLoading: false,
		searchQuery: '',
		setSearchQuery: jest.fn(),
		selectedItem: null,
		selectInventoryItem: jest.fn(),
		cancelItemSelection: jest.fn(),
		inputQuantity: '',
		setInputQuantity: jest.fn(),
		inputDiscount: '',
		setInputDiscount: jest.fn(),
		addLineItem: jest.fn(),
		grandTotal: 0,
		amountPaid: '0',
		setAmountPaid: jest.fn(),
		amountPaidNum: 0,
		paymentMode: 'CASH',
		setPaymentMode: jest.fn(),
		handleBack: jest.fn(),
		handleNext: jest.fn(),
		submitInvoice: jest.fn(),
		submitting: false,
		canGoNext: false,
		isInterState: false,
		setIsInterState: jest.fn(),
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

describe('Invoice Creation Accessibility', () => {
	it('announces the current step in the progress bar', async () => {
		const { findByLabelText } = renderWithTheme(<InvoiceCreateScreen />);
		const progressBar = await findByLabelText(/Step 1 of 3: Customer/i);
		expect(progressBar.props.accessibilityRole).toBe('progressbar');
		expect(progressBar.props.accessibilityValue).toEqual({ now: 1, min: 1, max: 3 });
	});

	it('has identifiable navigation buttons in the footer', async () => {
		const { findByLabelText } = renderWithTheme(<InvoiceCreateScreen />);
		expect(await findByLabelText('invoice-back-button')).toBeTruthy();
		expect(await findByLabelText('invoice-next-button')).toBeTruthy();
	});

	it('provides accessibility labels for the step indicators', async () => {
		const { findByLabelText } = renderWithTheme(<InvoiceCreateScreen />);
		expect(await findByLabelText('invoice-step-1')).toBeTruthy();
		expect(await findByLabelText('invoice-step-2')).toBeTruthy();
		expect(await findByLabelText('invoice-step-3')).toBeTruthy();
	});
});
