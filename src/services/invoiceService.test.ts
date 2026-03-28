import { invoiceService } from '@/src/services/invoiceService';
import { supabase } from '../config/supabase';

// Mock query object
const mockQuery: any = {
	select: jest.fn().mockReturnThis(),
	insert: jest.fn().mockReturnThis(),
	update: jest.fn().mockReturnThis(),
	eq: jest.fn().mockReturnThis(),
	single: jest.fn().mockReturnThis(),
	order: jest.fn().mockReturnThis(),
	range: jest.fn().mockReturnThis(),
	then: jest.fn((resolve) => resolve({ data: [], error: null })),
};

jest.mock('../config/supabase', () => ({
	supabase: {
		from: jest.fn(() => mockQuery),
		rpc: jest.fn(),
	},
}));

describe('invoiceService', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockQuery.then.mockImplementation((resolve: any) => resolve({ data: [], error: null }));
	});

	describe('createInvoice', () => {
		it('successfully saves invoice, links items, and deducts stock', async () => {
			const mockInvoiceId = 'inv-123';
			const mockInvoiceNum = 'TM/2026-27/0001';

			// Mock generate_invoice_number RPC
			(supabase.rpc as jest.Mock).mockImplementation((name) => {
				if (name === 'generate_invoice_number')
					return Promise.resolve({ data: mockInvoiceNum, error: null });
				if (name === 'perform_stock_operation')
					return Promise.resolve({ data: 10, error: null });
				return Promise.resolve({ data: null, error: null });
			});

			// Mock invoice insert
			mockQuery.then.mockImplementationOnce((resolve: any) =>
				resolve({
					data: { id: mockInvoiceId, invoice_number: mockInvoiceNum },
					error: null,
				}),
			);

			const mockInput = {
				customer_id: 'cust-1',
				customer_name: 'John Doe',
				is_inter_state: false,
				line_items: [
					{
						item_id: 'item-1',
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
			expect(supabase.from).toHaveBeenCalledWith('invoices');
			expect(supabase.from).toHaveBeenCalledWith('invoice_line_items');

			// Verify stock deduction RPC
			expect(supabase.rpc).toHaveBeenCalledWith(
				'perform_stock_operation',
				expect.objectContaining({
					p_item_id: 'item-1',
					p_operation_type: 'stock_out',
					p_quantity_change: -10,
					p_reference_type: 'invoice',
					p_reference_id: mockInvoiceId,
				}),
			);
		});
	});
});
