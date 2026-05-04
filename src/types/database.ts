import type { UUID } from './common';

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type DbTable<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
	Row: Row & Record<string, unknown>;
	Insert: Insert & Record<string, unknown>;
	Update: Update & Record<string, unknown>;
	Relationships: [];
};

type DbFunction<Args, Returns> = {
	Args: Args & Record<string, unknown>;
	Returns: Returns;
};

type AnyTable = DbTable<Record<string, unknown>>;
type AnyFunction = DbFunction<Record<string, unknown>, unknown>;

export type StockOperationType = 'stock_in' | 'stock_out' | 'adjustment' | 'return';

export type Database = {
	public: {
		Tables: Record<string, AnyTable> & {
			inventory_items: DbTable<
				{
					id: UUID;
					design_name: string;
					box_count: number;
					cost_price: number;
					selling_price: number;
					gst_rate: number;
					created_at: string;
					updated_at: string;
				},
				{
					id?: UUID;
					design_name: string;
					box_count?: number;
					cost_price?: number;
					selling_price?: number;
					gst_rate?: number;
				}
			>;
			invoices: DbTable<{
				id: UUID;
				invoice_number: string;
				invoice_date: string;
				customer_id: UUID | null;
				customer_name: string;
				subtotal: number;
				cgst_total: number;
				sgst_total: number;
				igst_total: number;
				discount_total: number;
				grand_total: number;
				created_at: string;
				updated_at: string;
			}>;
			invoice_line_items: DbTable<{
				id: UUID;
				invoice_id: UUID;
				item_id: UUID | null;
				design_name: string;
				quantity: number;
				rate_per_unit: number;
				taxable_amount: number;
				gst_rate: number;
				cgst_amount: number;
				sgst_amount: number;
				igst_amount: number;
				line_total: number;
			}>;
			stock_operations: DbTable<{
				id: UUID;
				item_id: UUID;
				operation_type: StockOperationType;
				quantity_change: number;
				previous_quantity: number;
				new_quantity: number;
				reason: string | null;
				reference_type: string | null;
				reference_id: UUID | null;
				created_at: string;
			}>;
		};
		Views: Record<string, never>;
		Functions: Record<string, AnyFunction> & {
			perform_stock_operation: DbFunction<
				{
					p_item_id: UUID;
					p_operation_type: StockOperationType;
					p_quantity_change: number;
					p_reason?: string | null;
					p_reference_type?: string | null;
					p_reference_id?: UUID | null;
				},
				number
			>;
			perform_stock_operation_v1: DbFunction<
				{
					p_item_id: UUID;
					p_operation_type: StockOperationType;
					p_quantity_change: number;
					p_reason?: string | null;
					p_reference_type?: string | null;
					p_reference_id?: UUID | null;
				},
				number
			>;
			create_invoice_with_items: DbFunction<
				{
					p_invoice: Json;
					p_line_items: Json;
				},
				Json
			>;
			create_invoice_with_items_v1: DbFunction<
				{
					p_invoice: Json;
					p_line_items: Json;
				},
				Json
			>;
		};
		Enums: {
			stock_op_type: StockOperationType;
		};
		CompositeTypes: Record<string, never>;
	};
};
