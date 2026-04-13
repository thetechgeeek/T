/** Demo estimate records (amounts in major currency units). */

export type EstimateStatus = 'open' | 'accepted' | 'expired' | 'converted';

export interface Estimate {
	id: string;
	est_number: string;
	date: string;
	valid_until: string;
	customer_name: string;
	amount: number;
	status: EstimateStatus;
}

export const MOCK_ESTIMATES: Estimate[] = [
	{
		id: '1',
		est_number: 'EST-001',
		date: '2025-04-08',
		valid_until: '2025-04-22',
		customer_name: 'Sharma Tiles',
		amount: 45000,
		status: 'open',
	},
	{
		id: '2',
		est_number: 'EST-002',
		date: '2025-04-05',
		valid_until: '2025-04-12',
		customer_name: 'Patel Construction',
		amount: 120000,
		status: 'accepted',
	},
	{
		id: '3',
		est_number: 'EST-003',
		date: '2025-03-20',
		valid_until: '2025-04-03',
		customer_name: 'Mehta Builders',
		amount: 78000,
		status: 'expired',
	},
];
