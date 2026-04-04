import { useInvoiceStore } from '@/src/stores/invoiceStore';
import { supabase } from '@/src/config/supabase';
import { eventBus } from '@/src/events/appEvents';
import { createSupabaseMock } from '../utils/supabaseMock';

// 1. Mock supabase (prefixed with 'mock' to allow hoisting)
jest.mock('@/src/config/supabase', () => {
	const { createSupabaseMock } = jest.requireActual('../utils/supabaseMock');
	return {
		supabase: createSupabaseMock(),
	};
});

const mockSupabase = jest.requireMock('@/src/config/supabase').supabase;

describe('Invoice Creation Chain (Mocked DB)', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		useInvoiceStore.getState().reset();
	});

	it('completes the full chain from Store to Supabase RPC', async () => {
		// Setup mock response
		mockSupabase.rpc.mockResolvedValue({
			data: { id: 'inv-456', invoice_number: 'TM/2026-27/0001' },
			error: null,
		});

		// Spy on eventBus
		const emitSpy = jest.spyOn(eventBus, 'emit');

		// 2. Trigger
		const result = await useInvoiceStore.getState().createInvoice({
			customer_id: '11111111-1111-1111-1111-111111111111',
			customer_name: 'Test Customer',
			invoice_date: '2026-04-03',
			is_inter_state: false,
			payment_status: 'unpaid' as const,
			line_items: [
				{
					item_id: '00000000-0000-0000-0000-000000000000',
					design_name: 'Classic White',
					gst_rate: 18,
					quantity: 1,
					rate_per_unit: 1000,
				},
			] as any,
		});

		// 3. Assertions
		expect(result).toEqual({ id: 'inv-456', invoice_number: 'TM/2026-27/0001' });

		expect(mockSupabase.rpc).toHaveBeenCalledWith('create_invoice_with_items_v1', {
			p_invoice: expect.objectContaining({
				customer_id: '11111111-1111-1111-1111-111111111111',
				is_inter_state: false,
			}),
			p_line_items: expect.arrayContaining([
				expect.objectContaining({ design_name: 'Classic White', quantity: 1 }),
			]),
		});

		expect(emitSpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'INVOICE_CREATED' }));
		expect(useInvoiceStore.getState().loading).toBe(false);
	});

	it('handles errors in the chain and updates store state', async () => {
		mockSupabase.rpc.mockResolvedValue({
			data: null,
			error: { message: 'Database Error', code: 'PGRST123' },
		});

		await expect(
			useInvoiceStore.getState().createInvoice({
				customer_id: '11111111-1111-1111-1111-111111111111',
				customer_name: 'Test Customer',
				invoice_date: '2026-04-03',
				is_inter_state: false,
				payment_status: 'unpaid' as const,
				line_items: [
					{
						item_id: '00000000-0000-0000-0000-000000000000',
						design_name: 'Classic White',
						gst_rate: 18,
						quantity: 1,
						rate_per_unit: 1000,
					},
				],
			} as any),
		).rejects.toThrow('Database Error');

		expect(useInvoiceStore.getState().loading).toBe(false);
		expect(useInvoiceStore.getState().error).toBe('Database Error');
	});
});
