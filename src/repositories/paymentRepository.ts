import { supabase } from '../config/supabase';
import { AppError } from '../errors';
import { createRepository } from './baseRepository';
import type { Payment } from '../types/finance';
import type { PaymentStatus } from '../types/invoice';
import type { UUID } from '../types/common';

const base = createRepository<Payment>('payments');

export type PaymentInput = Omit<Payment, 'id' | 'created_at' | 'updated_at'>;

export const paymentRepository = {
	...base,

	/** Atomic payment + invoice status update — uses migration 012 RPC */
	async recordWithInvoiceUpdate(
		payment: PaymentInput,
	): Promise<{ id: UUID; new_status: PaymentStatus }> {
		const { data, error } = await supabase.rpc('record_payment_with_invoice_update', {
			p_payment: payment,
		});
		if (error) {
			throw new AppError(
				error.message,
				error.code ?? 'RPC_ERROR',
				'Failed to record payment',
				error,
			);
		}
		return data as { id: UUID; new_status: PaymentStatus };
	},
};
