import { z } from 'zod';
import { supabase } from '../config/supabase';
import { toAppError } from '../errors/AppError';
import { validateWith } from '../utils/validation';
import { normalizePage, normalizePageSize, resolveSortField } from '@/src/utils/queryGuards';
import { CustomerSchema } from '../schemas/customer';
import type {
	Customer,
	CustomerInsert,
	CustomerFilters,
	CustomerLedgerEntry,
	CustomerLedgerSummary,
	AgingBucket,
} from '../types/customer';
import type { UUID } from '../types/common';

const CUSTOMER_SORT_FIELDS = ['name', 'outstanding_balance', 'created_at'] as const;

function toCustomerDbPayload(input: Partial<CustomerInsert>): Partial<CustomerInsert> {
	const payload: Record<string, unknown> = {};
	if (input.name !== undefined) payload.name = input.name;
	if (input.phone !== undefined) payload.phone = input.phone;
	if (input.gstin !== undefined) payload.gstin = input.gstin;
	if (input.address !== undefined) payload.address = input.address;
	if (input.city !== undefined) payload.city = input.city;
	if (input.state !== undefined) payload.state = input.state;
	if (input.type !== undefined) payload.type = input.type;
	if (input.credit_limit !== undefined) payload.credit_limit = input.credit_limit;
	if (input.notes !== undefined) payload.notes = input.notes;
	return payload as Partial<CustomerInsert>;
}

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

		const safePage = normalizePage(page);
		const safeLimit = normalizePageSize(limit);
		const sortField = resolveSortField(filters.sortBy, CUSTOMER_SORT_FIELDS, 'name');
		const from = (safePage - 1) * safeLimit;
		const to = from + safeLimit - 1;

		query = query.order(sortField, { ascending: filters.sortDir !== 'desc' }).range(from, to);

		const { data, count, error } = await query;

		if (error) throw toAppError(error);
		return { data: data as Customer[], count: count || 0 };
	},

	async fetchCustomerById(id: UUID): Promise<Customer> {
		const { data, error } = await supabase.from('customers').select('*').eq('id', id).single();

		if (error) throw toAppError(error);
		return data as Customer;
	},

	async createCustomer(customer: CustomerInsert): Promise<Customer> {
		const parsed = validateWith(CustomerSchema, customer);
		const payload = toCustomerDbPayload(parsed);
		const { data, error } = await supabase
			.from('customers')
			.insert([payload])
			.select()
			.single();

		if (error) throw toAppError(error);
		return data as Customer;
	},

	async updateCustomer(id: UUID, updates: Partial<CustomerInsert>): Promise<Customer> {
		if (updates.phone !== undefined) {
			z.string()
				.regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number')
				.parse(updates.phone);
		}
		const { data, error } = await supabase
			.from('customers')
			.update(toCustomerDbPayload(updates))
			.eq('id', id)
			.select()
			.single();

		if (error) throw toAppError(error);
		return data as Customer;
	},

	async getLedgerSummary(customerId: UUID): Promise<CustomerLedgerSummary> {
		const { data, error } = await supabase
			.from('customer_ledger_summary')
			.select('*')
			.eq('customer_id', customerId)
			.single();

		if (error && error.code !== 'PGRST116') throw toAppError(error); // PGRST116 is 'no rows found'

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

		if (invoicesRes.error) throw toAppError(invoicesRes.error);
		if (paymentsRes.error) throw toAppError(paymentsRes.error);

		const entries: CustomerLedgerEntry[] = [
			...invoicesRes.data.map(
				(inv: {
					invoice_date: string;
					invoice_number: string;
					grand_total: number;
					notes: string | null;
				}) => ({
					date: inv.invoice_date,
					type: 'invoice' as const,
					reference: inv.invoice_number,
					debit: inv.grand_total,
					credit: 0,
					balance: 0, // Will calculate below
					notes: inv.notes ?? undefined,
				}),
			),
			...paymentsRes.data.map(
				(p: {
					payment_date: string;
					amount: number;
					payment_mode: string;
					direction: string;
					notes: string | null;
				}) => ({
					date: p.payment_date,
					type: 'payment' as const,
					reference: `Payment (${p.payment_mode.toUpperCase()})`,
					debit: 0,
					credit: p.amount,
					balance: 0, // Will calculate below
					notes: p.notes ?? undefined,
				}),
			),
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
		const { data, error } = await supabase.rpc('get_aging_report_v1', {
			p_customer_id: customerId || null,
		});

		if (error) throw toAppError(error);
		return data as AgingBucket[];
	},
};
