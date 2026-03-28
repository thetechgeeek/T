import { supabase } from '../config/supabase';
import type { PaymentMode } from '../types/invoice';
import type { UUID } from '../types/common';

export interface PaymentInput {
	payment_date: string;
	amount: number;
	payment_mode: PaymentMode;
	direction: 'received' | 'made';
	customer_id?: UUID;
	supplier_id?: UUID;
	invoice_id?: UUID;
	purchase_id?: UUID;
	notes?: string;
}

export const paymentService = {
	async recordPayment(input: PaymentInput) {
		// 1. Insert original payment record
		const { data: payment, error: paymentError } = await supabase
			.from('payments')
			.insert([input])
			.select()
			.single();

		if (paymentError) throw paymentError;

		// 2. If it's linked to an invoice, we need to update the invoice's amount_paid and status
		if (input.invoice_id && input.direction === 'received') {
			// First get current invoice status
			const { data: invoice, error: invoiceError } = await supabase
				.from('invoices')
				.select('grand_total, amount_paid')
				.eq('id', input.invoice_id)
				.single();

			if (invoiceError) throw invoiceError;

			const newAmountPaid = (invoice.amount_paid || 0) + input.amount;
			let newStatus = 'partial';
			if (newAmountPaid >= invoice.grand_total) {
				newStatus = 'paid';
			}

			const { error: updateError } = await supabase
				.from('invoices')
				.update({
					amount_paid: newAmountPaid,
					payment_status: newStatus,
				})
				.eq('id', input.invoice_id);

			if (updateError) throw updateError;
		}

		return payment;
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
