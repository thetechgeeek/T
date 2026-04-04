import { supabase } from '../config/supabase';
import { toAppError } from '../errors/AppError';
import { invoiceRepository } from '../repositories/invoiceRepository';
import { calculateInvoiceTotals, calculateLineItemTax } from '../utils/gstCalculator';
import { validateWith } from '../utils/validation';
import { InvoiceInputSchema } from '../schemas/invoice';
import type { Invoice, InvoiceInput, InvoiceFilters } from '../types/invoice';
import type { UUID } from '../types/common';

export function createInvoiceService(repo = invoiceRepository) {
	return {
		async fetchInvoices(filters: InvoiceFilters, page = 1, limit = 20) {
			let query = supabase
				.from('invoices')
				.select('*, customer:customers(name, phone)', { count: 'exact' });

			if (filters.search) {
				const escaped = filters.search.replace(/[%_\\]/g, (c) => `\\${c}`);
				query = query.or(
					`invoice_number.ilike.%${escaped}%,customer_name.ilike.%${escaped}%`,
				);
			}

			if (filters.payment_status && filters.payment_status !== 'ALL') {
				query = query.eq('payment_status', filters.payment_status);
			}
			if (filters.customer_id) query = query.eq('customer_id', filters.customer_id);
			if (filters.dateFrom) query = query.gte('invoice_date', filters.dateFrom);
			if (filters.dateTo) query = query.lte('invoice_date', filters.dateTo);

			const from = (page - 1) * limit;
			query = query
				.order(filters.sortBy || 'created_at', { ascending: filters.sortDir === 'asc' })
				.range(from, from + limit - 1);

			const { data, count, error } = await query;
			if (error) throw toAppError(error);
			return { data: (data ?? []) as Invoice[], count: count || 0 };
		},

		async fetchInvoiceDetail(id: UUID): Promise<Invoice> {
			try {
				return await repo.findWithLineItems(id);
			} catch (error) {
				throw toAppError(error);
			}
		},

		/**
		 * Creates invoice atomically via migration 011 RPC.
		 * Invoice number, line items, and stock deductions happen in a single
		 * DB transaction — no partial failures possible.
		 */
		async createInvoice(input: InvoiceInput): Promise<Invoice> {
			validateWith(InvoiceInputSchema, input);
			const totals = calculateInvoiceTotals(input.line_items, input.is_inter_state);

			const invoiceData = {
				invoice_date: input.invoice_date,
				customer_id: input.customer_id,
				customer_name: input.customer_name,
				customer_gstin: input.customer_gstin,
				customer_phone: input.customer_phone,
				customer_address: input.customer_address,
				is_inter_state: input.is_inter_state,
				place_of_supply: input.place_of_supply,
				reverse_charge: input.reverse_charge ?? false,
				payment_status: input.payment_status || 'unpaid',
				payment_mode: input.payment_mode,
				amount_paid: input.amount_paid || 0,
				notes: input.notes,
				terms: input.terms,
				...totals,
			};

			const lineItems = input.line_items.map((item, index) => {
				const discount = item.discount || 0;
				const tax = calculateLineItemTax(
					item.gst_rate,
					item.quantity,
					item.rate_per_unit,
					discount,
					input.is_inter_state,
				);
				return {
					item_id: item.item_id,
					design_name: item.design_name,
					description: item.description,
					hsn_code: item.hsn_code,
					quantity: item.quantity,
					rate_per_unit: item.rate_per_unit,
					discount,
					taxable_amount: tax.taxableAmount,
					gst_rate: item.gst_rate,
					cgst_amount: tax.cgst,
					sgst_amount: tax.sgst,
					igst_amount: tax.igst,
					line_total: tax.lineTotal,
					tile_image_url: item.tile_image_url,
					sort_order: index,
				};
			});

			try {
				const result = await repo.createAtomic(
					invoiceData as unknown as Parameters<typeof repo.createAtomic>[0],
					lineItems,
				);
				// Re-fetch to return full Invoice type for store consistency
				return await repo.findById(result.id);
			} catch (error) {
				throw toAppError(error);
			}
		},
	};
}

// Default instance for production use
export const invoiceService = createInvoiceService();
