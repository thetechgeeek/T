import type { UUID, Timestamps } from './common';
import type { PaymentMode, PaymentStatus } from './invoice';

export interface Expense extends Timestamps {
	id: UUID;
	expense_date: string;
	category: string;
	amount: number;
	description?: string;
	receipt_image_url?: string;
	payment_mode?: PaymentMode;
	notes?: string;
}

export interface Purchase extends Timestamps {
	id: UUID;
	purchase_number?: string;
	supplier_id?: UUID;
	order_id?: UUID;
	purchase_date: string;
	subtotal: number;
	tax_total: number;
	grand_total: number;
	payment_status: PaymentStatus;
	amount_paid: number;
	notes?: string;
	/** Populated from suppliers join in financeService.fetchPurchases */
	supplier_name?: string;
}

export interface PurchaseLineItem {
	id: UUID;
	purchase_id: UUID;
	item_id?: UUID;
	design_name: string;
	quantity: number;
	rate_per_unit: number;
	amount: number;
}

export interface Payment extends Timestamps {
	id: UUID;
	payment_date: string;
	amount: number;
	payment_mode: PaymentMode;
	direction: 'received' | 'made';
	customer_id?: UUID;
	supplier_id?: UUID;
	invoice_id?: UUID;
	purchase_id?: UUID;
	notes?: string;
	customer?: { name: string };
	supplier?: { name: string };
}

export interface ProfitLossReport {
	period_start: string;
	period_end: string;
	total_revenue: number;
	total_cogs: number;
	gross_profit: number;
	total_expenses: number;
	net_profit: number;
}

export interface DailySales {
	date: string;
	invoice_count: number;
	total_revenue: number;
	cash_amount: number;
	upi_amount: number;
	credit_amount: number;
}

export interface RecentTransaction {
	id: string;
	type: 'sale' | 'purchase' | 'payment_in' | 'payment_out' | 'expense';
	party_name?: string;
	description?: string;
	amount: number;
	date: string;
}

export interface DashboardStats {
	today_sales: number;
	today_invoice_count: number;
	total_outstanding_credit: number;
	total_outstanding_customers: number;
	low_stock_count: number;
	monthly_revenue: number;
	today_collection?: number;
	recentTransactions?: RecentTransaction[];
}

export interface BusinessProfile {
	id: UUID;
	business_name: string;
	gstin?: string;
	address?: string;
	city?: string;
	state?: string;
	state_code?: string;
	phone?: string;
	email?: string;
	logo_url?: string;
	invoice_prefix: string;
	invoice_sequence: number;
	financial_year_start?: string;
	last_invoice_fy?: string;
	terms_and_conditions?: string;
	created_at: string;
	updated_at: string;
}
