import type { Href } from 'expo-router';

export const appRoutes = {
	appHome: '/(app)/(tabs)' as Href,
	authLogin: '/(auth)/login' as Href,
	invoices: {
		create: '/(app)/invoices/create' as Href,
		detail: (invoiceId: string): Href => `/(app)/invoices/${invoiceId}` as Href,
	},
	finance: {
		payments: {
			make: '/(app)/finance/payments/make' as Href,
			receive: '/(app)/finance/payments/receive' as Href,
			detail: (paymentId: string): Href => `/(app)/finance/payments/${paymentId}` as Href,
			receipt: (paymentId: string): Href =>
				`/(app)/finance/payments/${paymentId}/receipt` as Href,
		},
		purchases: {
			index: '/(app)/finance/purchases' as Href,
			create: '/(app)/finance/purchases/create' as Href,
			detail: (purchaseId: string): Href => `/(app)/finance/purchases/${purchaseId}` as Href,
		},
	},
};
