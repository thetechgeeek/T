import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import InvoiceCreateScreen from '../InvoiceCreateScreen';
import { renderWithTheme } from '@/__tests__/utils/renderWithTheme';
import { useRouter } from 'expo-router';

// ─── Mock useInvoiceCreateFlow ────────────────────────────────────────────────
// Variable must be prefixed with "mock" to be accessible inside jest.mock factory

const mockHandleNext = jest.fn();
const mockHandleBack = jest.fn();
const mockSubmitInvoice = jest.fn();

const mockDefaultFlow = {
	step: 1,
	customer: null,
	setCustomer: jest.fn(),
	isInterState: false,
	setIsInterState: jest.fn(),
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
	amountPaid: '',
	setAmountPaid: jest.fn(),
	amountPaidNum: 0,
	paymentMode: 'cash' as const,
	setPaymentMode: jest.fn(),
	canGoNext: true,
	submitting: false,
	handleNext: mockHandleNext,
	handleBack: mockHandleBack,
	submitInvoice: mockSubmitInvoice,
};

jest.mock('../useInvoiceCreateFlow', () => ({
	useInvoiceCreateFlow: jest.fn(() => mockDefaultFlow),
}));

const { useInvoiceCreateFlow } = require('../useInvoiceCreateFlow');

const mockPush = jest.fn();
beforeEach(() => {
	jest.clearAllMocks();
	(useRouter as jest.Mock).mockReturnValue({ push: mockPush, back: jest.fn() });
	useInvoiceCreateFlow.mockReturnValue({ ...mockDefaultFlow });
});

describe('InvoiceCreateScreen', () => {
	it('renders step labels in stepper', () => {
		const { getByText } = renderWithTheme(<InvoiceCreateScreen />);
		expect(getByText('1. Customer')).toBeTruthy();
		expect(getByText('2. Items')).toBeTruthy();
		expect(getByText('3. Review')).toBeTruthy();
	});

	it('renders CustomerStep on step 1', () => {
		const { getByText } = renderWithTheme(<InvoiceCreateScreen />);
		expect(getByText('Customer Details')).toBeTruthy();
	});

	it('renders LineItemsStep on step 2', () => {
		useInvoiceCreateFlow.mockReturnValue({ ...mockDefaultFlow, step: 2 });
		const { getByText } = renderWithTheme(<InvoiceCreateScreen />);
		expect(getByText('Line Items')).toBeTruthy();
	});

	it('renders PaymentStep on step 3', () => {
		useInvoiceCreateFlow.mockReturnValue({
			...mockDefaultFlow,
			step: 3,
			customer: { name: 'Test', phone: '', gstin: '' },
		});
		const { getByText } = renderWithTheme(<InvoiceCreateScreen />);
		expect(getByText('Review & Payment')).toBeTruthy();
	});

	it('renders Back and Next buttons in footer on step 1', () => {
		const { getByText } = renderWithTheme(<InvoiceCreateScreen />);
		expect(getByText('Back')).toBeTruthy();
		expect(getByText('Next')).toBeTruthy();
	});

	it('calls handleNext when Next pressed', () => {
		const { getByText } = renderWithTheme(<InvoiceCreateScreen />);
		fireEvent.press(getByText('Next'));
		expect(mockHandleNext).toHaveBeenCalled();
	});

	it('calls handleBack when Back pressed on step 2', () => {
		useInvoiceCreateFlow.mockReturnValue({ ...mockDefaultFlow, step: 2 });
		const { getByText } = renderWithTheme(<InvoiceCreateScreen />);
		fireEvent.press(getByText('Back'));
		expect(mockHandleBack).toHaveBeenCalled();
	});

	it('Back button is rendered on step 1', () => {
		const { getByText } = renderWithTheme(<InvoiceCreateScreen />);
		expect(getByText('Back')).toBeTruthy();
	});

	it('renders "Generate Invoice" button on step 3', () => {
		useInvoiceCreateFlow.mockReturnValue({
			...mockDefaultFlow,
			step: 3,
			customer: { name: 'Test', phone: '', gstin: '' },
		});
		const { getByText } = renderWithTheme(<InvoiceCreateScreen />);
		expect(getByText('Generate Invoice')).toBeTruthy();
	});

	it('calls submitInvoice when Generate Invoice pressed', () => {
		useInvoiceCreateFlow.mockReturnValue({
			...mockDefaultFlow,
			step: 3,
			customer: { name: 'Test', phone: '', gstin: '' },
		});
		const { getByText } = renderWithTheme(<InvoiceCreateScreen />);
		fireEvent.press(getByText('Generate Invoice'));
		expect(mockSubmitInvoice).toHaveBeenCalled();
	});

	it('renders loading indicator when submitting=true on step 3', () => {
		useInvoiceCreateFlow.mockReturnValue({
			...mockDefaultFlow,
			step: 3,
			submitting: true,
			customer: { name: 'Test', phone: '', gstin: '' },
		});
		const { toJSON } = renderWithTheme(<InvoiceCreateScreen />);
		// Button shows ActivityIndicator (testID="loading-indicator") when loading=true
		// and accessibilityLabel="Generating..." is set on the TouchableOpacity
		const json = JSON.stringify(toJSON());
		expect(json).toContain('Generating...');
	});
});
