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
			let query = supabase
				.from('payments')
				.select('*, customer:customers(name), supplier:suppliers(name)');

			if (filters.customer_id) query = query.eq('customer_id', filters.customer_id);
			if (filters.supplier_id) query = query.eq('supplier_id', filters.supplier_id);
			if (filters.dateFrom) query = query.gte('payment_date', filters.dateFrom);
			if (filters.dateTo) query = query.lte('payment_date', filters.dateTo);

			const { data, error } = await query.order('payment_date', { ascending: false });
			if (error) throw error;
			return data;
		},
	};
}

export const paymentService = createPaymentService();
