'use client'

import { useState, useEffect, AwaitedReactNode, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal } from 'react'
import { InvoiceModal } from './InvoiceModal'
import { ReceiptModal } from '../Receipts/ReceiptModal'
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline'
import { invoiceService } from '../../../services/invoiceService'
import { receiptService } from '../../../services/receiptService'
import { Invoice } from '../../../types/invoice'
import { Receipt } from '../../../types/receipt'

export default function InvoicesPage() {
  const [activeTab, setActiveTab] = useState('invoices');
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [lastInvoiceNumber, setLastInvoiceNumber] = useState(0);
  const [lastReceiptNumber, setLastReceiptNumber] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingReceipts, setIsLoadingReceipts] = useState(false);

  // Fetch data based on active tab
  useEffect(() => {
    if (activeTab === 'invoices') {
      fetchInvoices();
    } else {
      fetchReceipts();
    }
  }, [activeTab]);

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      const data = await invoiceService.getInvoices();
      setInvoices(data);
      
      // Update last invoice number
      if (data.length > 0) {
        const maxNumber = Math.max(...data.map(invoice => {
          const num = parseInt(invoice.invoice_number.split('-')[1]);
          return isNaN(num) ? 0 : num;
        }));
        setLastInvoiceNumber(maxNumber);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReceipts = async () => {
    try {
      setIsLoadingReceipts(true);
      const data = await receiptService.getReceipts();
      setReceipts(data);
      
      // Update last receipt number
      if (data.length > 0) {
        const maxNumber = Math.max(...data.map((receipt: Receipt) => {
          const num = parseInt(receipt.receipt_number.split('-')[1]);
          return isNaN(num) ? 0 : num;
        }));
        setLastReceiptNumber(maxNumber);
      }
    } catch (error) {
      console.error('Error fetching receipts:', error);
    } finally {
      setIsLoadingReceipts(false);
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await invoiceService.deleteInvoice(id);
        await fetchInvoices(); // Refresh the list
      } catch (error) {
        console.error('Error deleting invoice:', error);
      }
    }
  };

  const handleDeleteReceipt = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this receipt?')) {
      try {
        await receiptService.deleteReceipt(id);
        await fetchReceipts(); // Refresh the list
      } catch (error) {
        console.error('Error deleting receipt:', error);
      }
    }
  };

  const renderInvoicesTable = () => (
    <table className="w-full text-white">
      <thead className="bg-white/10">
        <tr>
          <th className="px-6 py-3 text-left">Invoice #</th>
          <th className="px-6 py-3 text-left">Client</th>
          <th className="px-6 py-3 text-left">Amount</th>
          <th className="px-6 py-3 text-left">Status</th>
          <th className="px-6 py-3 text-left">Date</th>
          <th className="px-6 py-3 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        {isLoading ? (
          <tr>
            <td colSpan={6} className="px-6 py-4 text-center">Loading...</td>
          </tr>
        ) : invoices.length === 0 ? (
          <tr>
            <td colSpan={6} className="px-6 py-4 text-center">No invoices found</td>
          </tr>
        ) : (
          invoices.map((invoice) => (
            <tr key={invoice.id} className="border-b border-white/10 hover:bg-white/5">
              <td className="px-6 py-4">{invoice.invoice_number}</td>
              <td className="px-6 py-4">{invoice.client_name}</td>
              <td className="px-6 py-4">Ksh {invoice.amount.toLocaleString()}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-sm ${
                  invoice.status === 'Paid' 
                    ? 'bg-green-500/20 text-green-500' 
                    : 'bg-yellow-500/20 text-yellow-500'
                }`}>
                  {invoice.status}
                </span>
              </td>
              <td className="px-6 py-4">{new Date(invoice.date).toLocaleDateString()}</td>
              <td className="px-6 py-4 flex items-center space-x-3">
                <button 
                  className="text-[#DBA463] hover:text-[#c28a4f] p-1 rounded-full hover:bg-white/5"
                  title="Edit"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button 
                  className="text-red-500 hover:text-red-400 p-1 rounded-full hover:bg-white/5"
                  title="Delete"
                  onClick={() => invoice.id && handleDeleteInvoice(invoice.id)}
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );

  const renderReceiptsTable = () => (
    <table className="w-full text-white">
      <thead className="bg-white/10">
        <tr>
          <th className="px-6 py-3 text-left">Receipt #</th>
          <th className="px-6 py-3 text-left">Client</th>
          <th className="px-6 py-3 text-left">Amount</th>
          <th className="px-6 py-3 text-left">Status</th>
          <th className="px-6 py-3 text-left">Date</th>
          <th className="px-6 py-3 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        {isLoadingReceipts ? (
          <tr>
            <td colSpan={6} className="px-6 py-4 text-center">Loading...</td>
          </tr>
        ) : receipts.length === 0 ? (
          <tr>
            <td colSpan={6} className="px-6 py-4 text-center">No receipts found</td>
          </tr>
        ) : (
          receipts.map((receipt) => (
            <tr key={receipt.id} className="border-b border-white/10 hover:bg-white/5">
              <td className="px-6 py-4">{receipt.receipt_number}</td>
              <td className="px-6 py-4">{receipt.client_name}</td>
              <td className="px-6 py-4">Ksh {receipt.amount.toLocaleString()}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-sm ${
                  receipt.status === 'Completed' 
                    ? 'bg-green-500/20 text-green-500' 
                    : 'bg-yellow-500/20 text-yellow-500'
                }`}>
                  {receipt.status}
                </span>
              </td>
              <td className="px-6 py-4">{new Date(receipt.date).toLocaleDateString()}</td>
              <td className="px-6 py-4 flex items-center space-x-3">
                <button 
                  className="text-[#DBA463] hover:text-[#c28a4f] p-1 rounded-full hover:bg-white/5"
                  title="Edit"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button 
                  className="text-red-500 hover:text-red-400 p-1 rounded-full hover:bg-white/5"
                  title="Delete"
                  onClick={() => receipt.id && handleDeleteReceipt(receipt.id)}
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );

  return (
    <div className="bg-white/5 rounded-lg p-6">
      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'invoices'
              ? 'bg-[#DBA463] text-white'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Invoices
        </button>
        <button
          onClick={() => setActiveTab('receipts')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'receipts'
              ? 'bg-[#DBA463] text-white'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Receipts
        </button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">
          {activeTab === 'invoices' ? 'Invoices' : 'Receipts'}
        </h2>
        <div className="space-x-4">
          {activeTab === 'invoices' ? (
            <button 
              onClick={() => setIsInvoiceModalOpen(true)}
              className="bg-[#DBA463] text-white px-4 py-2 rounded-lg hover:bg-[#c28a4f] transition-colors"
            >
              Create New Invoice
            </button>
          ) : (
            <button 
              onClick={() => setIsReceiptModalOpen(true)}
              className="bg-[#DBA463] text-white px-4 py-2 rounded-lg hover:bg-[#c28a4f] transition-colors"
            >
              Create New Receipt
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <label className="text-white text-sm">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-800 text-white border border-white/20 rounded px-3 py-1 text-sm focus:outline-none focus:border-[#DBA463]"
          >
            <option value="all" className="bg-gray-800">All</option>
            <option value="Paid" className="bg-gray-800">
              {activeTab === 'invoices' ? 'Paid' : 'Completed'}
            </option>
            <option value="Pending" className="bg-gray-800">Pending</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-white text-sm">Date:</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-gray-800 text-white border border-white/20 rounded px-3 py-1 text-sm focus:outline-none focus:border-[#DBA463]"
          />
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-white text-sm">Month:</label>
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="bg-gray-800 text-white border border-white/20 rounded px-3 py-1 text-sm focus:outline-none focus:border-[#DBA463]"
          >
            <option value="" className="bg-gray-800">All</option>
            <option value="1" className="bg-gray-800">January</option>
            <option value="2" className="bg-gray-800">February</option>
            <option value="3" className="bg-gray-800">March</option>
            <option value="4" className="bg-gray-800">April</option>
            <option value="5" className="bg-gray-800">May</option>
            <option value="6" className="bg-gray-800">June</option>
            <option value="7" className="bg-gray-800">July</option>
            <option value="8" className="bg-gray-800">August</option>
            <option value="9" className="bg-gray-800">September</option>
            <option value="10" className="bg-gray-800">October</option>
            <option value="11" className="bg-gray-800">November</option>
            <option value="12" className="bg-gray-800">December</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-white text-sm">Year:</label>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="bg-gray-800 text-white border border-white/20 rounded px-3 py-1 text-sm focus:outline-none focus:border-[#DBA463]"
          >
            <option value="" className="bg-gray-800">All</option>
            <option value="2024" className="bg-gray-800">2024</option>
            <option value="2023" className="bg-gray-800">2023</option>
            <option value="2022" className="bg-gray-800">2022</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        <button
          onClick={() => {
            setStatusFilter('all');
            setDateFilter('');
            setMonthFilter('');
            setYearFilter('');
          }}
          className="text-[#DBA463] hover:text-[#c28a4f] text-sm"
        >
          Clear Filters
        </button>
      </div>

      {/* Modals */}
      {isInvoiceModalOpen && (
        <InvoiceModal 
          isOpen={isInvoiceModalOpen}
          onClose={() => setIsInvoiceModalOpen(false)}
          currentInvoiceNumber={lastInvoiceNumber}
        />
      )}

      {isReceiptModalOpen && (
        <ReceiptModal 
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          currentReceiptNumber={lastReceiptNumber}
        />
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        {activeTab === 'invoices' ? renderInvoicesTable() : renderReceiptsTable()}
      </div>
    </div>
  )
} 