import { invoiceService } from '@/src/services/invoiceService';
import { supabase } from '../config/supabase';
import { ValidationError } from '../errors/AppError';

jest.mock('../config/supabase', () => ({
	supabase: {
		from: jest.fn(),
		rpc: jest.fn(),
	},
}));

/** Chainable + thenable builder for fetchInvoices tests (`await query` pattern). */
function makeListBuilder(
	result: {
		data: unknown[] | null;
		count: number | null;
		error: { message: string; code?: string } | null;
	} = {
		data: [],
		count: 0,
		error: null,
	},
) {
	const b: Record<string, jest.Mock> = {};
	[
		'select',
		'or',
		'eq',
		'gte',
		'lte',
		'order',
		'range',
		'single',
		'insert',
		'update',
		'delete',
	].forEach((m) => {
		b[m] = jest.fn().mockReturnValue(b);
	});
	b.then = jest.fn((resolve: (val: unknown) => void) => Promise.resolve(result).then(resolve));
	return b;
}

describe('invoiceService', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		// Set up default fluent builder for from() calls
		const builder = makeListBuilder();
		(supabase.from as jest.Mock).mockReturnValue(builder);
		(supabase.rpc as jest.Mock).mockResolvedValue({ data: null, error: null });
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

			const builder = makeListBuilder({
				data: { id: mockInvoiceId, invoice_number: mockInvoiceNum } as any,
				count: 1,
				error: null,
			});
			(supabase.from as jest.Mock).mockReturnValue(builder);

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

			const result = await invoiceService.createInvoice(
				mockInput as Parameters<typeof invoiceService.createInvoice>[0],
			);

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
			await expect(
				invoiceService.createInvoice({
					customer_name: '',
					is_inter_state: false,
					invoice_date: 'bad-date',
					payment_status: 'paid',
					line_items: [],
					amount_paid: 0,
				} as Parameters<typeof invoiceService.createInvoice>[0]),
			).rejects.toBeInstanceOf(ValidationError);
		});

		it('full payload: p_invoice includes place_of_supply, reverse_charge, cgst_total, sgst_total, igst_total, grand_total', async () => {
			(supabase.rpc as jest.Mock).mockResolvedValue({
				data: { id: 'inv-001', invoice_number: 'TM/2026-27/0001' },
				error: null,
			});
			const itemId = '123e4567-e89b-12d3-a456-426614174000';
			await invoiceService.createInvoice({
				customer_name: 'John',
				is_inter_state: false,
				invoice_date: '2026-03-28',
				place_of_supply: '27',
				reverse_charge: true,
				payment_status: 'unpaid',
				payment_mode: 'cash',
				notes: 'test',
				line_items: [
					{
						item_id: itemId,
						design_name: 'X',
						quantity: 1,
						rate_per_unit: 1000,
						gst_rate: 18,
						discount: 0,
					},
				],
				amount_paid: 0,
			} as Parameters<typeof invoiceService.createInvoice>[0]);
			expect(supabase.rpc).toHaveBeenCalledWith(
				'create_invoice_with_items_v1',
				expect.objectContaining({
					p_invoice: expect.objectContaining({
						place_of_supply: '27',
						reverse_charge: true,
						payment_mode: 'cash',
						notes: 'test',
						cgst_total: expect.any(Number),
						sgst_total: expect.any(Number),
						igst_total: expect.any(Number),
						grand_total: expect.any(Number),
					}),
				}),
			);
		});

		it('line item payload includes cgst_amount, sgst_amount, igst_amount, taxable_amount, line_total, sort_order', async () => {
			(supabase.rpc as jest.Mock).mockResolvedValue({
				data: { id: 'inv-001', invoice_number: 'TM/2026-27/0001' },
				error: null,
			});
			const itemId = '123e4567-e89b-12d3-a456-426614174000';
			await invoiceService.createInvoice({
				customer_name: 'John',
				is_inter_state: false,
				invoice_date: '2026-03-28',
				payment_status: 'unpaid',
				line_items: [
					{
						item_id: itemId,
						design_name: 'X',
						quantity: 1,
						rate_per_unit: 1000,
						gst_rate: 18,
						discount: 0,
					},
				],
				amount_paid: 0,
			} as Parameters<typeof invoiceService.createInvoice>[0]);
			expect(supabase.rpc).toHaveBeenCalledWith(
				'create_invoice_with_items_v1',
				expect.objectContaining({
					p_line_items: expect.arrayContaining([
						expect.objectContaining({
							cgst_amount: expect.any(Number),
							sgst_amount: expect.any(Number),
							igst_amount: expect.any(Number),
							taxable_amount: expect.any(Number),
							line_total: expect.any(Number),
							sort_order: 0,
						}),
					]),
				}),
			);
		});

		it('no discount provided: p_line_items[0].discount is 0', async () => {
			(supabase.rpc as jest.Mock).mockResolvedValue({
				data: { id: 'inv-001', invoice_number: 'TM/2026-27/0001' },
				error: null,
			});
			const itemId = '123e4567-e89b-12d3-a456-426614174000';
			await invoiceService.createInvoice({
				customer_name: 'John',
				is_inter_state: false,
				invoice_date: '2026-03-28',
				payment_status: 'unpaid',
				line_items: [
					{
						item_id: itemId,
						design_name: 'X',
						quantity: 1,
						rate_per_unit: 500,
						gst_rate: 18,
					},
				],
				amount_paid: 0,
			} as Parameters<typeof invoiceService.createInvoice>[0]);
			const rpcArgs = (supabase.rpc as jest.Mock).mock.calls[0][1];
			expect(rpcArgs.p_line_items[0].discount).toBe(0);
		});

		it('throws ConflictError when RPC returns 23505 (unique violation)', async () => {
			(supabase.rpc as jest.Mock).mockResolvedValue({
				data: null,
				error: { message: 'Already exists', code: '23505' },
			});
			await expect(
				invoiceService.createInvoice({
					customer_name: 'John',
					is_inter_state: false,
					invoice_date: '2026-03-28',
					payment_status: 'unpaid',
					line_items: [
						{
							item_id: '123e4567-e89b-12d3-a456-426614174000',
							design_name: 'X',
							quantity: 1,
							rate_per_unit: 500,
							gst_rate: 18,
						},
					],
					amount_paid: 0,
				} as Parameters<typeof invoiceService.createInvoice>[0]),
			).rejects.toMatchObject({ code: 'CONFLICT' });
		});

		it('throws AppError with INSUFFICIENT_STOCK when RPC returns stock error message', async () => {
			(supabase.rpc as jest.Mock).mockResolvedValue({
				data: null,
				error: { message: 'Insufficient stock for item', code: 'P0001' },
			});
			await expect(
				invoiceService.createInvoice({
					customer_name: 'John',
					is_inter_state: false,
					invoice_date: '2026-03-28',
					payment_status: 'unpaid',
					line_items: [
						{
							item_id: '123e4567-e89b-12d3-a456-426614174000',
							design_name: 'X',
							quantity: 1,
							rate_per_unit: 500,
							gst_rate: 18,
						},
					],
					amount_paid: 0,
				} as Parameters<typeof invoiceService.createInvoice>[0]),
			).rejects.toMatchObject({ code: 'INSUFFICIENT_STOCK' });
		});
	});

	describe('fetchInvoices', () => {
		it('default call: from(invoices), select with customer join, order by created_at desc, range(0, 19)', async () => {
			const builder = makeListBuilder();
			(supabase.from as jest.Mock).mockReturnValue(builder);

			await invoiceService.fetchInvoices({});

			expect(supabase.from).toHaveBeenCalledWith('invoices');
			expect(builder.select).toHaveBeenCalledWith(
				expect.stringContaining('customer'),
				expect.any(Object),
			);
			expect(builder.order).toHaveBeenCalledWith('created_at', { ascending: false });
			expect(builder.range).toHaveBeenCalledWith(0, 19);
		});

		it('search filter: .or() called with pattern containing invoice_number and customer_name', async () => {
			const builder = makeListBuilder();
			(supabase.from as jest.Mock).mockReturnValue(builder);

			await invoiceService.fetchInvoices({ search: 'marble' });

			expect(builder.or).toHaveBeenCalledWith(
				expect.stringMatching(
					/invoice_number.*marble.*customer_name|customer_name.*marble.*invoice_number/,
				),
			);
		});

		it('SQL injection: % in search term is escaped to \\%', async () => {
			const builder = makeListBuilder();
			(supabase.from as jest.Mock).mockReturnValue(builder);

			await invoiceService.fetchInvoices({ search: 'mar%ble' });

			const orArg = (builder.or as jest.Mock).mock.calls[0][0] as string;
			expect(orArg).toContain('\\%');
		});

		it('SQL injection: _ in search term is escaped to \\_', async () => {
			const builder = makeListBuilder();
			(supabase.from as jest.Mock).mockReturnValue(builder);

			await invoiceService.fetchInvoices({ search: 'mar_ble' });

			const orArg = (builder.or as jest.Mock).mock.calls[0][0] as string;
			expect(orArg).toContain('\\_');
		});

		it('payment_status filter: .eq("payment_status", "paid") is called', async () => {
			const builder = makeListBuilder();
			(supabase.from as jest.Mock).mockReturnValue(builder);

			await invoiceService.fetchInvoices({ payment_status: 'paid' });

			expect(builder.eq).toHaveBeenCalledWith('payment_status', 'paid');
		});

		it('payment_status = "ALL": .eq is NOT called with "payment_status"', async () => {
			const builder = makeListBuilder();
			(supabase.from as jest.Mock).mockReturnValue(builder);

			await invoiceService.fetchInvoices({ payment_status: 'ALL' });

			const eqCalls = (builder.eq as jest.Mock).mock.calls;
			expect(
				eqCalls.find((c: unknown[]) => (c as string[])[0] === 'payment_status'),
			).toBeUndefined();
		});

		it('date filters: .gte(invoice_date) and .lte(invoice_date) are called', async () => {
			const builder = makeListBuilder();
			(supabase.from as jest.Mock).mockReturnValue(builder);

			await invoiceService.fetchInvoices({ dateFrom: '2026-01-01', dateTo: '2026-03-31' });

			expect(builder.gte).toHaveBeenCalledWith('invoice_date', '2026-01-01');
			expect(builder.lte).toHaveBeenCalledWith('invoice_date', '2026-03-31');
		});

		it('pagination: page=3, limit=10 → range(20, 29)', async () => {
			const builder = makeListBuilder();
			(supabase.from as jest.Mock).mockReturnValue(builder);

			await invoiceService.fetchInvoices({}, 3, 10);

			expect(builder.range).toHaveBeenCalledWith(20, 29);
		});

		it('sort: sortBy=invoice_date, sortDir=asc → order("invoice_date", { ascending: true })', async () => {
			const builder = makeListBuilder();
			(supabase.from as jest.Mock).mockReturnValue(builder);

			await invoiceService.fetchInvoices({ sortBy: 'invoice_date', sortDir: 'asc' });

			expect(builder.order).toHaveBeenCalledWith('invoice_date', { ascending: true });
		});

		it('combined filters: search, status, and dates simultaneously', async () => {
			const builder = makeListBuilder();
			(supabase.from as jest.Mock).mockReturnValue(builder);

			await invoiceService.fetchInvoices({
				search: 'marble',
				payment_status: 'unpaid',
				dateFrom: '2026-01-01',
				dateTo: '2026-01-31',
			});

			expect(builder.or).toHaveBeenCalledWith(expect.stringContaining('marble'));
			expect(builder.eq).toHaveBeenCalledWith('payment_status', 'unpaid');
			expect(builder.gte).toHaveBeenCalledWith('invoice_date', '2026-01-01');
			expect(builder.lte).toHaveBeenCalledWith('invoice_date', '2026-01-31');
		});

		it('customer_id filter: .eq("customer_id", uuid) is called', async () => {
			const builder = makeListBuilder();
			const customerId = 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
			(supabase.from as jest.Mock).mockReturnValue(builder);

			await invoiceService.fetchInvoices({ customer_id: customerId });

			expect(builder.eq).toHaveBeenCalledWith('customer_id', customerId);
		});

		it('throws NotFoundError when supabase returns PGRST116 (no rows found)', async () => {
			const builder = makeListBuilder({
				data: null as any,
				count: null as any,
				error: { message: 'Not found', code: 'PGRST116' },
			});
			(supabase.from as jest.Mock).mockReturnValue(builder);

			await expect(invoiceService.fetchInvoices({})).rejects.toThrow(
				'Record with id "requested" not found',
			);
		});

		it('throws generic AppError for other Supabase errors', async () => {
			const builder = makeListBuilder({
				data: null as any,
				count: null as any,
				error: { message: 'Database is down', code: 'PGRST000' },
			});
			(supabase.from as jest.Mock).mockReturnValue(builder);

			await expect(invoiceService.fetchInvoices({})).rejects.toMatchObject({
				message: 'Database is down',
				code: 'PGRST000',
			});
		});
	});

	describe('fetchInvoiceDetail', () => {
		it('delegates to repo.findWithLineItems with the given id', async () => {
			const invoiceWithItems = { id: 'inv-001', invoice_number: 'TM/001' };
			// fetchInvoiceDetail calls repo.findWithLineItems → invoiceRepository.findWithLineItems
			// which calls supabase.from('invoices').select(...).eq(...).single()
			const builder: Record<string, jest.Mock> = {};
			['select', 'eq', 'single'].forEach((m) => {
				builder[m] = jest.fn().mockReturnValue(builder);
			});
			builder.single.mockResolvedValue({ data: invoiceWithItems, error: null });
			(supabase.from as jest.Mock).mockReturnValue(builder);

			const result = await invoiceService.fetchInvoiceDetail('inv-001');

			expect(supabase.from).toHaveBeenCalledWith('invoices');
			expect(builder.eq).toHaveBeenCalledWith('id', 'inv-001');
			expect(result).toEqual(invoiceWithItems);
		});
	});
});
