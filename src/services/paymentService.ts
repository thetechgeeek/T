import { paymentRepository, type PaymentInput } from '../repositories/paymentRepository';
import { toAppError } from '../errors/AppError';
import { validateWith } from '../utils/validation';
import { PaymentSchema } from '../schemas/payment';
import { eventBus } from '../events/appEvents';

export type { PaymentInput };

export function createPaymentService(repo = paymentRepository) {
	return {
		/**
		 * Records a payment and atomically updates invoice amount_paid + status
		 * via migration 012 RPC. Eliminates the read-modify-write race condition.
		 */
		async recordPayment(input: PaymentInput) {
			validateWith(PaymentSchema, input);
			try {
				const result = await repo.recordWithInvoiceUpdate(input);

				// Notify other stores via event bus (standard project pattern)
				eventBus.emit({
					type: 'PAYMENT_RECORDED',
					paymentId: result.id ?? undefined,
					invoiceId: input.invoice_id,
					customerId: input.customer_id,
				});

				return result;
			} catch (error) {
				throw toAppError(error);
			}
		},

		async fetchPayments(filters: {
			customer_id?: import('../types/common').UUID;
			supplier_id?: import('../types/common').UUID;
			dateFrom?: string;
			dateTo?: string;
		}) {
			try {
				return await repo.fetchPayments(filters);
			} catch (error) {
				throw toAppError(error);
			}
		},
	};
}

export const paymentService = createPaymentService();
