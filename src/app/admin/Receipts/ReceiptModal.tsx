'use client'

import { useState, useRef } from 'react'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import React from 'react';
import { receiptService } from '@/services/receiptService'

interface ReceiptItem {
  quantity: string;
  description: string;
  amount: string;
  cents: string;
}

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentReceiptNumber?: number;
}

export const ReceiptModal = ({ isOpen, onClose, currentReceiptNumber = 0 }: ReceiptModalProps) => {
  const [items, setItems] = useState([{
    quantity: '',
    description: '',
    amount: '0',
    cents: '00'
  }]);
  const [msValue, setMsValue] = useState('');
  const [receivedBy, setReceivedBy] = useState('');
  const [name, setName] = useState('');
  const [signatureDate, setSignatureDate] = useState('');
  const receiptRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    try {
      // Calculate total amount from items
      const totalAmount = items.reduce((sum, item) => {
        const itemAmount = parseFloat(item.amount) || 0; // Handle potential NaN
        return sum + itemAmount;
      }, 0);

      const receiptData = {
        receipt_number: `RCP-${String(currentReceiptNumber + 1).padStart(3, '0')}`,
        client_name: name,
        amount: totalAmount, // Use the calculated total directly
        status: 'Completed' as const,
        date: new Date().toISOString().split('T')[0],
        items: items.map(item => ({
          quantity: item.quantity,
          description: item.description,
          amount: item.amount,
          cents: item.cents || '00' // Provide default value for cents
        })),
        ms_value: msValue,
        received_by: receivedBy,
        receiver_name: name,
        signature_date: signatureDate
      };

      // Validate amount before saving
      if (totalAmount <= 0) {
        throw new Error('Total amount must be greater than 0');
      }

      // Save to Supabase
      await receiptService.createReceipt(receiptData)

      const element = receiptRef.current;
      if (!element) return;

      const addRowButton = element.querySelector('.add-row-button');
      if (addRowButton) {
        addRowButton.classList.add('hidden');
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      if (addRowButton) {
        addRowButton.classList.remove('hidden');
      }

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`receipt-${currentReceiptNumber.toString().padStart(3, '0')}.pdf`);

      // Close modal and refresh the receipts list
      onClose()
    } catch (error) {
      console.error('Error saving receipt:', error)
      alert('Error saving receipt. Please try again.')
    }
  };

  const addNewRow = () => {
    setItems([...items, { quantity: '', description: '', amount: '', cents: '' }]);
  };

  const handleItemChange = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const itemAmount = parseFloat(item.amount) || 0;
      return sum + itemAmount;
    }, 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-[595px] max-h-[90vh] flex flex-col relative">
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div ref={receiptRef} className="bg-white p-8 m-4">
            {/* Company Header */}
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

            {/* Receipt Label and Date */}
            <div className="flex justify-between items-center mb-6">
              <div className="inline-block">
                <div className="bg-[#1a237e] px-6 py-2 rounded">
                  <span className="text-white text-sm font-medium block text-center w-full">
                    RECEIPT
                  </span>
                </div>
              </div>
              <div className="text-[12px]">
                Date: <input type="date" className="border-b border-gray-400 ml-2" />
              </div>
            </div>

            {/* M/S Field */}
            <div className="mb-4 text-[12px] flex items-center">
              <span>M/S:</span>
              <input
                type="text"
                value={msValue}
                onChange={(e) => setMsValue(e.target.value)}
                className="flex-1 ml-2 border-b border-gray-400 focus:outline-none"
              />
            </div>

            {/* Table */}
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
                  <tr key={index}>
                    <td>
                      <input
                        type="text"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="w-full bg-transparent border-none focus:outline-none"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        className="w-full bg-transparent border-none focus:outline-none"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={item.amount}
                        onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                        className="w-full bg-transparent border-none focus:outline-none"
                      />
                    </td>
                    <td className="border border-gray-400 p-2">
                      <input
                        type="text"
                        className="w-full outline-none"
                        value={item.cents}
                        onChange={(e) => handleItemChange(index, 'cents', e.target.value)}
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
                    <span>No. {currentReceiptNumber.toString().padStart(3, '0')}</span>
                  </td>
                  <td className="border border-gray-400 p-2 text-right font-bold">
                    {calculateTotal().toLocaleString('en-KE', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </td>
                  <td className="border border-gray-400 p-2 text-right font-bold">
                    00
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Footer */}
            <div className="text-[12px] space-y-4">
              <p>Account are due on demand.</p>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span>Received by:</span>
                  <input
                    type="text"
                    value={receivedBy}
                    onChange={(e) => setReceivedBy(e.target.value)}
                    className="flex-1 ml-2 border-b border-gray-400 focus:outline-none"
                  />
                </div>
                <div className="flex items-center">
                  <span>Name:</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 ml-2 border-b border-gray-400 focus:outline-none"
                  />
                </div>
                <div className="flex items-center">
                  <span>Date:</span>
                  <input
                    type="date"
                    value={signatureDate}
                    onChange={(e) => setSignatureDate(e.target.value)}
                    className="flex-1 ml-2 border-b border-gray-400 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col items-end mt-6">
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

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-white p-4 border-t border-gray-200 flex justify-end space-x-3">
          <button 
            className="bg-[#DBA463] text-white px-4 py-2 rounded-lg hover:bg-[#c28a4f] transition-colors"
            onClick={handleDownloadPDF}
          >
            Download Receipt PDF
          </button>
          <button 
            className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}; 