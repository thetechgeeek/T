import { supabase } from '../config/supabase';
import type {
	Customer,
	CustomerInsert,
	CustomerFilters,
	CustomerLedgerEntry,
	CustomerLedgerSummary,
	AgingBucket,
} from '../types/customer';
import type { UUID } from '../types/common';

export const customerService = {
	async fetchCustomers(filters: CustomerFilters, page = 1, limit = 20) {
		let query = supabase.from('customers').select('*', { count: 'exact' });

		if (filters.search) {
			// Search both name AND phone (fixes §customerService.ts:19)
			const escaped = filters.search.replace(/[%_\\]/g, (c) => `\\${c}`);
			query = query.or(`name.ilike.%${escaped}%,phone.ilike.%${escaped}%`);
		}

		if (filters.type && filters.type !== 'ALL') {
			query = query.eq('type', filters.type);
		}

		const from = (page - 1) * limit;
		const to = from + limit - 1;

		query = query
			.order(filters.sortBy || 'name', { ascending: filters.sortDir !== 'desc' })
			.range(from, to);

		const { data, count, error } = await query;

		if (error) throw error;
		return { data: data as Customer[], count: count || 0 };
	},

	async fetchCustomerById(id: UUID): Promise<Customer> {
		const { data, error } = await supabase.from('customers').select('*').eq('id', id).single();

		if (error) throw error;
		return data as Customer;
	},

	async createCustomer(customer: CustomerInsert): Promise<Customer> {
		const { data, error } = await supabase
			.from('customers')
			.insert([customer])
			.select()
			.single();

		if (error) throw error;
		return data as Customer;
	},

	async updateCustomer(id: UUID, updates: Partial<CustomerInsert>): Promise<Customer> {
		const { data, error } = await supabase
			.from('customers')
			.update(updates)
			.eq('id', id)
			.select()
			.single();

		if (error) throw error;
		return data as Customer;
	},

	async getLedgerSummary(customerId: UUID): Promise<CustomerLedgerSummary> {
		const { data, error } = await supabase
			.from('customer_ledger_summary')
			.select('*')
			.eq('customer_id', customerId)
			.single();

		if (error && error.code !== 'PGRST116') throw error; // PGRST116 is 'no rows found'

		if (!data) {
			return {
				customer_id: customerId,
				total_invoiced: 0,
				total_paid: 0,
				outstanding_balance: 0,
			};
		}

		return data as CustomerLedgerSummary;
	},

	async fetchLedgerEntries(customerId: UUID): Promise<CustomerLedgerEntry[]> {
		// We need to fetch both invoices and payments and merge them
		const [invoicesRes, paymentsRes] = await Promise.all([
			supabase
				.from('invoices')
				.select('invoice_date, invoice_number, grand_total, notes')
				.eq('customer_id', customerId)
				.order('invoice_date', { ascending: true }),
			supabase
				.from('payments')
				.select('payment_date, amount, payment_mode, direction, notes')
				.eq('customer_id', customerId)
				.eq('direction', 'received')
				.order('payment_date', { ascending: true }),
		]);

		if (invoicesRes.error) throw invoicesRes.error;
		if (paymentsRes.error) throw paymentsRes.error;

		const entries: CustomerLedgerEntry[] = [
			...invoicesRes.data.map((inv) => ({
				date: inv.invoice_date,
				type: 'invoice' as const,
				reference: inv.invoice_number,
				debit: inv.grand_total,
				credit: 0,
				balance: 0, // Will calculate below
				notes: inv.notes,
			})),
			...paymentsRes.data.map((p) => ({
				date: p.payment_date,
				type: 'payment' as const,
				reference: `Payment (${p.payment_mode.toUpperCase()})`,
				debit: 0,
				credit: p.amount,
				balance: 0, // Will calculate below
				notes: p.notes,
			})),
		];

		// Sort by date then type (invoice before payment if on same date)
		entries.sort((a, b) => {
			const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
			if (dateCompare !== 0) return dateCompare;
			return a.type === 'invoice' ? -1 : 1;
		});

		// Calculate running balance
		let runningBalance = 0;
		for (const entry of entries) {
			runningBalance += entry.debit - entry.credit;
			entry.balance = runningBalance;
		}

		return entries.reverse(); // Newest first for UI
	},

	async getAgingReport(customerId?: UUID): Promise<AgingBucket[]> {
		const { data, error } = await supabase.rpc('get_aging_report', {
			p_customer_id: customerId || null,
		});

		if (error) throw error;
		return data as AgingBucket[];
	},
};
