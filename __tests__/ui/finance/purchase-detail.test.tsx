import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import PurchaseBillDetailScreen from '@/app/(app)/finance/purchases/[id]';
import { renderWithTheme } from '../../utils/renderWithTheme';

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockPurchaseSingle = jest.fn();
const mockPurchaseEq = jest.fn(() => ({ single: mockPurchaseSingle }));
const mockPurchaseSelect = jest.fn(() => ({ eq: mockPurchaseEq }));
const mockPaymentOrder = jest.fn();
const mockPaymentEq = jest.fn(() => ({ order: mockPaymentOrder }));
const mockPaymentSelect = jest.fn(() => ({ eq: mockPaymentEq }));
const mockFrom = jest.fn((table: string) => {
	if (table === 'purchases') {
		return { select: mockPurchaseSelect };
	}

	if (table === 'payments') {
		return { select: mockPaymentSelect };
	}

	return { select: jest.fn() };
});

jest.mock('@/src/config/supabase', () => ({
	supabase: {
		from: (table: string) => mockFrom(table),
	},
}));

describe('PurchaseBillDetailScreen', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		(useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'purchase-1' });
		(useRouter as jest.Mock).mockReturnValue({ push: mockPush, back: mockBack });
		mockPurchaseSingle.mockResolvedValue({
			data: {
				id: 'purchase-1',
				purchase_number: 'PB-001',
				purchase_date: '2026-04-10',
				grand_total: 5000,
				subtotal: 4500,
				tax_total: 500,
				amount_paid: 2000,
				payment_status: 'partial',
				supplier_name: 'Tile World',
				suppliers: { name: 'Tile World', phone: '9876543210' },
				purchase_line_items: [
					{
						id: 'line-1',
						design_name: 'Glossy Tile',
						quantity: 10,
						rate_per_unit: 450,
						amount: 4500,
					},
				],
			},
			error: null,
		});
		mockPaymentOrder.mockResolvedValue({
			data: [
				{
					id: 'payment-1',
					amount: 2000,
					payment_date: '2026-04-11',
					payment_mode: 'cash',
				},
			],
			error: null,
		});
	});

	it('renders purchase details and the fixed payment action', async () => {
		const { getAllByText, getByText, getByLabelText } = renderWithTheme(
			<PurchaseBillDetailScreen />,
		);

		await waitFor(() => {
			expect(getAllByText('PB-001').length).toBeGreaterThan(0);
			expect(getByText('Tile World')).toBeTruthy();
			expect(getByText('Payment History')).toBeTruthy();
			expect(getByLabelText('record-payment')).toBeTruthy();
		});
	});

	it('navigates to the payment form from the sticky footer', async () => {
		const { getByLabelText } = renderWithTheme(<PurchaseBillDetailScreen />);

		await waitFor(() => {
			expect(getByLabelText('record-payment')).toBeTruthy();
		});

		fireEvent.press(getByLabelText('record-payment'));

		expect(mockPush).toHaveBeenCalledWith('/(app)/finance/payments/make');
	});
});
