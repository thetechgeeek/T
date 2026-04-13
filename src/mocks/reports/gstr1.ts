/**
 * Demo GSTR-1 B2B / B2C rows (amounts in major currency units).
 */

export const MOCK_GSTR1_B2B = [
	{
		id: '1',
		invoiceNo: 'INV-001',
		gstin: '27AAPFU0939F1ZV',
		customer: 'Sharma Tiles Pvt Ltd',
		taxable: 85000,
		cgst: 7650,
		sgst: 7650,
		igst: 0,
		rate: 18,
	},
	{
		id: '2',
		invoiceNo: 'INV-002',
		gstin: '29ABCDE1234F1Z5',
		customer: 'Karnataka Ceramics',
		taxable: 42000,
		cgst: 0,
		sgst: 0,
		igst: 7560,
		rate: 18,
	},
	{
		id: '3',
		invoiceNo: 'INV-004',
		gstin: '07AAACP4716N1ZR',
		customer: 'Delhi Granite Works',
		taxable: 60000,
		cgst: 0,
		sgst: 0,
		igst: 7200,
		rate: 12,
	},
] as const;

export const MOCK_GSTR1_B2C: {
	rate: number;
	taxable: number;
	cgst: number;
	sgst: number;
	igst: number;
}[] = [
	{ rate: 5, taxable: 12000, cgst: 300, sgst: 300, igst: 0 },
	{ rate: 12, taxable: 28000, cgst: 1680, sgst: 1680, igst: 0 },
	{ rate: 18, taxable: 55000, cgst: 4950, sgst: 4950, igst: 0 },
	{ rate: 28, taxable: 8000, cgst: 1120, sgst: 1120, igst: 0 },
];

export const GSTR1_PERIOD_CHIPS = [
	{ label: 'Jan', value: '2025-01' },
	{ label: 'Feb', value: '2025-02' },
	{ label: 'Mar', value: '2025-03' },
] as const;
