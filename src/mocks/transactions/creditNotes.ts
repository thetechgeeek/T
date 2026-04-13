/** Demo credit-note records (amounts in major currency units). */

export type CreditNoteStatus = 'open' | 'adjusted' | 'refunded';

export interface CreditNote {
	id: string;
	cn_number: string;
	date: string;
	customer_name: string;
	original_invoice: string;
	amount: number;
	reason: string;
	status: CreditNoteStatus;
}

export const MOCK_CREDIT_NOTES: CreditNote[] = [
	{
		id: '1',
		cn_number: 'CN-001',
		date: '2025-04-08',
		customer_name: 'Rajesh Kumar',
		original_invoice: 'INV-042',
		amount: 5000,
		reason: 'Defective goods',
		status: 'open',
	},
	{
		id: '2',
		cn_number: 'CN-002',
		date: '2025-04-05',
		customer_name: 'Sharma Tiles',
		original_invoice: 'INV-038',
		amount: 12500,
		reason: 'Wrong item delivered',
		status: 'adjusted',
	},
	{
		id: '3',
		cn_number: 'CN-003',
		date: '2025-03-28',
		customer_name: 'Patel Construction',
		original_invoice: 'INV-031',
		amount: 3200,
		reason: 'Price difference',
		status: 'refunded',
	},
];
