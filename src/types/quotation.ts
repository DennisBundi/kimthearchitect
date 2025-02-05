export interface FeeBreakdown {
  description: string;
  amount: string;
  duration: string;
}

export interface Task {
  task: string;
  professional: string;
  feeBreakdown: FeeBreakdown[];
}

export interface CompanyDetails {
  name: string;
  address: string;
  poBox: string;
  contact: string;
}

export interface QuotationData {
  companyDetails: CompanyDetails;
  date: string;
  projectTitle: string;
  salutation: string;
  recipientName?: string;
  tasks: Task[];
  totalAmount: number;
  notes: string[];
} 