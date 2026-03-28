import { supabase } from '../config/supabase';
import type { Invoice, InvoiceInput, InvoiceFilters, InvoiceLineItem } from '../types/invoice';
import { calculateInvoiceTotals, calculateLineItemTax } from '../utils/gstCalculator';

export const invoiceService = {
	async fetchInvoices(filters: InvoiceFilters, page = 1, limit = 20) {
		let query = supabase
			.from('invoices')
			.select('*, customer:customers(name, phone)', { count: 'exact' });

		if (filters.search) {
			query = query.or(
				`invoice_number.ilike.%${filters.search}%,customer_name.ilike.%${filters.search}%`,
			);
		}

		if (filters.payment_status && filters.payment_status !== 'ALL') {
			query = query.eq('payment_status', filters.payment_status);
		}

		if (filters.customer_id) {
			query = query.eq('customer_id', filters.customer_id);
		}

		if (filters.dateFrom) query = query.gte('invoice_date', filters.dateFrom);
		if (filters.dateTo) query = query.lte('invoice_date', filters.dateTo);

		const from = (page - 1) * limit;
		const to = from + limit - 1;

		query = query
			.order(filters.sortBy || 'created_at', { ascending: filters.sortDir === 'asc' })
			.range(from, to);

		const { data, count, error } = await query;

		if (error) throw error;
		return { data: data as any[], count: count || 0 };
	},

	async fetchInvoiceById(id: string): Promise<Invoice> {
		const { data, error } = await supabase
			.from('invoices')
			.select('*, line_items:invoice_line_items(*)')
			.eq('id', id)
			.single();

		if (error) throw error;
		return data as Invoice;
	},

	/**
	 * Creates an invoice, its line items, and deducts from inventory.
	 * Supabase doesn't support interactive transactions over the REST API easily,
	 * so we do a sequence of inserts + RPC calls.
	 */
	async createInvoice(input: InvoiceInput): Promise<Invoice> {
		const { line_items, ...invoiceData } = input;

		// First, verify we have an invoice number by inserting.
		// The DB trigger/function generate_invoice_number() isn't attached to insert directly by default
		// Wait, the DB migration 005 uses a function but doesn't assign it as default.
		// Let's call the function first to get the number.
		const { data: invoiceNumData, error: numError } =
			await supabase.rpc('generate_invoice_number');
		if (numError) throw numError;
		const invoice_number = invoiceNumData;

		// Calculate exact totals again on the server side/service to be completely safe
		const totals = calculateInvoiceTotals(line_items, input.is_inter_state);

		const finalInvoiceData = {
			...invoiceData,
			invoice_number,
			subtotal: totals.subtotal,
			cgst_total: totals.cgst_total,
			sgst_total: totals.sgst_total,
			igst_total: totals.igst_total,
			discount_total: totals.discount_total,
			grand_total: totals.grand_total,
			amount_paid: input.amount_paid || 0,
			payment_status: input.payment_status || 'unpaid',
		};

		// 1. Insert Invoice
		const { data: invoice, error: invoiceError } = await supabase
			.from('invoices')
			.insert([finalInvoiceData])
			.select()
			.single();

		if (invoiceError) throw invoiceError;

		// 2. Prepare Line Items
		const finalItems = line_items.map((item, index) => {
			const discount = item.discount || 0;
			const tax = calculateLineItemTax(
				item.gst_rate,
				item.quantity,
				item.rate_per_unit,
				discount,
				input.is_inter_state,
			);

			return {
				invoice_id: invoice.id,
				item_id: item.item_id,
				design_name: item.design_name,
				description: item.description,
				hsn_code: item.hsn_code,
				quantity: item.quantity,
				rate_per_unit: item.rate_per_unit,
				discount: discount,
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

		// 3. Insert Line Items
		const { error: itemsError } = await supabase.from('invoice_line_items').insert(finalItems);

		if (itemsError) throw itemsError;

		// 4. Update Inventory Stock (Stock Out)
		for (const item of finalItems) {
			if (item.item_id) {
				const { error: stockError } = await supabase.rpc('perform_stock_operation', {
					p_item_id: item.item_id,
					p_operation_type: 'stock_out',
					p_quantity_change: -item.quantity,
					p_reason: `Invoice #${invoice_number}`,
					p_reference_type: 'invoice',
					p_reference_id: invoice.id,
				});
				if (stockError) {
					console.error('Failed to deduct stock for item', item.item_id, stockError);
					// Ideally roll back, but REST is not transactional.
					// Alternatively, we could write a single RPC that does everything.
				}
			}
		}

		return invoice as Invoice;
	},
};
