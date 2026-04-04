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
		const { queryByText } = renderWithTheme(<PaymentModal {...baseProps} visible={false} />);
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
		const { getByTestId } = renderWithTheme(<PaymentModal {...baseProps} totalAmount={0} />);

		// Press "Record Payment" submit button
		const submitButton = getByTestId('submit-payment-button');
		fireEvent.press(submitButton);

		expect(paymentService.recordPayment).not.toHaveBeenCalled();
	});

	it('calls onClose when close (ghost) button is pressed', () => {
		const onClose = jest.fn();
		const { getByTestId } = renderWithTheme(<PaymentModal {...baseProps} onClose={onClose} />);

		// Find and press the close button
		const closeButton = getByTestId('close-modal-button');
		fireEvent.press(closeButton);
		expect(onClose).toHaveBeenCalled();
	});

	// ─── Phase 3: Loading state tests ────────────────────────────────────────

	it('Record Payment button shows loading indicator (ActivityIndicator) while loading', async () => {
		// Make recordPayment never resolve — simulates in-flight request
		(paymentService.recordPayment as jest.Mock).mockReturnValue(new Promise(() => {}));

		const { getByPlaceholderText, getByTestId } = renderWithTheme(
			<PaymentModal {...baseProps} totalAmount={0} />,
		);
		fireEvent.changeText(getByPlaceholderText('0.00'), '1000');
		fireEvent.press(getByTestId('submit-payment-button'));

		// After press, button should show loading indicator
		await new Promise((r) => setTimeout(r, 0));
		expect(getByTestId('loading-indicator')).toBeTruthy();
	});

	it('Record Payment button is disabled (accessibilityState.disabled) while loading', async () => {
		(paymentService.recordPayment as jest.Mock).mockReturnValue(new Promise(() => {}));

		const { getByPlaceholderText, getByTestId } = renderWithTheme(
			<PaymentModal {...baseProps} totalAmount={0} />,
		);
		fireEvent.changeText(getByPlaceholderText('0.00'), '1000');
		fireEvent.press(getByTestId('submit-payment-button'));

		await new Promise((r) => setTimeout(r, 0));
		const submitButton = getByTestId('submit-payment-button');
		expect(submitButton.props.accessibilityState?.disabled).toBe(true);
	});

	it('loading clears and modal stays open after recordPayment throws', async () => {
		(paymentService.recordPayment as jest.Mock).mockRejectedValue(new Error('Network error'));

		const onClose = jest.fn();
		const { getByPlaceholderText, getByTestId, queryByText } = renderWithTheme(
			<PaymentModal {...baseProps} totalAmount={0} onClose={onClose} />,
		);
		fireEvent.changeText(getByPlaceholderText('0.00'), '1000');
		fireEvent.press(getByTestId('submit-payment-button'));

		await new Promise((r) => setTimeout(r, 50));

		// Loading cleared (button text reverts) and modal stays open (onClose not called)
		expect(queryByText('Processing...')).toBeNull();
		expect(onClose).not.toHaveBeenCalled();
	});

	it('amount=0: submit button press does nothing (loading state never entered)', () => {
		const { getByTestId, queryByText } = renderWithTheme(
			<PaymentModal {...baseProps} totalAmount={0} />,
		);
		fireEvent.press(getByTestId('submit-payment-button'));

		expect(queryByText('Processing...')).toBeNull();
		expect(paymentService.recordPayment).not.toHaveBeenCalled();
	});

	// ─── Phase 4: Variant tests ──────────────────────────────────────────────

	it('shows "Customer: Name" when invoiceNumber is absent', () => {
		const { getByText, queryByText } = renderWithTheme(
			<PaymentModal {...baseProps} invoiceId={undefined} invoiceNumber={undefined} />,
		);
		expect(getByText(/Customer: Test Customer/)).toBeTruthy();
		expect(queryByText(/Invoice:/)).toBeNull();
	});

	it('pre-fills amount input when totalAmount > 0', () => {
		const { getByDisplayValue } = renderWithTheme(
			<PaymentModal {...baseProps} totalAmount={1500} />,
		);
		expect(getByDisplayValue('1500')).toBeTruthy();
	});

	it('leaves amount input empty when totalAmount is 0', () => {
		const { getByPlaceholderText } = renderWithTheme(
			<PaymentModal {...baseProps} totalAmount={0} />,
		);
		const input = getByPlaceholderText('0.00');
		expect(input.props.value).toBe('');
	});

	it('updates active payment mode and uses it on submit', async () => {
		const { getByLabelText, getByTestId } = renderWithTheme(<PaymentModal {...baseProps} />);

		const upiButton = getByLabelText('payment-mode-upi');
		fireEvent.press(upiButton);

		fireEvent.press(getByTestId('submit-payment-button'));

		await new Promise(process.nextTick);
		expect(paymentService.recordPayment).toHaveBeenCalledWith(
			expect.objectContaining({ payment_mode: 'upi' }),
		);
	});
});
