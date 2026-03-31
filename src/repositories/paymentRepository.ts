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
		const { data, error } = await supabase.rpc('record_payment_with_invoice_update_v1', {
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
