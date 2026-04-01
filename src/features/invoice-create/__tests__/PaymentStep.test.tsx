import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { PaymentStep } from '../PaymentStep';
import { renderWithTheme } from '@/__tests__/utils/renderWithTheme';
import type { InvoiceLineItemInput } from '@/src/types/invoice';

const mockSetAmountPaid = jest.fn();
const mockSetPaymentMode = jest.fn();

const sampleCustomer = { name: 'Rajesh Tiles', phone: '9876543210', gstin: '' };

const sampleLineItems: InvoiceLineItemInput[] = [
	{
		design_name: 'Marble White 60x60',
		quantity: 10,
		rate_per_unit: 1000,
		discount: 0,
		gst_rate: 18,
		item_id: 'item-1',
	},
];

function makeProps(overrides = {}) {
	return {
		customer: sampleCustomer,
		lineItems: sampleLineItems,
		grandTotal: 11800,
		amountPaid: '',
		setAmountPaid: mockSetAmountPaid,
		amountPaidNum: 0,
		paymentMode: 'cash' as const,
		setPaymentMode: mockSetPaymentMode,
		...overrides,
	};
}

beforeEach(() => jest.clearAllMocks());

describe('PaymentStep', () => {
	it('renders Review & Payment heading', () => {
		const { getByText } = renderWithTheme(<PaymentStep {...makeProps()} />);
		expect(getByText('Review & Payment')).toBeTruthy();
	});

	it('renders customer name', () => {
		const { getByText } = renderWithTheme(<PaymentStep {...makeProps()} />);
		expect(getByText('Customer: Rajesh Tiles')).toBeTruthy();
	});

	it('renders customer phone', () => {
		const { getByText } = renderWithTheme(<PaymentStep {...makeProps()} />);
		expect(getByText('9876543210')).toBeTruthy();
	});

	it('shows "No phone provided" when phone is empty', () => {
		const { getByText } = renderWithTheme(
			<PaymentStep {...makeProps({ customer: { name: 'Test', phone: '', gstin: '' } })} />,
		);
		expect(getByText('No phone provided')).toBeTruthy();
	});

	it('renders line item in summary', () => {
		const { getByText } = renderWithTheme(<PaymentStep {...makeProps()} />);
		expect(getByText('10x Marble White 60x60')).toBeTruthy();
	});

	it('renders Grand Total', () => {
		const { getByText } = renderWithTheme(<PaymentStep {...makeProps()} />);
		expect(getByText('₹11800.00')).toBeTruthy();
	});

	it('renders Balance Due = grand total when nothing paid', () => {
		const { getByText } = renderWithTheme(<PaymentStep {...makeProps()} />);
		expect(getByText('Balance Due: ₹11800.00')).toBeTruthy();
	});

	it('renders "Fully Paid" when fully paid', () => {
		const { getByText } = renderWithTheme(
			<PaymentStep {...makeProps({ amountPaidNum: 11800 })} />,
		);
		expect(getByText('Fully Paid')).toBeTruthy();
	});

	it('renders Balance Due correctly for partial payment', () => {
		const { getByText } = renderWithTheme(
			<PaymentStep {...makeProps({ amountPaidNum: 5000 })} />,
		);
		expect(getByText('Balance Due: ₹6800.00')).toBeTruthy();
	});

	it('renders Amount Paid field placeholder', () => {
		const { getByPlaceholderText } = renderWithTheme(<PaymentStep {...makeProps()} />);
		expect(getByPlaceholderText('Enter amount paid')).toBeTruthy();
	});

	it('calls setAmountPaid when amount input changes', () => {
		const { getByPlaceholderText } = renderWithTheme(<PaymentStep {...makeProps()} />);
		fireEvent.changeText(getByPlaceholderText('Enter amount paid'), '5000');
		expect(mockSetAmountPaid).toHaveBeenCalledWith('5000');
	});

	it('renders all 4 payment mode buttons', () => {
		const { getByText } = renderWithTheme(<PaymentStep {...makeProps()} />);
		expect(getByText('cash')).toBeTruthy();
		expect(getByText('upi')).toBeTruthy();
		expect(getByText('bank transfer')).toBeTruthy();
		expect(getByText('cheque')).toBeTruthy();
	});

	it('calls setPaymentMode when UPI tapped', () => {
		const { getByText } = renderWithTheme(<PaymentStep {...makeProps()} />);
		fireEvent.press(getByText('upi'));
		expect(mockSetPaymentMode).toHaveBeenCalledWith('upi');
	});

	it('calls setPaymentMode when bank_transfer tapped', () => {
		const { getByText } = renderWithTheme(<PaymentStep {...makeProps()} />);
		fireEvent.press(getByText('bank transfer'));
		expect(mockSetPaymentMode).toHaveBeenCalledWith('bank_transfer');
	});
});
