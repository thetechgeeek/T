import type { Payment } from '../../src/types/finance';

export type PaymentInput = Omit<Payment, 'id' | 'created_at' | 'updated_at'>;

export function makePaymentInput(overrides?: Partial<PaymentInput>): PaymentInput {
	return {
		invoice_id: 'inv-uuid-001',
		customer_id: 'cust-uuid-001',
		amount: 1000,
		payment_mode: 'cash',
		payment_date: '2026-01-15',
		direction: 'received',
		notes: '',
		...overrides,
	};
}

export function makePayment(overrides?: Partial<Payment>): Payment {
	return {
		id: 'pay-uuid-001',
		created_at: '2026-01-15T10:00:00.000Z',
		updated_at: '2026-01-15T10:00:00.000Z',
		...makePaymentInput(),
		...overrides,
	};
}
