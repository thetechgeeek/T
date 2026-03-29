import { createPaymentService } from './paymentService';
import { ValidationError } from '../errors/AppError';
import type { PaymentInput } from '../repositories/paymentRepository';

const validPayment: PaymentInput = {
	amount: 5000,
	payment_mode: 'upi',
	direction: 'received',
	payment_date: '2026-03-29',
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
	});
});
