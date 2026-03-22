import { create } from 'zustand';
import { orderService } from '../services/orderService';
import { pdfService } from '../services/pdfService';
import type { ParsedOrderItem } from '../services/pdfService';
import type { UUID } from '@/src/types/common';

export interface Order {
  id: UUID;
  order_number: string | null;
  supplier_id: UUID | null;
  party_name: string | null;
  city: string | null;
  order_date: string;
  total_weight: number | null;
  total_quantity: number | null;
  status: 'ordered' | 'partially_received' | 'fully_received' | 'cancelled';
  source_pdf_url: string | null;
  raw_llm_response: any | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface OrderState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  
  // Import flow state
  parsedData: ParsedOrderItem[] | null;
  rawResponse: any | null;
  isParsing: boolean;

  fetchOrders: () => Promise<void>;
  parseDocument: (base64: string, mimeType: string, aiKey?: string) => Promise<void>;
  importParsedData: (partyName: string, items: ParsedOrderItem[]) => Promise<void>;
  clearParsedData: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  loading: false,
  error: null,
  
  parsedData: null,
  rawResponse: null,
  isParsing: false,

  fetchOrders: async () => {
    set({ loading: true, error: null });
    try {
      const data = await orderService.fetchOrders();
      set({ orders: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  parseDocument: async (base64: string, mimeType: string, aiKey?: string) => {
    set({ isParsing: true, error: null });
    try {
      const parsedItems = await pdfService.parseDocumentWithLLM(base64, mimeType, aiKey);
      set({ 
        parsedData: parsedItems,
        rawResponse: parsedItems, // keeping it simple for now as we just need the array
        isParsing: false 
      });
    } catch (error: any) {
      set({ error: error.message, isParsing: false });
      throw error;
    }
  },

  importParsedData: async (partyName: string, items: ParsedOrderItem[]) => {
    set({ loading: true, error: null });
    try {
      await orderService.importOrder(partyName, items, get().rawResponse);
      const orders = await orderService.fetchOrders();
      set({ orders, parsedData: null, rawResponse: null, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  clearParsedData: () => {
    set({ parsedData: null, rawResponse: null });
  }
}));
