import { createClient } from '@supabase/supabase-js'
import { Receipt } from '../types/receipt'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export const receiptService = {
  async getReceipts(): Promise<Receipt[]> {
    try {
      const { data, error } = await supabase
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
      const { error } = await supabase
        .from('receipts')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting receipt:', error)
      throw error
    }
  },

  async createReceipt(receipt: Omit<Receipt, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabase
        .from('receipts')
        .insert([receipt])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating receipt:', error)
      throw error
    }
  }
} 