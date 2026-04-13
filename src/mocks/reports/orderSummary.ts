/** Demo order-summary rows (amounts in major currency units). */

export type OrderStatus = 'fulfilled' | 'pending' | 'cancelled';

export interface OrderRow {
	id: string;
	orderNo: string;
	partyName: string;
	amount: number;
	items: number;
	date: string;
	status: OrderStatus;
}

export const MOCK_ORDER_SUMMARY_ROWS: OrderRow[] = [
	{
		id: '1',
		orderNo: 'ORD-2024-001',
		partyName: 'Ravi Construction Co.',
		amount: 87500,
		items: 3,
		date: '10 Apr 2026',
		status: 'fulfilled',
	},
	{
		id: '2',
		orderNo: 'ORD-2024-002',
		partyName: 'Metro Builders Pvt Ltd',
		amount: 142000,
		items: 5,
		date: '08 Apr 2026',
		status: 'pending',
	},
	{
		id: '3',
		orderNo: 'ORD-2024-003',
		partyName: 'Sharma Interiors',
		amount: 36800,
		items: 2,
		date: '05 Apr 2026',
		status: 'fulfilled',
	},
	{
		id: '4',
		orderNo: 'ORD-2024-004',
		partyName: 'Patel Constructions',
		amount: 215000,
		items: 8,
		date: '02 Apr 2026',
		status: 'pending',
	},
];
