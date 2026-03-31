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

describe('paymentRepository.recordWithInvoiceUpdate', () => {
	const input = makePaymentInput();

	it('calls rpc(record_payment_with_invoice_update_v1, { p_payment })', async () => {
		const rpcData = { id: 'pay-uuid-001', new_status: 'paid' };
		mockRpc.mockResolvedValue({ data: rpcData, error: null });

		const result = await paymentRepository.recordWithInvoiceUpdate(input as any);

		expect(mockRpc).toHaveBeenCalledWith(
			'record_payment_with_invoice_update_v1',
			expect.objectContaining({ p_payment: input }),
		);
		expect(result.id).toBe('pay-uuid-001');
		expect(result.new_status).toBe('paid');
	});

	it('throws AppError when RPC returns an error', async () => {
		mockRpc.mockResolvedValue({ data: null, error: { message: 'RPC failed', code: 'P0001' } });

		await expect(paymentRepository.recordWithInvoiceUpdate(input as any)).rejects.toMatchObject({
			message: 'RPC failed',
		});
	});
});

describe('paymentRepository.findMany (base) — payment fetch', () => {
	it('queries the payments table with no eq when no filters', async () => {
		const builder = makeBuilder({ data: [], count: 0, error: null });
		mockFrom.mockReturnValue(builder);

		const result = await paymentRepository.findMany({});

		expect(mockFrom).toHaveBeenCalledWith('payments');
		expect(result.data).toEqual([]);
	});

	it('applies eq(customer_id) when customer_id filter is set', async () => {
		const builder = makeBuilder({ data: [], count: 0, error: null });
		mockFrom.mockReturnValue(builder);

		await paymentRepository.findMany({ filters: { customer_id: 'cust-001' } });

		expect(builder.eq).toHaveBeenCalledWith('customer_id', 'cust-001');
	});

	it('applies gte + lte when date range filter is set', async () => {
		const builder = makeBuilder({ data: [], count: 0, error: null });
		mockFrom.mockReturnValue(builder);

		await paymentRepository.findMany({
			filters: { payment_date: { gte: '2026-01-01', lte: '2026-03-31' } },
		});

		expect(builder.gte).toHaveBeenCalledWith('payment_date', '2026-01-01');
		expect(builder.lte).toHaveBeenCalledWith('payment_date', '2026-03-31');
	});
});
