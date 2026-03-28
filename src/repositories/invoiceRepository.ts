import { supabase } from '../config/supabase';
import { AppError } from '../errors';
import { createRepository } from './baseRepository';
import type { Invoice, InvoiceLineItemInput } from '../types/invoice';
import type { UUID } from '../types/common';

const base = createRepository<Invoice>('invoices');

export const invoiceRepository = {
	...base,

	async findWithLineItems(id: UUID): Promise<Invoice> {
		const { data, error } = await supabase
			.from('invoices')
			.select('*, line_items:invoice_line_items(*)')
			.eq('id', id)
			.single();
		if (error) {
			throw new AppError(error.message, error.code ?? 'DB_ERROR', 'Invoice not found', error);
		}
		return data as Invoice;
	},

	/** Atomic invoice creation — uses migration 011 RPC */
	async createAtomic(
		invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at' | 'line_items'>,
		lineItems: InvoiceLineItemInput[],
	): Promise<{ id: UUID; invoice_number: string }> {
		const { data, error } = await supabase.rpc('create_invoice_with_items_v1', {
			p_invoice: invoice,
			p_line_items: lineItems,
		});
		if (error) {
			throw new AppError(
				error.message,
				error.code ?? 'RPC_ERROR',
				'Failed to create invoice',
				error,
			);
		}
		return data as { id: UUID; invoice_number: string };
	},
};
