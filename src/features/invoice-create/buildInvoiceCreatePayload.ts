import { CASH_WALK_IN_CUSTOMER_NAME } from '@/src/constants/invoiceCustomer';
import type { InvoiceInput, InvoiceLineItemInput } from '@/src/types/invoice';
import type { CustomerDraft, PaymentMode } from './invoiceCreateTypes';

/** Snapshot of invoice-create flow state used to build the RPC payload (mirrors `submitInvoice` in useInvoiceCreateFlow). */
export type BuildInvoiceCreatePayloadInput = {
	isCashSale: boolean;
	customer: CustomerDraft | null;
	isInterState: boolean;
	lineItems: InvoiceLineItemInput[];
	invoiceDate: string;
	invoiceNumber: string;
	amountPaidNum: number;
	grandTotal: number;
	paymentMode: PaymentMode;
};

/**
 * Pure builder for `invoiceStore.createInvoice` / `invoiceService.createInvoice`.
 * Keep in sync with `useInvoiceCreateFlow` submit logic.
 */
export function buildInvoiceCreatePayload(input: BuildInvoiceCreatePayloadInput): InvoiceInput {
	const payment_status =
		input.amountPaidNum >= input.grandTotal
			? 'paid'
			: input.amountPaidNum > 0
				? 'partial'
				: 'unpaid';

	return {
		customer_id: input.customer?.id,
		customer_name: input.customer?.name ?? CASH_WALK_IN_CUSTOMER_NAME,
		customer_phone: input.customer?.phone || '',
		customer_address: input.customer?.address,
		customer_gstin: input.customer?.gstin,
		is_inter_state: input.isInterState,
		line_items: input.lineItems,
		invoice_date: input.invoiceDate,
		invoice_number: input.invoiceNumber,
		payment_status,
		payment_mode: input.amountPaidNum > 0 ? input.paymentMode : undefined,
		amount_paid: input.amountPaidNum,
	};
}
