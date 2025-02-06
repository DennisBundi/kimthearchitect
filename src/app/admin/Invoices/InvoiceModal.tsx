'use client'

import { useState, useEffect, useRef } from 'react'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { invoiceService } from '@/services/invoiceService'
import { InvoiceItem, Invoice, InvoiceStatus } from '@/types/invoice'

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentInvoiceNumber?: number;
}

export const InvoiceModal = ({ isOpen, onClose, currentInvoiceNumber = 0 }: InvoiceModalProps) => {
  const [invoiceNumber, setInvoiceNumber] = useState(
    (currentInvoiceNumber + 1).toString().padStart(3, '0')
  );

  const [items, setItems] = useState<InvoiceItem[]>([
    { quantity: '', description: '', amount: '', cents: '' },
    { quantity: '', description: '', amount: '', cents: '' },
  ]);

  const [total, setTotal] = useState({ amount: '0', cents: '00' });
  const [receivedBy, setReceivedBy] = useState('');
  const [name, setName] = useState('');
  const [signatureDate, setSignatureDate] = useState('');
  const [msValue, setMsValue] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const invoiceRef = useRef<HTMLDivElement>(null);

  // Calculate total whenever items change
  useEffect(() => {
    const calculateTotal = () => {
      let totalAmount = 0;
      let totalCents = 0;

      items.forEach(item => {
        // Convert amount and cents to numbers, default to 0 if empty or invalid
        const amount = parseFloat(item.amount) || 0;
        const cents = parseInt(item.cents) || 0;

        totalAmount += amount;
        totalCents += cents;
      });

      // Handle cents overflow
      if (totalCents >= 100) {
        totalAmount += Math.floor(totalCents / 100);
        totalCents = totalCents % 100;
      }

      setTotal({
        amount: totalAmount.toString(),
        cents: totalCents.toString().padStart(2, '0')
      });
    };

    calculateTotal();
  }, [items]);

  // Update invoice number when currentInvoiceNumber changes
  useEffect(() => {
    setInvoiceNumber((currentInvoiceNumber + 1).toString().padStart(3, '0'));
  }, [currentInvoiceNumber]);

  const addNewRow = () => {
    setItems([...items, { quantity: '', description: '', amount: '', cents: '' }]);
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleDownloadPDF = async () => {
    try {
      setIsLoading(true);
      
      // Format the date properly
      const currentDate = new Date().toISOString();
      // Convert signature date to string or undefined (not null)
      const formattedSignatureDate = signatureDate ? new Date(signatureDate).toISOString() : undefined;

      // Calculate total amount from items
      const totalAmount = items.reduce((sum, item) => {
        const itemAmount = parseFloat(`${item.amount || '0'}.${item.cents || '0'}`);
        return sum + (isNaN(itemAmount) ? 0 : itemAmount);
      }, 0);

      const invoiceData: Invoice = {
        invoice_number: `INV-${invoiceNumber}`,
        client_name: msValue || 'Unknown Client',
        amount: totalAmount,
        status: 'Pending' as InvoiceStatus,
        date: currentDate,
        items: items.filter(item => item.quantity || item.description || item.amount),
        ms_value: msValue || undefined,
        received_by: receivedBy || undefined,
        receiver_name: name || undefined,
        signature_date: formattedSignatureDate // Changed from null to undefined
      };

      console.log('Saving invoice:', invoiceData);

      // Save to Supabase
      const savedInvoice = await invoiceService.createInvoice(invoiceData);
      console.log('Invoice saved successfully:', savedInvoice);

      // Generate and download PDF
      await generatePDF();

      // Close modal after successful save and download
      onClose();
    } catch (error) {
      console.error('Error handling invoice:', error);
      alert('There was an error creating the invoice. Please check the console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const generatePDF = async () => {
    try {
      setIsPrinting(true);
      const element = invoiceRef.current;
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`invoice-${invoiceNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    } finally {
      setIsPrinting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-[595px] max-h-[90vh] flex flex-col relative">
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div ref={invoiceRef} className="bg-white p-8 m-4">
            <div className="text-center mb-6">
              <h1 className="text-[24px] font-bold text-[#1a237e] mb-2">
                Kimthearchitect Consultants And
              </h1>
              <h2 className="text-[20px] text-[#1a237e] font-bold mb-3">
                Construction Logistics
              </h2>
              <p className="text-[12px] text-gray-600 mb-4">
                (Architects, Interior Designers, Project Management & Supply Of Construction Materials)
              </p>
              <div className="text-[12px] text-gray-600 space-y-1 mb-6">
                <p>KILIMANI ROAD PLAZA, KILIMANI RD, OFF MENELIK RD.</p>
                <p>P. O. BOX 51584- 00100,</p>
                <p>NAIROBI.</p>
                <p>Cell: 0719 698 588</p>
                <p>Email: kimthearchitect@gmail.com</p>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <div className="inline-block">
                <div className="bg-[#1a237e] px-6 py-2 rounded">
                  <span className="text-white text-sm font-medium block text-center w-full">
                    INVOICE
                  </span>
                </div>
              </div>
              <div className="text-[12px]">
                Date: <input type="date" className="border-b border-gray-400 ml-2" />
              </div>
            </div>

            <div className="mb-6 text-[12px]">
              <div className="flex items-center">
                <span>M/S:</span>
                <input
                  type="text"
                  value={msValue}
                  onChange={(e) => setMsValue(e.target.value)}
                  className="flex-1 ml-2 border-b border-gray-400 focus:outline-none"
                />
              </div>
            </div>

            <table className="w-full border border-gray-400 text-[12px] mb-4">
              <thead>
                <tr>
                  <th className="border border-gray-400 p-2 w-20">QUANTITY</th>
                  <th className="border border-gray-400 p-2">DESCRIPTION</th>
                  <th className="border border-gray-400 p-2 w-24">AMOUNT<br/>Kshs.</th>
                  <th className="border border-gray-400 p-2 w-16">Cts.</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} className="h-8">
                    <td className="border border-gray-400 p-2">
                      <input
                        type="text"
                        className="w-full outline-none"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      />
                    </td>
                    <td className="border border-gray-400 p-2">
                      <input
                        type="text"
                        className="w-full outline-none"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                      />
                    </td>
                    <td className="border border-gray-400 p-2">
                      <input
                        type="text"
                        className="w-full outline-none"
                        value={item.amount}
                        onChange={(e) => updateItem(index, 'amount', e.target.value)}
                      />
                    </td>
                    <td className="border border-gray-400 p-2">
                      <input
                        type="text"
                        className="w-full outline-none"
                        value={item.cents}
                        onChange={(e) => updateItem(index, 'cents', e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
                <tr className="add-row-button">
                  <td colSpan={4} className="border border-gray-400 p-2">
                    <button 
                      onClick={addNewRow}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      + Add New Row
                    </button>
                  </td>
                </tr>
                <tr>
                  <td colSpan={2} className="text-right border border-gray-400 p-2">
                    <span className="mr-4">E&O.E</span>
                    <span>No. {invoiceNumber}</span>
                  </td>
                  <td className="border border-gray-400 p-2 text-right font-bold">
                    {total.amount}
                  </td>
                  <td className="border border-gray-400 p-2 text-right font-bold">
                    {total.cents}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="text-[12px] space-y-4">
              <p>Account are due on demand.</p>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span>Received by:</span>
                  <input
                    type="text"
                    value={receivedBy}
                    onChange={(e) => setReceivedBy(e.target.value)}
                    className="flex-1 ml-2 border-b border-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center">
                  <span>Name:</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 ml-2 border-b border-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center">
                  <span>Date:</span>
                  <input
                    type="date"
                    value={signatureDate}
                    onChange={(e) => setSignatureDate(e.target.value)}
                    className="flex-1 ml-2 border-b border-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex flex-col items-end mt-4">
                  <img 
                    src="/signature.jpeg" 
                    alt="Signature" 
                    className="h-16 object-contain mb-2"
                  />
                  <p>Signature</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white p-4 border-t border-gray-200 flex justify-end space-x-3">
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
            onClick={handleDownloadPDF}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Download PDF'}
          </button>
          <button 
            className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700"
            onClick={onClose}
            disabled={isLoading}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
} 