'use client';
import { useState, FormEvent } from 'react';

interface QuotationData {
  tasks: Array<{
    task: string;
    professional: string;
    feeBreakdown: number;
    duration: string;
  }>;
  totalAmount: number;
  date: string;
  reference: string;
  recipientEmail: string;
}

export default function QuotationPage() {
  // Define all your state variables
  const [tasks, setTasks] = useState<QuotationData['tasks']>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [date, setDate] = useState<string>('');
  const [reference, setReference] = useState<string>('');
  const [recipientEmail, setRecipientEmail] = useState<string>('');

  const handleSendQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('Starting quotation send process...');
      
      const response = await fetch('/api/send-quotation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientEmail: recipientEmail,
          quotationData: {
            pdfPath: 'path/to/your/pdf', // Make sure this is the correct path
            reference: reference,
            date: date,
            totalAmount: totalAmount
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown Error' }));
        throw new Error(`Failed to send email: ${response.status} - ${errorData.message}`);
      }

      const result = await response.json();
      console.log('Email sent successfully:', result);
      alert('Quotation sent successfully!');
      
    } catch (error) {
      console.error('Error sending quotation:', error);
      alert('Failed to send quotation. Please try again.');
    }
  };

    function handleTaskChange(index: number, arg1: string, value: string): void {
        throw new Error('Function not implemented.');
    }

  return (
    <form onSubmit={handleSendQuotation}>
      <div>
        <label htmlFor="recipientEmail">Recipient Email:</label>
        <input
          id="recipientEmail"
          name="recipientEmail"
          type="email"
          value={recipientEmail}
          onChange={(e) => setRecipientEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="reference">RE:</label>
        <input
          id="reference"
          name="reference"
          type="text"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="date">Date:</label>
        <input
          id="date"
          name="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      {/* Add task form fields */}
      <div>
        {tasks.map((task, index) => (
          <div key={index}>
            <input
              id={`task-${index}`}
              name={`task-${index}`}
              value={task.task}
              onChange={(e) => handleTaskChange(index, 'task', e.target.value)}
            />
            {/* Add other task fields similarly */}
          </div>
        ))}
      </div>

      <div>
        <button type="submit">Send Quotation</button>
        <button type="button" onClick={() => {}}>Cancel</button>
      </div>
    </form>
  );
} 