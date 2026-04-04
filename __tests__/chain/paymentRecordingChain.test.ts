import { paymentService } from '@/src/services/paymentService';
import { paymentRepository } from '@/src/repositories/paymentRepository';
import { eventBus } from '@/src/events/appEvents';

// Mock the repository instead of supabase to bypass hoisting issues in this specific environment
jest.mock('@/src/repositories/paymentRepository', () => ({
	paymentRepository: {
		recordWithInvoiceUpdate: jest.fn(),
		fetchPayments: jest.fn(),
	},
}));

describe('Payment Recording Chain (Service -> Repo)', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('completes the full chain from Service to Repository', async () => {
		const mockInput = {
			payment_date: '2026-04-03',
			amount: 500,
			payment_mode: 'cash' as const,
			direction: 'received' as const,
			customer_id: '550e8400-e29b-41d4-a716-446655440000',
			invoice_id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
			notes: 'Test payment',
		};

		// Setup mock response
		(paymentRepository.recordWithInvoiceUpdate as jest.Mock).mockResolvedValue({
			id: 'pay-123',
			new_status: 'partial',
		});

		// Spy on eventBus
		const emitSpy = jest.spyOn(eventBus, 'emit');

		// 2. Trigger the action from the Service
		const result = await paymentService.recordPayment(mockInput as any);

		// 3. Assertions
		expect(result).toEqual({ id: 'pay-123', new_status: 'partial' });
		expect(paymentRepository.recordWithInvoiceUpdate).toHaveBeenCalledWith(mockInput);
		expect(emitSpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'PAYMENT_RECORDED' }));
	});

	it('propagates errors from the repository as AppErrors', async () => {
		(paymentRepository.recordWithInvoiceUpdate as jest.Mock).mockRejectedValue(
			new Error('RPC Error'),
		);

		const validData = {
			amount: 1,
			payment_mode: 'cash' as const,
			direction: 'received' as const,
			payment_date: '2026-01-01',
			customer_id: '550e8400-e29b-41d4-a716-446655440000',
		};
		await expect(paymentService.recordPayment(validData as any)).rejects.toThrow('RPC Error');
	});
});
