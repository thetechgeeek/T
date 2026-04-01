import { customerService } from './customerService';
import { supabase } from '../config/supabase';
import { makeCustomer } from '../../__tests__/fixtures/customerFixtures';

// Mock the Supabase client
jest.mock('../config/supabase', () => ({
	supabase: {
		from: jest.fn(),
		rpc: jest.fn(),
	},
}));

/** Chainable + thenable builder for query-awaiting service methods. */
function makeListBuilder(
	result: {
		data: unknown[] | null;
		count: number | null;
		error: { message: string; code?: string } | null;
	} = { data: [], count: 0, error: null },
) {
	const b: Record<string, jest.Mock> = {};
	['select', 'insert', 'update', 'or', 'eq', 'gte', 'lte', 'ilike', 'order', 'range'].forEach(
		(m) => {
			b[m] = jest.fn().mockReturnValue(b);
		},
	);
	b.single = jest.fn().mockResolvedValue({ data: result.data?.[0] ?? null, error: result.error });
	b.then = jest.fn((resolve: (val: unknown) => void) => Promise.resolve(result).then(resolve));
	return b;
}

describe('customerService', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	// ─── createCustomer ──────────────────────────────────────────────────────
	describe('createCustomer', () => {
		it('throws on database errors', async () => {
			const builder = makeListBuilder();
			builder.single.mockResolvedValue({
				data: null,
				error: { code: 'PGRST205', message: "Could not find the table 'public.customers'" },
			});
			(supabase.from as jest.Mock).mockReturnValue(builder);

			await expect(
				customerService.createCustomer({ name: 'Test' } as Parameters<
					typeof customerService.createCustomer
				>[0]),
			).rejects.toMatchObject({ code: 'PGRST205' });
		});

		it('returns created customer on success', async () => {
			const customer = makeCustomer();
			const builder = makeListBuilder();
			builder.single.mockResolvedValue({ data: customer, error: null });
			(supabase.from as jest.Mock).mockReturnValue(builder);

			const result = await customerService.createCustomer({
				name: 'Test Customer',
			} as Parameters<typeof customerService.createCustomer>[0]);
			expect(result).toEqual(customer);
		});
	});

	// ─── fetchCustomers ───────────────────────────────────────────────────────
	describe('fetchCustomers', () => {
		it('returns data and count with default empty filters', async () => {
			const builder = makeListBuilder({ data: [], count: 0, error: null });
			(supabase.from as jest.Mock).mockReturnValue(builder);

			const result = await customerService.fetchCustomers({});

			expect(supabase.from).toHaveBeenCalledWith('customers');
			expect(result).toHaveProperty('data');
			expect(result).toHaveProperty('count');
		});

		it('applies OR ILIKE search when search is provided', async () => {
			const builder = makeListBuilder();
			(supabase.from as jest.Mock).mockReturnValue(builder);

			await customerService.fetchCustomers({ search: 'John' });

			expect(builder.or).toHaveBeenCalledWith(expect.stringContaining('%John%'));
		});

		it('applies type filter when type is not ALL', async () => {
			const builder = makeListBuilder();
			(supabase.from as jest.Mock).mockReturnValue(builder);

			await customerService.fetchCustomers({ type: 'retail' });

			expect(builder.eq).toHaveBeenCalledWith('type', 'retail');
		});

		it('does NOT apply type filter when type is ALL', async () => {
			const builder = makeListBuilder();
			(supabase.from as jest.Mock).mockReturnValue(builder);

			await customerService.fetchCustomers({ type: 'ALL' });

			const eqCalls = (builder.eq as jest.Mock).mock.calls;
			expect(eqCalls.find((c: unknown[]) => (c as string[])[0] === 'type')).toBeUndefined();
		});

		it('throws when supabase returns an error', async () => {
			const builder = makeListBuilder({
				data: null as unknown as unknown[],
				count: null as unknown as number,
				error: { message: 'DB error' },
			});
			(supabase.from as jest.Mock).mockReturnValue(builder);

			await expect(customerService.fetchCustomers({})).rejects.toBeDefined();
		});
	});

	// ─── updateCustomer ───────────────────────────────────────────────────────
	describe('updateCustomer', () => {
		it('calls update().eq(id) and returns updated customer', async () => {
			const updated = makeCustomer({ name: 'Updated Name' });
			const builder = makeListBuilder();
			builder.single.mockResolvedValue({ data: updated, error: null });
			(supabase.from as jest.Mock).mockReturnValue(builder);

			const result = await customerService.updateCustomer('cust-uuid-001', {
				name: 'Updated Name',
			});

			expect(builder.update).toHaveBeenCalledWith({ name: 'Updated Name' });
			expect(builder.eq).toHaveBeenCalledWith('id', 'cust-uuid-001');
			expect(result).toEqual(updated);
		});
	});

	// ─── fetchCustomerById ────────────────────────────────────────────────────
	describe('fetchCustomerById', () => {
		it('returns the customer when found', async () => {
			const customer = makeCustomer();
			const builder = makeListBuilder();
			builder.single.mockResolvedValue({ data: customer, error: null });
			(supabase.from as jest.Mock).mockReturnValue(builder);

			const result = await customerService.fetchCustomerById('cust-uuid-001');

			expect(supabase.from).toHaveBeenCalledWith('customers');
			expect(builder.eq).toHaveBeenCalledWith('id', 'cust-uuid-001');
			expect(result).toEqual(customer);
		});

		it('throws when supabase returns an error', async () => {
			const builder = makeListBuilder();
			builder.single.mockResolvedValue({ data: null, error: { message: 'Not found' } });
			(supabase.from as jest.Mock).mockReturnValue(builder);

			await expect(customerService.fetchCustomerById('bad-id')).rejects.toMatchObject({
				message: 'Not found',
			});
		});
	});

	// ─── getLedgerSummary ─────────────────────────────────────────────────────
	describe('getLedgerSummary', () => {
		it('returns summary data when found', async () => {
			const summary = {
				customer_id: 'cust-uuid-001',
				total_invoiced: 5000,
				total_paid: 2000,
				outstanding_balance: 3000,
			};
			const builder = makeListBuilder();
			builder.single.mockResolvedValue({ data: summary, error: null });
			(supabase.from as jest.Mock).mockReturnValue(builder);

			const result = await customerService.getLedgerSummary('cust-uuid-001');

			expect(supabase.from).toHaveBeenCalledWith('customer_ledger_summary');
			expect(result).toEqual(summary);
		});

		it('returns zero-balance summary when PGRST116 (no rows found)', async () => {
			const builder = makeListBuilder();
			builder.single.mockResolvedValue({
				data: null,
				error: { code: 'PGRST116', message: 'No rows' },
			});
			(supabase.from as jest.Mock).mockReturnValue(builder);

			const result = await customerService.getLedgerSummary('cust-uuid-001');

			expect(result).toEqual({
				customer_id: 'cust-uuid-001',
				total_invoiced: 0,
				total_paid: 0,
				outstanding_balance: 0,
			});
		});

		it('throws on non-PGRST116 errors', async () => {
			const builder = makeListBuilder();
			builder.single.mockResolvedValue({
				data: null,
				error: { code: 'P0001', message: 'DB error' },
			});
			(supabase.from as jest.Mock).mockReturnValue(builder);

			await expect(customerService.getLedgerSummary('cust-uuid-001')).rejects.toMatchObject({
				message: 'DB error',
			});
		});
	});

	// ─── fetchLedgerEntries ───────────────────────────────────────────────────
	describe('fetchLedgerEntries', () => {
		it('returns merged ledger entries sorted newest-first', async () => {
			const invoicesBuilder = makeListBuilder({
				data: [
					{
						invoice_date: '2026-01-10',
						invoice_number: 'INV-001',
						grand_total: 1000,
						notes: null,
					},
				],
				count: 1,
				error: null,
			});
			const paymentsBuilder = makeListBuilder({
				data: [
					{
						payment_date: '2026-01-15',
						amount: 500,
						payment_mode: 'cash',
						direction: 'received',
						notes: null,
					},
				],
				count: 1,
				error: null,
			});

			(supabase.from as jest.Mock)
				.mockReturnValueOnce(invoicesBuilder)
				.mockReturnValueOnce(paymentsBuilder);

			const result = await customerService.fetchLedgerEntries('cust-uuid-001');

			expect(result).toHaveLength(2);
			expect(result[0].type).toBe('payment'); // newer date first after reverse
			expect(result[1].type).toBe('invoice');
		});

		it('converts null notes to undefined', async () => {
			const invoicesBuilder = makeListBuilder({
				data: [
					{
						invoice_date: '2026-01-10',
						invoice_number: 'INV-001',
						grand_total: 500,
						notes: null,
					},
				],
				count: 1,
				error: null,
			});
			const paymentsBuilder = makeListBuilder({ data: [], count: 0, error: null });

			(supabase.from as jest.Mock)
				.mockReturnValueOnce(invoicesBuilder)
				.mockReturnValueOnce(paymentsBuilder);

			const result = await customerService.fetchLedgerEntries('cust-uuid-001');
			expect(result[0].notes).toBeUndefined();
		});

		it('throws when invoices query fails', async () => {
			const invoicesBuilder = makeListBuilder({
				data: null as unknown as unknown[],
				count: null,
				error: { message: 'Invoices error' },
			});
			const paymentsBuilder = makeListBuilder({ data: [], count: 0, error: null });

			(supabase.from as jest.Mock)
				.mockReturnValueOnce(invoicesBuilder)
				.mockReturnValueOnce(paymentsBuilder);

			await expect(customerService.fetchLedgerEntries('cust-uuid-001')).rejects.toMatchObject(
				{
					message: 'Invoices error',
				},
			);
		});

		it('calculates running balance correctly', async () => {
			const invoicesBuilder = makeListBuilder({
				data: [
					{
						invoice_date: '2026-01-05',
						invoice_number: 'INV-001',
						grand_total: 1000,
						notes: null,
					},
				],
				count: 1,
				error: null,
			});
			const paymentsBuilder = makeListBuilder({
				data: [
					{
						payment_date: '2026-01-10',
						amount: 400,
						payment_mode: 'upi',
						direction: 'received',
						notes: null,
					},
				],
				count: 1,
				error: null,
			});

			(supabase.from as jest.Mock)
				.mockReturnValueOnce(invoicesBuilder)
				.mockReturnValueOnce(paymentsBuilder);

			const result = await customerService.fetchLedgerEntries('cust-uuid-001');
			// After reverse: payment first (600 balance), invoice second (1000 balance)
			// The running balance pre-reverse: invoice=1000, payment=600; reversed: payment=600 first
			expect(result.find((e) => e.type === 'invoice')?.debit).toBe(1000);
			expect(result.find((e) => e.type === 'payment')?.credit).toBe(400);
		});
	});

	// ─── getAgingReport ───────────────────────────────────────────────────────
	describe('getAgingReport', () => {
		it('calls rpc without customerId when not provided', async () => {
			(supabase.rpc as jest.Mock).mockResolvedValue({ data: [], error: null });

			const result = await customerService.getAgingReport();

			expect(supabase.rpc).toHaveBeenCalledWith('get_aging_report_v1', {
				p_customer_id: null,
			});
			expect(result).toEqual([]);
		});

		it('calls rpc with p_customer_id when customerId provided', async () => {
			const aging = [{ customer_id: 'cust-uuid-001', total_outstanding: 3000 }];
			(supabase.rpc as jest.Mock).mockResolvedValue({ data: aging, error: null });

			const result = await customerService.getAgingReport('cust-uuid-001');

			expect(supabase.rpc).toHaveBeenCalledWith('get_aging_report_v1', {
				p_customer_id: 'cust-uuid-001',
			});
			expect(result).toEqual(aging);
		});

		it('throws on rpc error', async () => {
			(supabase.rpc as jest.Mock).mockResolvedValue({
				data: null,
				error: { message: 'RPC failed' },
			});

			await expect(customerService.getAgingReport()).rejects.toMatchObject({
				message: 'RPC failed',
			});
		});
	});
});
