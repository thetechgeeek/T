import type { UUID, Timestamps } from './common';

export interface Supplier extends Timestamps {
	id: UUID;
	name: string;
	contact_person?: string;
	phone?: string;
	gstin?: string;
	address?: string;
	city?: string;
	state?: string;
	payment_terms?: string;
	notes?: string;
}

export type SupplierInsert = Omit<Supplier, 'id' | 'created_at' | 'updated_at'>;

export interface SupplierLedgerSummary {
	supplier_id: UUID;
	total_purchased: number;
	total_paid: number;
	outstanding_balance: number;
}

export interface SupplierFilters {
	search?: string;
	sortBy?: 'name' | 'created_at';
	sortDir?: 'asc' | 'desc';
}
