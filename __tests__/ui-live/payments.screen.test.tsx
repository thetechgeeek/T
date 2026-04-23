import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import PaymentsScreen from '@/app/(app)/finance/payments/index';
import { paymentService } from '@/src/services/paymentService';
import { renderScreen } from '../utils/screenHarness';

jest.mock('@/src/services/paymentService', () => ({
	paymentService: {
		fetchPayments: jest.fn(),
		recordPayment: jest.fn(),
	},
}));

describe('Payments screen live wiring', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		(paymentService.fetchPayments as jest.Mock).mockResolvedValue([
			{
				id: 'payment-1',
				amount: 4500,
				payment_date: '2026-04-20',
				payment_mode: 'upi',
				direction: 'received',
				customer: { name: 'Rajesh Tiles' },
			},
		]);
	});

	it('loads the payments list and keeps the record-payment CTA wired to navigation', async () => {
		const screen = await renderScreen(<PaymentsScreen />);

		await waitFor(() => {
			expect(paymentService.fetchPayments).toHaveBeenCalledWith({});
		});

		expect(screen.getByText('Rajesh Tiles')).toBeTruthy();

		fireEvent.press(screen.getByLabelText('Record payment'));

		expect(screen.router.push).toHaveBeenCalledWith('/(app)/finance/payments/receive');
	});
});
