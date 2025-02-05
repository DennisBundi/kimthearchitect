'use client';
import { useState, useEffect } from 'react';

interface InvoiceItem {
  quantity: string;
  description: string;
  amount: number;
  cents: number;
}

export default function InvoicesPage() {
  const [items, setItems] = useState<InvoiceItem[]>([{
    quantity: '',
    description: '',
    amount: 0,
    cents: 0
  }]);
  const [msValue, setMsValue] = useState('');
  const [date, setDate] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('001');

  useEffect(() => {
    // Fetch the last invoice number from your database/storage
    fetchLastInvoiceNumber();
  }, []);

  const fetchLastInvoiceNumber = async () => {
    try {
      // Replace this with your actual API call
      const response = await fetch('/api/last-invoice-number');
      const data = await response.json();
      
      // Increment the last number and pad with zeros
      const nextNumber = (parseInt(data.lastNumber || '0') + 1).toString().padStart(3, '0');
      setInvoiceNumber(nextNumber);
    } catch (error) {
      console.error('Error fetching last invoice number:', error);
      // Default to '001' if there's an error
      setInvoiceNumber('001');
    }
  };

  const handleAddItem = () => {
    setItems([...items, { quantity: '', description: '', amount: 0, cents: 0 }]);
  };

  const handleGenerateInvoice = async () => {
    try {
      // Save the invoice with current number
      await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceNumber,
          msValue,
          date,
          items,
          // ... other invoice data
        }),
      });

      // Increment the invoice number for the next one
      const nextNumber = (parseInt(invoiceNumber) + 1).toString().padStart(3, '0');
      setInvoiceNumber(nextNumber);

      // Handle PDF generation or other actions
      // ... your PDF generation code ...

    } catch (error) {
      console.error('Error generating invoice:', error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl text-white mb-6">Invoices</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Content */}
        <div>
          {/* Header */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-blue-700 mb-1">Mwonto Consultants And Construction Logistics</h2>
            <p className="text-gray-600 text-sm mb-2">(Architects, Interior Designers, project Management & Supply Of Construction Materials)</p>
            <p className="mb-1">KILIMANI ROAD PLAZA, KILIMANI RD, OFF MENELIK RD.</p>
            <p className="mb-1">P. O. BOX 51584– 00100,</p>
            <p className="mb-1">NAIROBI.</p>
            <p className="mb-1">Cell: 0719 698 588</p>
            <p className="mb-1">Email: mwontologistics@gmail.com</p>
          </div>

          {/* Invoice Label */}
          <div className="flex justify-end mt-4 mb-6">
            <div className="border-2 border-blue-700 px-4 py-1">
              <span className="text-blue-700 font-bold">INVOICE</span>
            </div>
          </div>

          {/* MS and Date Section */}
          <div className="flex justify-between mb-6">
            <div className="flex-1">
              <label className="flex items-center">
                <span className="mr-2">M/S:</span>
                <input
                  type="text"
                  value={msValue}
                  onChange={(e) => setMsValue(e.target.value)}
                  className="flex-1 border-b border-gray-300 focus:outline-none"
                />
              </label>
            </div>
            <div className="ml-4">
              <label className="flex items-center">
                <span className="mr-2">Date:</span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="border-b border-gray-300 focus:outline-none"
                />
              </label>
            </div>
          </div>

          {/* Table with single starting row */}
          <table className="w-full border-2 border-blue-700 mb-4">
            <thead>
              <tr>
                <th className="border-2 border-blue-700 p-2 text-left w-24">QUANTITY</th>
                <th className="border-2 border-blue-700 p-2 text-left">DESCRIPTION</th>
                <th className="border-2 border-blue-700 p-2 text-right w-32">AMOUNT</th>
                <th className="border-2 border-blue-700 p-2 text-right w-20">Cts.</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td className="border-2 border-blue-700 p-2">
                    <input
                      type="text"
                      value={item.quantity}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[index].quantity = e.target.value;
                        setItems(newItems);
                      }}
                      className="w-full focus:outline-none"
                    />
                  </td>
                  <td className="border-2 border-blue-700 p-2">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[index].description = e.target.value;
                        setItems(newItems);
                      }}
                      className="w-full focus:outline-none"
                    />
                  </td>
                  <td className="border-2 border-blue-700 p-2">
                    <input
                      type="number"
                      value={item.amount}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[index].amount = Number(e.target.value);
                        setItems(newItems);
                      }}
                      className="w-full text-right focus:outline-none"
                    />
                  </td>
                  <td className="border-2 border-blue-700 p-2">
                    <input
                      type="number"
                      value={item.cents}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[index].cents = Number(e.target.value);
                        setItems(newItems);
                      }}
                      className="w-full text-right focus:outline-none"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Add Item Button and Total */}
          <div className="flex justify-between items-center mb-6">
            <button
              type="button"
              onClick={handleAddItem}
              className="text-blue-600 hover:text-blue-800"
            >
              + Add Item
            </button>
            <div className="flex items-center">
              <span className="mr-4 font-bold">TOTAL</span>
              <div className="border-2 border-blue-700 px-4 py-1">
                {items.reduce((sum, item) => sum + item.amount + (item.cents / 100), 0).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Footer with auto-generated number */}
          <div className="mt-8">
            <p className="mb-2">E&O.E No. {invoiceNumber}</p>
            <p className="mb-4">Account are due on demand.</p>
            <p className="mb-2">Received by:___________________________ Date:___________</p>
            <p>Name:________________________________ Signature:________</p>
          </div>

          {/* Generate Button */}
          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={handleGenerateInvoice}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Generate Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 