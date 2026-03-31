import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithTheme } from '../../../../__tests__/utils/renderWithTheme';
import { PaymentModal } from '../PaymentModal';

jest.mock('@/src/services/paymentService', () => ({
	paymentService: {
		recordPayment: jest.fn().mockResolvedValue({ id: 'pay-001' }),
	},
}));

import { paymentService } from '@/src/services/paymentService';

const baseProps = {
	visible: true,
	onClose: jest.fn(),
	onSuccess: jest.fn(),
	customerId: 'cust-001',
	customerName: 'Test Customer',
	invoiceId: 'inv-001',
	invoiceNumber: 'TM/001',
	totalAmount: 5900,
};

describe('PaymentModal', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('does NOT render content when visible=false', () => {
		const { queryByText } = renderWithTheme(
			<PaymentModal {...baseProps} visible={false} />,
		);
		// Modal mock returns null when visible=false
		expect(queryByText('Record Payment')).toBeNull();
	});
	it('DOES render content when visible=true', () => {
		const { getByTestId } = renderWithTheme(<PaymentModal {...baseProps} />);
		expect(getByTestId('submit-payment-button')).toBeTruthy();
	});

	it('renders the invoice number in the modal header area', () => {
		const { getByText } = renderWithTheme(<PaymentModal {...baseProps} />);
		expect(getByText(/TM\/001/)).toBeTruthy();
	});

	it('calls paymentService.recordPayment with amount and mode when submitted', async () => {
		const { getByPlaceholderText, getByTestId } = renderWithTheme(
			<PaymentModal {...baseProps} totalAmount={0} />,
		);

		// Enter amount
		fireEvent.changeText(getByPlaceholderText('0.00'), '2000');

		// Press "Record Payment" submit button
		const submitButton = getByTestId('submit-payment-button');
		fireEvent.press(submitButton);

		// paymentService.recordPayment should be called
		await new Promise(process.nextTick);
		expect(paymentService.recordPayment).toHaveBeenCalledWith(
			expect.objectContaining({ amount: 2000 }),
		);
	});

	it('does NOT call paymentService.recordPayment when amount is empty on submit', () => {
		const { getByTestId } = renderWithTheme(
			<PaymentModal {...baseProps} totalAmount={0} />,
		);

		// Press "Record Payment" submit button
		const submitButton = getByTestId('submit-payment-button');
		fireEvent.press(submitButton);

		expect(paymentService.recordPayment).not.toHaveBeenCalled();
	});

	it('calls onClose when close (ghost) button is pressed', () => {
		const onClose = jest.fn();
		const { getByTestId } = renderWithTheme(
			<PaymentModal {...baseProps} onClose={onClose} />,
		);

		// Find and press the close button
		const closeButton = getByTestId('close-modal-button');
		fireEvent.press(closeButton);
		expect(onClose).toHaveBeenCalled();
	});
});
