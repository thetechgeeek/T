import { invoiceService } from '@/src/services/invoiceService';
import { supabase } from '../config/supabase';

jest.mock('../config/supabase', () => ({
	supabase: {
		from: jest.fn(),
		rpc: jest.fn(),
	},
}));

describe('invoiceService', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('createInvoice', () => {
		it('successfully creates invoice via create_invoice_with_items RPC', async () => {
			const mockInvoiceId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
			const mockInvoiceNum = 'TM/2026-27/0001';
			const itemId = '123e4567-e89b-12d3-a456-426614174000';

			(supabase.rpc as jest.Mock).mockResolvedValue({
				data: { id: mockInvoiceId, invoice_number: mockInvoiceNum },
				error: null,
			});

			const mockInput = {
				customer_name: 'John Doe',
				is_inter_state: false,
				invoice_date: '2026-03-28',
				payment_status: 'paid' as const,
				line_items: [
					{
						item_id: itemId,
						design_name: 'Glossy White',
						quantity: 10,
						rate_per_unit: 100,
						gst_rate: 18,
					},
				],
				amount_paid: 1180,
			};

			const result = await invoiceService.createInvoice(mockInput as any);

			expect(result.invoice_number).toBe(mockInvoiceNum);
			expect(result.id).toBe(mockInvoiceId);
			expect(supabase.rpc).toHaveBeenCalledWith(
				'create_invoice_with_items_v1',
				expect.objectContaining({
					p_invoice: expect.objectContaining({
						customer_name: 'John Doe',
						is_inter_state: false,
						payment_status: 'paid',
					}),
					p_line_items: expect.arrayContaining([
						expect.objectContaining({
							item_id: itemId,
							design_name: 'Glossy White',
							quantity: 10,
						}),
					]),
				}),
			);
		});

		it('throws ValidationError for invalid input', async () => {
			const { ValidationError } = require('../errors/AppError');
			await expect(
				invoiceService.createInvoice({
					customer_name: '',
					is_inter_state: false,
					invoice_date: 'bad-date',
					payment_status: 'paid',
					line_items: [],
					amount_paid: 0,
				} as any),
			).rejects.toBeInstanceOf(ValidationError);
		});
	});
});
