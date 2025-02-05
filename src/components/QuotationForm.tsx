'use client'

import { useState, useEffect } from 'react'
import type { QuotationData, Task, FeeBreakdown } from '@/types/quotation'

interface QuotationFormProps {
  quotationData: QuotationData;
  setQuotationData: React.Dispatch<React.SetStateAction<QuotationData>>;
}

export default function QuotationForm({ quotationData, setQuotationData }: QuotationFormProps) {
  // Calculate total amount whenever tasks change
  useEffect(() => {
    const total = quotationData.tasks.reduce((sum, task) => {
      const taskTotal = task.feeBreakdown.reduce((feeSum, fee) => {
        // Convert fee amount to number, default to 0 if invalid
        const amount = Number(fee.amount) || 0
        return feeSum + amount
      }, 0)
      return sum + taskTotal
    }, 0)

    setQuotationData(prev => ({
      ...prev,
      totalAmount: total
    }))
  }, [quotationData.tasks, setQuotationData])

  const addTask = () => {
    const newTask: Task = {
      task: '',
      professional: '',
      feeBreakdown: [{ description: '', amount: '', duration: '' }]
    }
    
    setQuotationData(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask]
    }))
  }

  const updateFeeBreakdown = (taskIndex: number, feeIndex: number, field: keyof FeeBreakdown, value: string) => {
    setQuotationData(prev => {
      const newTasks = [...prev.tasks]
      newTasks[taskIndex].feeBreakdown[feeIndex][field] = value
      return { ...prev, tasks: newTasks }
    })
  }

  const addFeeBreakdown = (taskIndex: number) => {
    const newFeeBreakdown: FeeBreakdown = { description: '', amount: '', duration: '' }
    
    setQuotationData(prev => {
      const newTasks = [...prev.tasks]
      newTasks[taskIndex].feeBreakdown.push(newFeeBreakdown)
      return { ...prev, tasks: newTasks }
    })
  }

  const updateRecipientName = (name: string) => {
    setQuotationData(prev => ({
      ...prev,
      recipientName: name
    }))
  }

  return (
    <div className="bg-white/5 p-6 rounded-lg">
      {/* Company Header - Read Only */}
      <div className="mb-8 text-center text-white">
        <h1 className="text-xl font-bold text-[#DBA463]">{quotationData.companyDetails.name}</h1>
        <p className="text-sm">(Architects, Interior Designers and Project Managers)</p>
        <p>{quotationData.companyDetails.address}</p>
        <p>{quotationData.companyDetails.poBox}</p>
        <p>{quotationData.companyDetails.contact}</p>
      </div>

      {/* Date */}
      <div className="mb-6">
        <label className="block text-white mb-2">Date:</label>
        <input
          type="date"
          className="bg-white/10 p-2 rounded w-48 text-white"
          value={quotationData.date}
          onChange={(e) => setQuotationData(prev => ({ ...prev, date: e.target.value }))}
        />
      </div>

      {/* Updated Project Title (RE:) Section */}
      <div className="mb-4">
        <div className="flex items-center gap-4">
          <span className="text-white font-bold min-w-[40px]">RE:</span>
          <input
            type="text"
            className="bg-white/10 p-2 rounded flex-1 text-white uppercase border-b-2 border-[#DBA463]"
            value={quotationData.projectTitle}
            onChange={(e) => setQuotationData(prev => ({ 
              ...prev, 
              projectTitle: e.target.value.toUpperCase() 
            }))}
            placeholder="DESIGN QUOTATION FOR THE PROPOSED..."
          />
        </div>
      </div>

      {/* Salutation Section */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-white">Dear</span>
            <select
              className="bg-white/10 p-2 rounded text-white min-w-[120px]"
              value={quotationData.salutation || 'Sir/Madam'}
              onChange={(e) => setQuotationData(prev => ({ ...prev, salutation: e.target.value }))}
            >
              <option value="Sir/Madam">Sir/Madam</option>
              <option value="Sir">Sir</option>
              <option value="Madam">Madam</option>
            </select>
          </div>
          <input
            type="text"
            placeholder="Recipient Name (optional)"
            className="bg-white/10 p-2 rounded flex-1 text-white"
            value={quotationData.recipientName || ''}
            onChange={(e) => updateRecipientName(e.target.value)}
          />
        </div>
      </div>

      {/* Tasks Table */}
      <div className="mb-8">
        <table className="w-full border-collapse text-white">
          <thead>
            <tr>
              <th className="border border-white/20 p-2">TASK</th>
              <th className="border border-white/20 p-2">PROFESSIONAL</th>
              <th className="border border-white/20 p-2">FEE BREAKDOWN</th>
              <th className="border border-white/20 p-2">DURATION</th>
            </tr>
          </thead>
          <tbody>
            {quotationData.tasks.map((task, taskIndex) => (
              <tr key={taskIndex}>
                <td className="border border-white/20 p-2">
                  <input
                    type="text"
                    className="bg-transparent w-full"
                    value={task.task}
                    onChange={(e) => {
                      const newTasks = [...quotationData.tasks]
                      newTasks[taskIndex].task = e.target.value
                      setQuotationData(prev => ({ ...prev, tasks: newTasks }))
                    }}
                  />
                </td>
                <td className="border border-white/20 p-2">
                  <input
                    type="text"
                    className="bg-transparent w-full"
                    value={task.professional}
                    onChange={(e) => {
                      const newTasks = [...quotationData.tasks]
                      newTasks[taskIndex].professional = e.target.value
                      setQuotationData(prev => ({ ...prev, tasks: newTasks }))
                    }}
                  />
                </td>
                <td className="border border-white/20 p-2">
                  {task.feeBreakdown.map((fee, feeIndex) => (
                    <div key={feeIndex} className="mb-2">
                      <input
                        type="text"
                        className="bg-transparent w-full mb-1"
                        placeholder="Description"
                        value={fee.description}
                        onChange={(e) => updateFeeBreakdown(taskIndex, feeIndex, 'description', e.target.value)}
                      />
                      <input
                        type="number"
                        className="bg-transparent w-full"
                        placeholder="Amount (KSH)"
                        value={fee.amount}
                        onChange={(e) => updateFeeBreakdown(taskIndex, feeIndex, 'amount', e.target.value)}
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addFeeBreakdown(taskIndex)}
                    className="text-[#DBA463] text-sm"
                  >
                    + Add Fee Breakdown
                  </button>
                </td>
                <td className="border border-white/20 p-2">
                  <input
                    type="text"
                    className="bg-transparent w-full"
                    value={task.feeBreakdown[0]?.duration || ''}
                    onChange={(e) => updateFeeBreakdown(taskIndex, 0, 'duration', e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          type="button"
          onClick={addTask}
          className="mt-4 text-[#DBA463]"
        >
          + Add Task
        </button>
      </div>

      {/* Total Amount - Read Only */}
      <div className="mb-8 text-white">
        <h3 className="text-lg font-bold">TOTAL AMOUNT: KSH {quotationData.totalAmount.toLocaleString()}</h3>
      </div>

      {/* Notes */}
      <div className="mb-8">
        <h4 className="font-bold text-white mb-2">NB/</h4>
        {quotationData.notes.map((note, index) => (
          <div key={index} className="mb-2">
            <input
              type="text"
              className="bg-white/10 p-2 rounded w-full text-white"
              value={note}
              onChange={(e) => {
                const newNotes = [...quotationData.notes]
                newNotes[index] = e.target.value
                setQuotationData(prev => ({ ...prev, notes: newNotes }))
              }}
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => setQuotationData(prev => ({ ...prev, notes: [...prev.notes, ''] }))}
          className="text-[#DBA463] text-sm"
        >
          + Add Note
        </button>
      </div>

      {/* Signature - Read Only */}
      <div className="mt-8 text-white">
        <p>Yours Sincerely,</p>
        <p className="font-bold">Arch.N.K. KIMATHI</p>
        <p>Director Mwonto consultants & construction logistics.</p>
      </div>
    </div>
  )
} 