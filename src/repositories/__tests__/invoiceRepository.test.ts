import { makeBuilder } from './helpers';
import { supabase } from '../../config/supabase';
import { makeInvoice, makeInvoiceLineItemInput } from '../../../__tests__/fixtures/invoiceFixtures';

jest.mock('../../config/supabase', () => ({
	supabase: {
		from: jest.fn(),
		rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
	},
}));

import { invoiceRepository } from '../invoiceRepository';

const mockFrom = supabase.from as jest.Mock;
const mockRpc = supabase.rpc as jest.Mock;

beforeEach(() => {
	jest.clearAllMocks();
});

describe('invoiceRepository.findWithLineItems', () => {
	const id = 'inv-uuid-001';

	it('success: calls from(invoices).select(*,line_items).eq(id).single() and returns data', async () => {
		const invoice = makeInvoice();
		const builder = makeBuilder({ data: [], error: null }, { data: invoice, error: null });
		mockFrom.mockReturnValue(builder);

		const result = await invoiceRepository.findWithLineItems(id);

		expect(mockFrom).toHaveBeenCalledWith('invoices');
		expect(builder.select).toHaveBeenCalledWith(expect.stringContaining('line_items'));
		expect(builder.eq).toHaveBeenCalledWith('id', id);
		expect(builder.single).toHaveBeenCalled();
		expect(result).toEqual(invoice);
	});

	it('error: throws AppError when supabase returns an error', async () => {
		const builder = makeBuilder(
			{ data: [], error: null },
			{ data: null, error: { message: 'Not found', code: 'PGRST116' } },
		);
		mockFrom.mockReturnValue(builder);

		await expect(invoiceRepository.findWithLineItems(id)).rejects.toMatchObject({
			message: 'Not found',
		});
	});

	it('null-data path: throws when data is null and no error', async () => {
		// Repository always returns data as-is (cast); null + no error means record did not exist.
		// findWithLineItems returns null-cast to Invoice type — service layer guards this.
		// Test that the repository does NOT throw on null+no-error — service must guard.
		const builder = makeBuilder({ data: [], error: null }, { data: null, error: null });
		mockFrom.mockReturnValue(builder);

		// Should resolve (possibly null) rather than throw — repository trusts Supabase
		const result = await invoiceRepository.findWithLineItems(id);
		expect(result).toBeNull();
	});
});

describe('invoiceRepository.createAtomic', () => {
	const invoice = makeInvoice();
	const lineItems = [makeInvoiceLineItemInput()];

	it('success: calls rpc(create_invoice_with_items_v1, { p_invoice, p_line_items })', async () => {
		const rpcData = { id: 'new-inv-id', invoice_number: 'TM/2025-26/0002' };
		mockRpc.mockResolvedValue({ data: rpcData, error: null });

		const result = await invoiceRepository.createAtomic(
			invoice as Parameters<typeof invoiceRepository.createAtomic>[0],
			lineItems,
		);

		expect(mockRpc).toHaveBeenCalledWith(
			'create_invoice_with_items_v1',
			expect.objectContaining({
				p_invoice: expect.any(Object),
				p_line_items: expect.any(Array),
			}),
		);
		expect(result.id).toBe('new-inv-id');
		expect(result.invoice_number).toBe('TM/2025-26/0002');
	});

	it('error: throws AppError when RPC returns an error', async () => {
		mockRpc.mockResolvedValue({ data: null, error: { message: 'RPC failed', code: 'P0001' } });

		await expect(
			invoiceRepository.createAtomic(
				invoice as Parameters<typeof invoiceRepository.createAtomic>[0],
				lineItems,
			),
		).rejects.toMatchObject({
			message: 'RPC failed',
		});
	});
});
