import type { Invoice, InvoiceLineItem, InvoiceLineItemInput, InvoiceInput } from '../../src/types/invoice';

export type InvoiceListItem = Pick<Invoice, 'id' | 'invoice_number' | 'invoice_date' | 'grand_total' | 'payment_status' | 'amount_paid'> & {
	customer: { name: string; phone?: string };
};

export function makeInvoiceLineItemInput(
	overrides?: Partial<InvoiceLineItemInput>,
): InvoiceLineItemInput {
	return {
		item_id: 'item-uuid-001',
		design_name: 'GLOSSY WHITE 60x60',
		quantity: 10,
		rate_per_unit: 500,
		gst_rate: 18,
		discount: 0,
		...overrides,
	};
}

export function makeInvoiceInput(overrides?: Partial<InvoiceInput>): InvoiceInput {
	return {
		customer_name: 'Test Customer',
		customer_gstin: '',
		invoice_date: '2026-01-15',
		place_of_supply: '27',
		is_inter_state: false,
		payment_status: 'unpaid',
		amount_paid: 0,
		payment_mode: 'cash',
		notes: '',
		reverse_charge: false,
		line_items: [makeInvoiceLineItemInput()],
		...overrides,
	};
}

export function makeInvoice(overrides?: Partial<Invoice>): Invoice {
	return {
		id: 'inv-uuid-001',
		invoice_number: 'TM/2025-26/0001',
		grand_total: 5900,
		created_at: '2026-01-15T10:00:00.000Z',
		updated_at: '2026-01-15T10:00:00.000Z',
		subtotal: 5000,
		cgst_total: 450,
		sgst_total: 450,
		igst_total: 0,
		discount_total: 0,
		is_inter_state: false,
		reverse_charge: false,
		...makeInvoiceInput(),
		...overrides,
	};
}

export function makeInvoiceListItem(overrides?: Partial<InvoiceListItem>): InvoiceListItem {
	return {
		id: 'inv-uuid-001',
		invoice_number: 'TM/2025-26/0001',
		invoice_date: '2026-01-15',
		grand_total: 5900,
		payment_status: 'unpaid',
		amount_paid: 0,
		customer: { name: 'Test Customer', phone: '9876543210' },
		...overrides,
	};
}
