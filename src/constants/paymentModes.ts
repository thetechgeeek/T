import type { PaymentMode } from '@/src/types/invoice';

export const PAYMENT_MODES: { value: PaymentMode; labelEn: string; labelHi: string }[] = [
	{ value: 'cash', labelEn: 'Cash', labelHi: 'नकद' },
	{ value: 'upi', labelEn: 'UPI', labelHi: 'यूपीआई' },
	{ value: 'bank_transfer', labelEn: 'Bank Transfer', labelHi: 'बैंक ट्रांसफर' },
	{ value: 'credit', labelEn: 'Credit (Udhar)', labelHi: 'उधार' },
	{ value: 'cheque', labelEn: 'Cheque', labelHi: 'चेक' },
];

export const EXPENSE_CATEGORIES = [
	{ value: 'Rent', labelEn: 'Rent', labelHi: 'किराया' },
	{ value: 'Transport', labelEn: 'Transport', labelHi: 'ट्रांसपोर्ट' },
	{ value: 'Labor', labelEn: 'Labor', labelHi: 'मजदूरी' },
	{ value: 'Utilities', labelEn: 'Utilities', labelHi: 'बिजली/पानी' },
	{ value: 'Packaging', labelEn: 'Packaging', labelHi: 'पैकेजिंग' },
	{ value: 'Maintenance', labelEn: 'Shop Maintenance', labelHi: 'दुकान रखरखाव' },
	{ value: 'Misc', labelEn: 'Miscellaneous', labelHi: 'विविध' },
];
