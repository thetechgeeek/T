/**
 * Demo rows for item-wise P&L (amounts in major currency units).
 * Replace with Supabase-backed data when wired.
 */

export interface ItemProfitRow {
	id: string;
	name: string;
	category: string;
	qtySold: number;
	revenue: number;
	cost: number;
	profit: number;
	margin: number;
}

export const MOCK_ITEM_PROFIT_ROWS: ItemProfitRow[] = [
	{
		id: '1',
		name: 'Kajaria 600×600 Glossy',
		category: 'Glossy',
		qtySold: 420,
		revenue: 189000,
		cost: 126000,
		profit: 63000,
		margin: 33,
	},
	{
		id: '2',
		name: 'Johnson Endura Floor',
		category: 'Floor',
		qtySold: 310,
		revenue: 139500,
		cost: 99000,
		profit: 40500,
		margin: 29,
	},
	{
		id: '3',
		name: 'Somany Matt 300×600',
		category: 'Matt',
		qtySold: 280,
		revenue: 98000,
		cost: 73500,
		profit: 24500,
		margin: 25,
	},
	{
		id: '4',
		name: 'RAK Wooden Plank',
		category: 'Wooden',
		qtySold: 195,
		revenue: 136500,
		cost: 110500,
		profit: 26000,
		margin: 19,
	},
	{
		id: '5',
		name: 'Nitco Satin 600×1200',
		category: 'Satin',
		qtySold: 155,
		revenue: 108500,
		cost: 80750,
		profit: 27750,
		margin: 26,
	},
	{
		id: '6',
		name: 'Cera Elevation Outdoor',
		category: 'Elevation',
		qtySold: 90,
		revenue: 63000,
		cost: 52500,
		profit: 10500,
		margin: 17,
	},
];
