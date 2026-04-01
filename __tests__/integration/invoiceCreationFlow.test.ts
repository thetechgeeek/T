import { useInvoiceStore } from '@/src/stores/invoiceStore';
import { useDashboardStore } from '@/src/stores/dashboardStore'; // IMPORTED
import { makeInvoiceInput } from '../fixtures/invoiceFixtures';
import { dashboardService } from '@/src/services/dashboardService';
import { waitFor } from '@testing-library/react-native';

// Mock Supabase with the shared builder
jest.mock('@/src/config/supabase', () => {
	const { createSupabaseMock } = jest.requireActual('../utils/supabaseMock');
	return {
		supabase: createSupabaseMock(),
	};
});

import { supabase } from '@/src/config/supabase';
const mockSupabase = supabase as unknown as { rpc: jest.Mock };

// Mock routing
jest.mock('expo-router', () => ({
	useRouter: () => ({
		replace: jest.fn(),
	}),
}));

describe('Invoice Creation Flow Integration', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		useInvoiceStore.getState().reset();
		useDashboardStore.getState(); // Initialize
	});

	it('completes the full call chain Store -> Service -> Repository -> Supabase RPC', async () => {
		const invoiceInput = makeInvoiceInput();
		mockSupabase.rpc.mockResolvedValue({
			data: { id: 'b5b5b5b5-b5b5-4b5b-8b5b-b5b5b5b5b5b4', invoice_number: 'TM/2026-27/0001' },
			error: null,
		});

		const result = await useInvoiceStore.getState().createInvoice(invoiceInput);

		// 1. Check Store result
		expect(result.id).toBe('b5b5b5b5-b5b5-4b5b-8b5b-b5b5b5b5b5b4');

		// 2. Verify Repository/Service layer passed correct params to Supabase RPC
		expect(mockSupabase.rpc).toHaveBeenCalledWith(
			'create_invoice_with_items_v1',
			expect.objectContaining({
				p_invoice: expect.objectContaining({
					customer_name: invoiceInput.customer_name,
				}),
			}),
		);
	});

	it('triggers dashboard refresh via eventBus after successful creation', async () => {
		const invoiceInput = makeInvoiceInput();
		mockSupabase.rpc.mockResolvedValue({
			data: { id: 'b5b5b5b5-b5b5-4b5b-8b5b-b5b5b5b5b5b4', invoice_number: 'TM/2026-27/0001' },
			error: null,
		});

		const dashboardSpy = jest.spyOn(dashboardService, 'fetchDashboardStats');
		dashboardSpy.mockResolvedValue({
			today_sales: 100,
			today_invoice_count: 1,
			total_outstanding_credit: 50,
			total_outstanding_customers: 2,
			low_stock_count: 5,
			monthly_revenue: 1000,
		});

		await useInvoiceStore.getState().createInvoice(invoiceInput);

		// Allow async event handler to fire
		await waitFor(() => {
			expect(dashboardSpy).toHaveBeenCalled();
		});
	});

	it('propagates domain validation errors without calling Supabase', async () => {
		const invalidInput = makeInvoiceInput({ customer_name: '' });

		await expect(useInvoiceStore.getState().createInvoice(invalidInput)).rejects.toThrow();

		expect(mockSupabase.rpc).not.toHaveBeenCalled();
	});
});
