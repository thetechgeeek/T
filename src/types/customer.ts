import type { UUID, Timestamps } from './common';

export type CustomerType = 'retail' | 'contractor' | 'builder' | 'dealer';

export interface Customer extends Timestamps {
	id: UUID;
	name: string;
	/** Natural key — unique in DB; used for invoice link-or-create by phone. */
	phone: string;
	gstin?: string;
	address?: string;
	city?: string;
	state?: string;
	type: CustomerType;
	credit_limit: number;
	notes?: string;
	current_balance?: number;
}

export type CustomerInsert = Omit<Customer, 'id' | 'created_at' | 'updated_at'>;

export interface CustomerLedgerEntry {
	date: string;
	type: 'invoice' | 'payment';
	reference: string;
	debit: number;
	credit: number;
	balance: number;
	notes?: string;
}

export interface CustomerLedgerSummary {
	customer_id: UUID;
	total_invoiced: number;
	total_paid: number;
	outstanding_balance: number;
	last_invoice_date?: string;
	last_payment_date?: string;
}

export interface AgingBucket {
	customer_id: UUID;
	customer_name: string;
	current_0_30: number;
	overdue_31_60: number;
	overdue_61_90: number;
	overdue_90_plus: number;
	total_outstanding: number;
}

export interface CustomerFilters {
	search?: string;
	type?: CustomerType | 'ALL';
	hasOutstanding?: boolean;
	sortBy?: 'name' | 'outstanding_balance' | 'created_at';
	sortDir?: 'asc' | 'desc';
}
