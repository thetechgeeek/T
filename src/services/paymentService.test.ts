import { createPaymentService } from './paymentService';
import { ValidationError } from '../errors/AppError';
import type { PaymentInput } from '../repositories/paymentRepository';

// Fixed: use a static past date rather than a date that can become "future" (QA issue 2.18)
const validPayment: PaymentInput = {
	amount: 5000,
	payment_mode: 'upi',
	direction: 'received',
	payment_date: '2025-01-15',
	customer_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
};

describe('paymentService', () => {
	const mockRepo = {
		recordWithInvoiceUpdate: jest.fn(),
		fetchPayments: jest.fn(),
	};

	const service = createPaymentService(mockRepo as any);

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('recordPayment', () => {
		it('delegates to repo.recordWithInvoiceUpdate for valid input', async () => {
			const mockResult = { id: 'abc', new_status: 'paid' };
			mockRepo.recordWithInvoiceUpdate.mockResolvedValue(mockResult);

			const result = await service.recordPayment(validPayment);

			expect(mockRepo.recordWithInvoiceUpdate).toHaveBeenCalledWith(validPayment);
			expect(result).toEqual(mockResult);
		});

		it('throws ValidationError for negative amount', async () => {
			await expect(
				service.recordPayment({ ...validPayment, amount: -100 }),
			).rejects.toBeInstanceOf(ValidationError);
		});

		it('throws ValidationError for invalid payment_mode', async () => {
			await expect(
				service.recordPayment({ ...validPayment, payment_mode: 'bitcoin' as any }),
			).rejects.toBeInstanceOf(ValidationError);
		});

		it('throws ValidationError for invalid date format', async () => {
			await expect(
				service.recordPayment({ ...validPayment, payment_date: '29-03-2026' }),
			).rejects.toBeInstanceOf(ValidationError);
		});

		it('throws ValidationError when both customer_id and supplier_id are set', async () => {
			await expect(
				service.recordPayment({
					...validPayment,
					supplier_id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
				}),
			).rejects.toBeInstanceOf(ValidationError);
		});

		it('propagates DB error from repo.recordWithInvoiceUpdate (does not swallow)', async () => {
			// Business rule: payment repo errors must surface to caller for error UI handling
			mockRepo.recordWithInvoiceUpdate.mockRejectedValue(new Error('DB error'));

			await expect(service.recordPayment(validPayment)).rejects.toThrow('DB error');
		});

		it('amount = 0 throws ValidationError (zero payments are not valid)', async () => {
			// PaymentSchema uses z.number().positive() — 0 is not positive
			await expect(
				service.recordPayment({ ...validPayment, amount: 0 }),
			).rejects.toBeInstanceOf(ValidationError);
		});

		it('missing both customer_id and supplier_id throws ValidationError', async () => {
			const noParty = { ...validPayment } as Partial<PaymentInput>;
			delete noParty.customer_id;
			await expect(service.recordPayment(noParty as PaymentInput)).rejects.toBeInstanceOf(ValidationError);
		});
	});

	describe('fetchPayments', () => {
		it('delegates to repo.fetchPayments with the given filters and returns result', async () => {
			const payments = [{ id: 'pay-001', amount: 500 }];
			mockRepo.fetchPayments.mockResolvedValue(payments);

			const result = await service.fetchPayments({});

			expect(mockRepo.fetchPayments).toHaveBeenCalledWith({});
			expect(result).toEqual(payments);
		});
	});
});
