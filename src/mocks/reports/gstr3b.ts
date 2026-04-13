/**
 * Demo GSTR-3B section aggregates (amounts in major currency units).
 */

export const GSTR3B_PERIOD_CHIPS = [
	{ label: 'Jan 25', value: '2025-01' },
	{ label: 'Feb 25', value: '2025-02' },
	{ label: 'Mar 25', value: '2025-03' },
] as const;

export const MOCK_GSTR3B_OUTWARD_31 = [
	{
		label: 'Taxable supplies (other than zero rated, nil rated & exempt)',
		taxable: 230000,
		igst: 14760,
		cgst: 14580,
		sgst: 14580,
	},
	{
		label: 'Zero rated supply (export) on payment of tax',
		taxable: 0,
		igst: 0,
		cgst: 0,
		sgst: 0,
	},
	{ label: 'Nil rated / exempted supplies', taxable: 5000, igst: 0, cgst: 0, sgst: 0 },
	{ label: 'Non-GST outward supplies', taxable: 2000, igst: 0, cgst: 0, sgst: 0 },
];

export const MOCK_GSTR3B_INTERSTATE_32 = [
	{ label: 'Supplies to unregistered persons', taxable: 24000, igst: 2160 },
	{ label: 'Supplies to composition taxable persons', taxable: 0, igst: 0 },
	{ label: 'Supplies to UIN holders', taxable: 0, igst: 0 },
];

export const MOCK_GSTR3B_ITC = [
	{ label: 'Import of goods', igst: 0, cgst: 0, sgst: 0 },
	{ label: 'Import of services', igst: 0, cgst: 0, sgst: 0 },
	{ label: 'Inward supplies (other than import)', igst: 7560, cgst: 6300, sgst: 6300 },
	{ label: 'ITC reversal (rules 42 & 43)', igst: 0, cgst: 0, sgst: 0 },
];
