export interface ReceiptItem {
  quantity: string;
  description: string;
  amount: string;
  cents: string;
}

export type ReceiptStatus = 'Completed' | 'Pending';

export interface Receipt {
  id?: string;
  receipt_number: string;
  client_name: string;
  amount: number;
  status: 'Completed' | 'Pending';
  date: string;
  items: {
    quantity: string;
    description: string;
    amount: string;
    cents: string;
  }[];
  ms_value?: string;
  received_by?: string;
  receiver_name?: string;
  signature_date?: string;
  created_at?: string;
}

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export const receiptService = {
  async getReceipts() {
    try {
      const { data, error } = await supabase
        .from('receipts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching receipts:', error)
      throw error
    }
  },

  async deleteReceipt(id: string) {
    try {
      const { error } = await supabase
        .from('receipts')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting receipt:', error)
      throw error
    }
  }
} 