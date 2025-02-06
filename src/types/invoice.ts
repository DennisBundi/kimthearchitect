export interface InvoiceItem {
  quantity: string;
  description: string;
  amount: string;
  cents: string;
}

export type InvoiceStatus = 'Paid' | 'Pending';

export interface Invoice {
  id?: string;
  invoice_number: string;
  client_name: string;
  amount: number;
  status: InvoiceStatus;
  date: string;
  items: InvoiceItem[];
  ms_value?: string | undefined;
  received_by?: string | undefined;
  receiver_name?: string | undefined;
  signature_date?: string | undefined;
  created_at?: string;
} 