import { createClient } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabaseClient = createClient(supabaseUrl, supabaseKey)

export interface ReceiptItem {
  quantity: number;
  description: string;
  amount: number;
}

export interface Receipt {
  id?: string;
  receipt_number: string;
  client_name: string;
  date: string;
  items: ReceiptItem[];
  amount: number;
  received_by: string;
  status: 'Pending' | 'Completed';
}

export const receiptService = {
  async getReceipts(): Promise<Receipt[]> {
    try {
      const { data, error } = await supabaseClient
        .from('receipts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching receipts:', error)
      throw error
    }
  },

  async deleteReceipt(id: string): Promise<void> {
    try {
      const { error } = await supabaseClient
        .from('receipts')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting receipt:', error)
      throw error
    }
  },

  async createReceipt(data: Omit<Receipt, 'id'>) {
    try {
      const { data: receipt, error } = await supabase
        .from('receipts')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return receipt;
    } catch (error) {
      console.error('Error creating receipt:', error);
      throw error;
    }
  }
}

export default receiptService 