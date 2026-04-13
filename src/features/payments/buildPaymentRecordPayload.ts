import type { PaymentInput } from '@/src/repositories/paymentRepository';
import type { PaymentMode } from '@/src/types/invoice';

export type BuildReceivePaymentInput = {
	paymentDate: string;
	amount: number;
	paymentMode: PaymentMode;
	customerId: string;
	notes?: string;
};

export type BuildMakePaymentInput = {
	paymentDate: string;
	amount: number;
	paymentMode: PaymentMode;
	supplierId: string;
	notes?: string;
};

/** Mirrors `ReceivePaymentScreen` submit payload. */
export function buildReceivePaymentRecordPayload(input: BuildReceivePaymentInput): PaymentInput {
	return {
		payment_date: input.paymentDate,
		amount: input.amount,
		payment_mode: input.paymentMode,
		direction: 'received',
		customer_id: input.customerId,
		notes: input.notes,
	};
}

/** Mirrors `MakePaymentScreen` submit payload. */
export function buildMakePaymentRecordPayload(input: BuildMakePaymentInput): PaymentInput {
	return {
		payment_date: input.paymentDate,
		amount: input.amount,
		payment_mode: input.paymentMode,
		direction: 'made',
		supplier_id: input.supplierId,
		notes: input.notes,
	};
}
