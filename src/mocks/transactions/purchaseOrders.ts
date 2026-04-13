/** Demo purchase-order records (amounts in major currency units). */

export type POStatus = 'open' | 'partial' | 'received' | 'cancelled';

export interface PurchaseOrder {
	id: string;
	po_number: string;
	supplier_name: string;
	date: string;
	expected_date: string;
	total_value: number;
	received_pct: number;
	status: POStatus;
}

export const MOCK_PURCHASE_ORDERS: PurchaseOrder[] = [
	{
		id: '1',
		po_number: 'PO-001',
		supplier_name: 'Kajaria Ceramics',
		date: '2025-04-08',
		expected_date: '2025-04-15',
		total_value: 250000,
		received_pct: 0,
		status: 'open',
	},
	{
		id: '2',
		po_number: 'PO-002',
		supplier_name: 'Somany Tiles',
		date: '2025-04-05',
		expected_date: '2025-04-20',
		total_value: 180000,
		received_pct: 60,
		status: 'partial',
	},
];
