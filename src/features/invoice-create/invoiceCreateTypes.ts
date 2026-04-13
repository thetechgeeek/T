import type { PaymentMode } from '@/src/types/invoice';

export interface CustomerDraft {
	id?: string;
	name: string;
	phone?: string;
	gstin?: string;
	address?: string;
}

export type { PaymentMode };
