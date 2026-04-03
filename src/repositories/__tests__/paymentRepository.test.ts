import { makeBuilder } from './helpers';
import { supabase } from '../../config/supabase';
import { makePaymentInput } from '../../../__tests__/fixtures/paymentFixtures';

jest.mock('../../config/supabase', () => ({
	supabase: {
		from: jest.fn(),
		rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
	},
}));

import { paymentRepository } from '../paymentRepository';

const mockFrom = supabase.from as jest.Mock;
const mockRpc = supabase.rpc as jest.Mock;

beforeEach(() => {
	jest.clearAllMocks();
});

// ─── recordWithInvoiceUpdate ──────────────────────────────────────────────────
describe('paymentRepository.recordWithInvoiceUpdate', () => {
	const input = makePaymentInput();

	it('calls rpc(record_payment_with_invoice_update_v1, { p_payment })', async () => {
		const rpcData = { id: 'pay-uuid-001', new_status: 'paid' };
		mockRpc.mockResolvedValue({ data: rpcData, error: null });

		const result = await paymentRepository.recordWithInvoiceUpdate(
			input as Parameters<typeof paymentRepository.recordWithInvoiceUpdate>[0],
		);

		expect(mockRpc).toHaveBeenCalledWith(
			'record_payment_with_invoice_update_v1',
			expect.objectContaining({ p_payment: input }),
		);
		expect(result.id).toBe('pay-uuid-001');
		expect(result.new_status).toBe('paid');
	});

	it('throws AppError when RPC returns an error', async () => {
		mockRpc.mockResolvedValue({ data: null, error: { message: 'RPC failed', code: 'P0001' } });

		await expect(
			paymentRepository.recordWithInvoiceUpdate(
				input as Parameters<typeof paymentRepository.recordWithInvoiceUpdate>[0],
			),
		).rejects.toThrow('RPC failed');
	});

	it('uses RPC_ERROR code when error.code is missing', async () => {
		mockRpc.mockResolvedValue({ data: null, error: { message: 'no code' } });

		await expect(
			paymentRepository.recordWithInvoiceUpdate(
				input as Parameters<typeof paymentRepository.recordWithInvoiceUpdate>[0],
			),
		).rejects.toMatchObject({ code: 'UNKNOWN' });
	});
});

// ─── fetchPayments ────────────────────────────────────────────────────────────
describe('paymentRepository.fetchPayments', () => {
	it('queries payments with customer/supplier join when no filters provided', async () => {
		const builder = makeBuilder({ data: [], count: 0, error: null });
		mockFrom.mockReturnValue(builder);

		const result = await paymentRepository.fetchPayments({});

		expect(mockFrom).toHaveBeenCalledWith('payments');
		expect(builder.select).toHaveBeenCalledWith(
			expect.stringContaining('customer:customers(name)'),
		);
		expect(result).toEqual([]);
	});

	it('applies eq(customer_id) when customer_id filter is provided', async () => {
		const builder = makeBuilder({ data: [], count: 0, error: null });
		mockFrom.mockReturnValue(builder);

		await paymentRepository.fetchPayments({ customer_id: 'cust-001' });

		expect(builder.eq).toHaveBeenCalledWith('customer_id', 'cust-001');
	});

	it('applies eq(supplier_id) when supplier_id filter is provided', async () => {
		const builder = makeBuilder({ data: [], count: 0, error: null });
		mockFrom.mockReturnValue(builder);

		await paymentRepository.fetchPayments({ supplier_id: 'sup-001' });

		expect(builder.eq).toHaveBeenCalledWith('supplier_id', 'sup-001');
	});

	it('applies gte(payment_date) when dateFrom filter is provided', async () => {
		const builder = makeBuilder({ data: [], count: 0, error: null });
		mockFrom.mockReturnValue(builder);

		await paymentRepository.fetchPayments({ dateFrom: '2026-01-01' });

		expect(builder.gte).toHaveBeenCalledWith('payment_date', '2026-01-01');
	});

	it('applies lte(payment_date) when dateTo filter is provided', async () => {
		const builder = makeBuilder({ data: [], count: 0, error: null });
		mockFrom.mockReturnValue(builder);

		await paymentRepository.fetchPayments({ dateTo: '2026-03-31' });

		expect(builder.lte).toHaveBeenCalledWith('payment_date', '2026-03-31');
	});

	it('applies all filters simultaneously', async () => {
		const builder = makeBuilder({ data: [], count: 0, error: null });
		mockFrom.mockReturnValue(builder);

		await paymentRepository.fetchPayments({
			customer_id: 'cust-001',
			dateFrom: '2026-01-01',
			dateTo: '2026-03-31',
		});

		expect(builder.eq).toHaveBeenCalledWith('customer_id', 'cust-001');
		expect(builder.gte).toHaveBeenCalledWith('payment_date', '2026-01-01');
		expect(builder.lte).toHaveBeenCalledWith('payment_date', '2026-03-31');
	});

	it('throws when supabase returns an error', async () => {
		const builder = makeBuilder({
			data: null as unknown as [],
			count: null,
			error: { message: 'DB error' },
		});
		mockFrom.mockReturnValue(builder);

		await expect(paymentRepository.fetchPayments({})).rejects.toThrow('DB error');
	});
});

// ─── findMany (base integration) ─────────────────────────────────────────────
describe('paymentRepository.findMany (base)', () => {
	it('queries the payments table with no eq when no filters', async () => {
		const builder = makeBuilder({ data: [], count: 0, error: null });
		mockFrom.mockReturnValue(builder);

		const result = await paymentRepository.findMany({});

		expect(mockFrom).toHaveBeenCalledWith('payments');
		expect(result.data).toEqual([]);
	});
});
