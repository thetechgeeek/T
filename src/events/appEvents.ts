export type AppEvent =
	| { type: 'INVOICE_CREATED'; invoiceId: string }
	| { type: 'STOCK_CHANGED'; itemId: string }
	| { type: 'PAYMENT_RECORDED'; paymentId: string; invoiceId: string };

type EventHandler = (event: AppEvent) => void;

const listeners = new Set<EventHandler>();

export const eventBus = {
	emit(event: AppEvent) {
		listeners.forEach((handler) => handler(event));
	},

	subscribe(handler: EventHandler) {
		listeners.add(handler);
		return () => {
			listeners.delete(handler);
		};
	},
};
