import { supabase } from '../config/supabase';
import { toAppError } from '../errors';
import { createRepository } from './baseRepository';
import type { Invoice, InvoiceLineItemInput, PaymentMode, PaymentStatus } from '../types/invoice';
import type { UUID } from '../types/common';

const base = createRepository<Invoice>('invoices');

export interface InvoiceCreatePayload {
	invoice_number?: string;
	idempotency_key?: UUID;
	invoice_date: string;
	customer_id?: UUID;
	customer_name: string;
	customer_gstin?: string;
	customer_phone: string;
	customer_address?: string;
	is_inter_state: boolean;
	place_of_supply?: string;
	reverse_charge?: boolean;
	payment_status: PaymentStatus;
	payment_mode?: PaymentMode;
	amount_paid?: number;
	notes?: string;
	terms?: string;
}

export const invoiceRepository = {
	...base,

	async findWithLineItems(id: UUID): Promise<Invoice> {
		const { data, error } = await supabase
			.from('invoices')
			.select('*, line_items:invoice_line_items(*)')
			.eq('id', id)
			.single();
		if (error) throw toAppError(error);
		return data as Invoice;
	},

	/** Atomic invoice creation — uses migration 011 RPC */
	async createAtomic(
		invoice: InvoiceCreatePayload,
		lineItems: InvoiceLineItemInput[],
	): Promise<{ id: UUID; invoice_number: string }> {
		const { data, error } = await supabase.rpc('create_invoice_with_items_v1', {
			p_invoice: invoice,
			p_line_items: lineItems,
		});
		if (error) throw toAppError(error);
		return data as { id: UUID; invoice_number: string };
	},
};
