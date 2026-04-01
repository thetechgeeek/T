import { paymentRepository, type PaymentInput } from '../repositories/paymentRepository';
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
			const result = await repo.recordWithInvoiceUpdate(input);

			// Notify other stores via event bus (standard project pattern)
			eventBus.emit({
				type: 'PAYMENT_RECORDED',
				paymentId: result.id ?? undefined,
				invoiceId: input.invoice_id,
			});

			return result;
		},

		async fetchPayments(filters: {
			customer_id?: import('../types/common').UUID;
			supplier_id?: import('../types/common').UUID;
			dateFrom?: string;
			dateTo?: string;
		}) {
			return repo.fetchPayments(filters);
		},
	};
}

export const paymentService = createPaymentService();
