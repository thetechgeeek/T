import { supabase } from '../config/supabase';
import type { UUID } from '../types/common';

export interface Expense {
  id: UUID;
  expense_date: string;
  amount: number;
  category: string;
  notes?: string;
  created_at: string;
}

export interface Purchase {
  id: UUID;
  purchase_date: string;
  supplier_id: UUID;
  total_amount: number;
  payment_status: 'paid' | 'partial' | 'unpaid';
  notes?: string;
  created_at: string;
  supplier_name?: string;
}

export interface ProfitLossSummary {
  total_sales: number;
  total_purchases: number;
  total_expenses: number;
  gross_profit: number;
  net_profit: number;
}

export const financeService = {
  async fetchExpenses(filters: { search?: string; startDate?: string; endDate?: string }) {
    let query = supabase.from('expenses').select('*', { count: 'exact' });
    
    if (filters.search) {
      query = query.ilike('category', `%${filters.search}%`);
    }
    if (filters.startDate) {
      query = query.gte('expense_date', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('expense_date', filters.endDate);
    }
    
    const { data, error, count } = await query.order('expense_date', { ascending: false });
    if (error) throw error;
    return { data: data as Expense[], count: count || 0 };
  },

  async createExpense(expense: Omit<Expense, 'id' | 'created_at'>) {
    const { data, error } = await supabase.from('expenses').insert(expense).select().single();
    if (error) throw error;
    return data as Expense;
  },

  async fetchPurchases(filters: { supplierId?: UUID; startDate?: string; endDate?: string }) {
    let query = supabase.from('purchases').select('*, suppliers(name)');
    
    if (filters.supplierId) {
      query = query.eq('supplier_id', filters.supplierId);
    }
    if (filters.startDate) {
      query = query.gte('purchase_date', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('purchase_date', filters.endDate);
    }
    
    const { data, error } = await query.order('purchase_date', { ascending: false });
    if (error) throw error;
    
    return data.map(p => ({
      ...p,
      supplier_name: (p.suppliers as any)?.name
    })) as Purchase[];
  },

  async createPurchase(purchase: Omit<Purchase, 'id' | 'created_at' | 'supplier_name'>) {
    const { data, error } = await supabase.from('purchases').insert(purchase).select().single();
    if (error) throw error;
    return data as Purchase;
  },

  async getProfitLoss(startDate: string, endDate: string): Promise<ProfitLossSummary> {
    const { data, error } = await supabase.rpc('get_profit_loss', {
      p_start: startDate,
      p_end: endDate
    });
    
    if (error) throw error;
    return data as ProfitLossSummary;
  }
};
