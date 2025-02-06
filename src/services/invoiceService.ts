import { createClient } from '@supabase/supabase-js'
import { Invoice } from '../types/invoice'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export const invoiceService = {
  async createInvoice(invoice: Invoice) {
    try {
      console.log('Creating invoice with data:', invoice); // Debug log

      const { data, error } = await supabase
        .from('invoices')
        .insert([{
          invoice_number: invoice.invoice_number,
          client_name: invoice.client_name,
          amount: invoice.amount,
          status: invoice.status,
          date: invoice.date,
          items: invoice.items,
          ms_value: invoice.ms_value,
          received_by: invoice.received_by,
          receiver_name: invoice.receiver_name,
          signature_date: invoice.signature_date
        }])
        .select()
        .single()

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  },

  async getInvoices() {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching invoices:', error)
      throw error
    }
  },

  async updateInvoice(id: string, updates: Partial<Invoice>) {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating invoice:', error)
      throw error
    }
  },

  async deleteInvoice(id: string) {
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting invoice:', error)
      throw error
    }
  }
} 