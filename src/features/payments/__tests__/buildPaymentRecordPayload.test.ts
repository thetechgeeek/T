import { PaymentSchema } from '@/src/schemas/payment';
import {
	buildMakePaymentRecordPayload,
	buildReceivePaymentRecordPayload,
} from '../buildPaymentRecordPayload';

const customerId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const supplierId = 'b2c3d4e5-f6a7-8901-bcde-f12345678901';

describe('buildReceivePaymentRecordPayload', () => {
	it('parses with PaymentSchema', () => {
		const payload = buildReceivePaymentRecordPayload({
			paymentDate: '2026-01-15',
			amount: 1000,
			paymentMode: 'cash',
			customerId,
		});
		expect(PaymentSchema.safeParse(payload).success).toBe(true);
	});

	it('includes optional notes', () => {
		const payload = buildReceivePaymentRecordPayload({
			paymentDate: '2026-01-15',
			amount: 100,
			paymentMode: 'upi',
			customerId,
			notes: 'ref',
		});
		const parsed = PaymentSchema.safeParse(payload);
		expect(parsed.success).toBe(true);
		if (parsed.success) expect(parsed.data.notes).toBe('ref');
	});
});

describe('buildMakePaymentRecordPayload', () => {
	it('parses with PaymentSchema', () => {
		const payload = buildMakePaymentRecordPayload({
			paymentDate: '2026-01-15',
			amount: 2000,
			paymentMode: 'bank_transfer',
			supplierId,
		});
		expect(PaymentSchema.safeParse(payload).success).toBe(true);
	});

	it('rejects when amount is zero (schema)', () => {
		const payload = buildMakePaymentRecordPayload({
			paymentDate: '2026-01-15',
			amount: 0,
			paymentMode: 'cash',
			supplierId,
		});
		expect(PaymentSchema.safeParse(payload).success).toBe(false);
	});
});
