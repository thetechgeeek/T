import type { PaymentMode } from '@/src/types/invoice';

export const PAYMENT_MODES: { value: PaymentMode }[] = [
	{ value: 'cash' },
	{ value: 'upi' },
	{ value: 'bank_transfer' },
	{ value: 'credit' },
	{ value: 'cheque' },
];

export const EXPENSE_CATEGORIES: { value: string }[] = [
	{ value: 'Rent' },
	{ value: 'Transport' },
	{ value: 'Labor' },
	{ value: 'Utilities' },
	{ value: 'Packaging' },
	{ value: 'Maintenance' },
	{ value: 'Misc' },
];
