/**
 * Demo GST detail report rows (amounts in major currency units).
 */

export type GSTDetailTxType = 'Sale' | 'Purchase';

export interface GSTDetailRow {
	id: string;
	date: string;
	type: GSTDetailTxType;
	party: string;
	invoiceNo: string;
	taxable: number;
	rate: number;
	cgst: number;
	sgst: number;
	igst: number;
}

export const MOCK_GST_DETAIL_ROWS: GSTDetailRow[] = [
	{
		id: '1',
		date: '2025-03-05',
		type: 'Sale',
		party: 'Sharma Tiles Pvt Ltd',
		invoiceNo: 'INV-001',
		taxable: 85000,
		rate: 18,
		cgst: 7650,
		sgst: 7650,
		igst: 0,
	},
	{
		id: '2',
		date: '2025-03-08',
		type: 'Sale',
		party: 'Karnataka Ceramics',
		invoiceNo: 'INV-002',
		taxable: 42000,
		rate: 18,
		cgst: 0,
		sgst: 0,
		igst: 7560,
	},
	{
		id: '3',
		date: '2025-03-12',
		type: 'Purchase',
		party: 'National Glaze Suppliers',
		invoiceNo: 'PB-0045',
		taxable: 35000,
		rate: 18,
		cgst: 3150,
		sgst: 3150,
		igst: 0,
	},
	{
		id: '4',
		date: '2025-03-18',
		type: 'Sale',
		party: 'Rohan Construction',
		invoiceNo: 'INV-003',
		taxable: 28000,
		rate: 12,
		cgst: 1680,
		sgst: 1680,
		igst: 0,
	},
	{
		id: '5',
		date: '2025-03-22',
		type: 'Purchase',
		party: 'Mumbai Mosaic Co.',
		invoiceNo: 'PB-0048',
		taxable: 60000,
		rate: 18,
		cgst: 0,
		sgst: 0,
		igst: 10800,
	},
];

/** Default date range shown before real filters apply */
export const GST_DETAIL_DEFAULT_FROM = '2025-03-01';
export const GST_DETAIL_DEFAULT_TO = '2025-03-31';
