/**
 * Demo party ledger lines (amounts in major currency units).
 */

export interface PartyStatementTx {
	id: string;
	date: string;
	description: string;
	debit: number;
	credit: number;
	balance: number;
}

export const MOCK_PARTY_STATEMENT_TXS: PartyStatementTx[] = [
	{
		id: '1',
		date: '2024-04-05',
		description: 'Opening Balance',
		debit: 0,
		credit: 0,
		balance: 5000,
	},
	{
		id: '2',
		date: '2024-04-12',
		description: 'Invoice #INV-001 – Vitrified Tiles (60x60)',
		debit: 18500,
		credit: 0,
		balance: 23500,
	},
	{
		id: '3',
		date: '2024-04-20',
		description: 'Payment Received – UPI',
		debit: 0,
		credit: 15000,
		balance: 8500,
	},
	{
		id: '4',
		date: '2024-05-03',
		description: 'Invoice #INV-007 – Ceramic Wall Tiles',
		debit: 12400,
		credit: 0,
		balance: 20900,
	},
	{
		id: '5',
		date: '2024-05-15',
		description: 'Payment Received – NEFT',
		debit: 0,
		credit: 10000,
		balance: 10900,
	},
	{
		id: '6',
		date: '2024-06-08',
		description: 'Invoice #INV-015 – Mosaic Tiles',
		debit: 8750,
		credit: 0,
		balance: 19650,
	},
	{
		id: '7',
		date: '2024-06-25',
		description: 'Payment Received – Cheque',
		debit: 0,
		credit: 19650,
		balance: 0,
	},
];
