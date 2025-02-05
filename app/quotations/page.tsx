'use client';
import { useState, FormEvent } from 'react';

interface Task {
  task: string;
  professional: string;
  feeBreakdown: number;
  duration: string;
}

export default function QuotationsPage() {
  // Form state
  const [salutation, setSalutation] = useState('Sir');
  const [recipientName, setRecipientName] = useState('');
  const [reference, setReference] = useState('');
  const [date, setDate] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  
  // Task state
  const [task, setTask] = useState('');
  const [professional, setProfessional] = useState('');
  const [feeBreakdown, setFeeBreakdown] = useState(0);
  const [duration, setDuration] = useState('');

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          salutation,
          recipientName,
          reference,
          date,
          totalAmount,
          tasks: [{
            task,
            professional,
            feeBreakdown,
            duration
          }]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quotation-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF');
    }
  };

  return (
    <div>
      <form onSubmit={(e) => e.preventDefault()}>
        {/* Salutation and Recipient */}
        <div className="flex gap-4 items-end mb-4">
          <div>
            <label className="text-white mb-2 block">Dear</label>
            <select
              value={salutation}
              onChange={(e) => setSalutation(e.target.value)}
              className="bg-gray-700 text-white px-4 py-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer hover:bg-gray-600"
              style={{
                WebkitAppearance: 'none',
                MozAppearance: 'none'
              }}
            >
              <option value="Sir" className="bg-gray-700 text-white hover:bg-gray-600">Sir</option>
              <option value="Madam" className="bg-gray-700 text-white hover:bg-gray-600">Madam</option>
              <option value="Sir/Madam" className="bg-gray-700 text-white hover:bg-gray-600">Sir/Madam</option>
            </select>
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Recipient Name"
              className="w-full bg-gray-700 text-white px-4 py-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Reference and Date */}
        <div className="flex gap-4 mb-4">
          <div>
            <label htmlFor="reference">Reference</label>
            <input
              id="reference"
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="date">Date</label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        {/* Task Details */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="task">Task</label>
            <input
              id="task"
              type="text"
              value={task}
              onChange={(e) => setTask(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="professional">Professional</label>
            <input
              id="professional"
              type="text"
              value={professional}
              onChange={(e) => setProfessional(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="feeBreakdown">Fee Breakdown</label>
            <input
              id="feeBreakdown"
              type="number"
              value={feeBreakdown}
              onChange={(e) => setFeeBreakdown(Number(e.target.value))}
            />
          </div>
          <div>
            <label htmlFor="duration">Duration</label>
            <input
              id="duration"
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>
        </div>

        {/* Total Amount */}
        <div className="mb-4">
          <label htmlFor="totalAmount">Total Amount</label>
          <input
            id="totalAmount"
            type="number"
            value={totalAmount}
            onChange={(e) => setTotalAmount(Number(e.target.value))}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleDownloadPDF}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Download PDF
          </button>
        </div>
      </form>
    </div>
  );
} 