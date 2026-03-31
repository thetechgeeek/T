import { supabase } from '../config/supabase';
import { paymentRepository } from '../repositories/paymentRepository';
import { validateWith } from '../utils/validation';
import { PaymentSchema } from '../schemas/payment';
import type { PaymentInput } from '../repositories/paymentRepository';
import type { UUID } from '../types/common';

export type { PaymentInput };

export function createPaymentService(repo = paymentRepository) {
	return {
		/**
		 * Records a payment and atomically updates invoice amount_paid + status
		 * via migration 012 RPC. Eliminates the read-modify-write race condition.
		 */
		async recordPayment(input: PaymentInput) {
			validateWith(PaymentSchema, input);
			return repo.recordWithInvoiceUpdate(input);
		},

		async fetchPayments(filters: {
			customer_id?: UUID;
			supplier_id?: UUID;
			dateFrom?: string;
			dateTo?: string;
		}) {
			return repo.fetchPayments(filters);
		},
	};
}

export const paymentService = createPaymentService();
