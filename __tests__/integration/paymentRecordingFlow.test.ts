import { paymentService } from '@/src/services/paymentService';
import { dashboardService } from '@/src/services/dashboardService';
import { invoiceService } from '@/src/services/invoiceService';
import { useInvoiceStore } from '@/src/stores/invoiceStore';
import { useDashboardStore } from '@/src/stores/dashboardStore'; // IMPORTED
import { waitFor } from '@testing-library/react-native';
import type { DashboardStats } from '@/src/types/finance';

// Mock only the Supabase network boundary (as per Phase 12 requirement)
jest.mock('@/src/config/supabase', () => {
	const { createSupabaseMock } = jest.requireActual('../utils/supabaseMock');
	return {
		supabase: createSupabaseMock(),
	};
});

import { supabase } from '@/src/config/supabase';
const mockSupabase = supabase as unknown as { rpc: jest.Mock };

describe('Payment Recording Flow Integration', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		if (useInvoiceStore.getState().reset) {
			useInvoiceStore.getState().reset();
		}
		// Ensure dashboard store is initialized
		useDashboardStore.getState();
	});

	it('completes the full call chain for payment recording and updates status', async () => {
		const paymentInput = {
			amount: 1000,
			payment_mode: 'cash' as const,
			direction: 'received' as const,
			payment_date: '2026-03-31',
			customer_id: 'b5b5b5b5-b5b5-4b5b-8b5b-b5b5b5b5b5b1',
			invoice_id: 'b5b5b5b5-b5b5-4b5b-8b5b-b5b5b5b5b5b4',
		};

		mockSupabase.rpc.mockResolvedValue({
			data: { id: 'b5b5b5b5-b5b5-4b5b-8b5b-b5b5b5b5b789', new_status: 'paid' },
			error: null,
		});

		const result = await paymentService.recordPayment(paymentInput);

		// 1. Verify RPC call
		expect(mockSupabase.rpc).toHaveBeenCalledWith(
			'record_payment_with_invoice_update_v1',
			expect.objectContaining({
				p_payment: expect.objectContaining({
					amount: 1000,
					invoice_id: 'b5b5b5b5-b5b5-4b5b-8b5b-b5b5b5b5b5b4',
				}),
			}),
		);

		// 2. Verify result
		expect(result.new_status).toBe('paid');
	});

	it('triggers cross-store refreshes after payment is recorded', async () => {
		const paymentInput = {
			amount: 500,
			payment_mode: 'upi' as const,
			direction: 'received' as const,
			payment_date: '2026-03-31',
			customer_id: 'b5b5b5b5-b5b5-4b5b-8b5b-b5b5b5b5b5b1',
			invoice_id: 'b5b5b5b5-b5b5-4b5b-8b5b-b5b5b5b5b5b4',
		};

		mockSupabase.rpc.mockResolvedValue({
			data: { id: 'b5b5b5b5-b5b5-4b5b-8b5b-b5b5b5b5b789', new_status: 'partial' },
			error: null,
		});

		// Spy on services that stores use to refresh
		const dashboardSpy = jest
			.spyOn(dashboardService, 'fetchDashboardStats')
			.mockResolvedValue({} as unknown as DashboardStats);
		const invoiceSpy = jest
			.spyOn(invoiceService, 'fetchInvoices')
			.mockResolvedValue({ data: [], count: 0 });

		await paymentService.recordPayment(paymentInput);

		// Verify refreshes triggered by PAYMENT_RECORDED event
		await waitFor(() => {
			expect(dashboardSpy).toHaveBeenCalled();
			expect(invoiceSpy).toHaveBeenCalled();
		});
	});

	it('prevents recording payment with both customer and supplier (schema validation)', async () => {
		const invalidInput = {
			amount: 1000,
			payment_mode: 'cash' as const,
			direction: 'received' as const,
			payment_date: '2026-03-31',
			customer_id: 'b5b5b5b5-b5b5-4b5b-8b5b-b5b5b5b5b5b1',
			supplier_id: 'b5b5b5b5-b5b5-4b5b-8b5b-b5b5b5b5b5b2', // Both present
		} as unknown as Parameters<typeof paymentService.recordPayment>[0];

		await expect(paymentService.recordPayment(invalidInput)).rejects.toThrow(
			'Validation failed',
		);

		expect(mockSupabase.rpc).not.toHaveBeenCalled();
	});
});
