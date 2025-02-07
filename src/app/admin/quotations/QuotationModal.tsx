'use client'

import { useState, useRef } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface QuotationModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string | undefined
}

interface TaskBreakdown {
  phase: string
  amount: number
  description: string
  duration: string
}

interface Breakdown {
  phase: string;
  amount: number;
  description: string;
}

interface Task {
  name: string;
  professional: string;
  duration: string;
  breakdowns: Breakdown[];
  totalAmount?: number;
}

interface Note {
  text: string;
}

interface QuotationData {
  projectId: string | undefined
  clientName: string
  date: string
  projectTitle: string
  tasks: any[] // Replace with proper task interface
  notes: any[] // Replace with proper note interface
  totalAmount: number
}

export function QuotationModal({ isOpen, onClose, projectId = undefined }: QuotationModalProps) {
  const supabase = createClientComponentClient()
  const [clientName, setClientName] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [projectTitle, setProjectTitle] = useState('')
  const [tasks, setTasks] = useState<Task[]>([{
    name: '',
    professional: '',
    duration: '',
    breakdowns: [{ phase: '', amount: 0, description: '' }]
  }])
  const [notes, setNotes] = useState<Note[]>([])
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  const addTask = () => {
    setTasks([...tasks, {
      name: '',
      professional: '',
      duration: '',
      breakdowns: [{ phase: '', amount: 0, description: '' }]
    }])
  }

  const addBreakdown = (taskIndex: number) => {
    const newTasks = [...tasks]
    newTasks[taskIndex].breakdowns.push({
      phase: '',
      amount: 0,
      description: '',
    })
    setTasks(newTasks)
  }

  const updateTask = (index: number, field: keyof Task, value: string) => {
    const newTasks = [...tasks]
    newTasks[index] = {
      ...newTasks[index],
      [field]: value
    }
    setTasks(newTasks)
  }

  const updateBreakdown = (taskIndex: number, breakdownIndex: number, field: keyof TaskBreakdown, value: string | number) => {
    const newTasks = [...tasks]
    newTasks[taskIndex].breakdowns[breakdownIndex] = {
      ...newTasks[taskIndex].breakdowns[breakdownIndex],
      [field]: value
    }
    
    // Recalculate task total
    newTasks[taskIndex].totalAmount = newTasks[taskIndex].breakdowns.reduce(
      (sum, breakdown) => sum + (breakdown.amount || 0), 
      0
    )
    
    setTasks(newTasks)
  }

  const addNote = () => {
    setNotes([...notes, { text: '' }])
  }

  const updateNote = (index: number, text: string) => {
    const newNotes = [...notes]
    newNotes[index] = { text }
    setNotes(newNotes)
  }

  const removeNote = (index: number) => {
    const newNotes = notes.filter((_, i) => i !== index)
    setNotes(newNotes)
  }

  const calculateTotalAmount = (): number => {
    return tasks.reduce((total: number, currentTask: Task) => {
      const taskTotal = currentTask.breakdowns.reduce((subtotal: number, breakdown: Breakdown) => {
        return subtotal + (breakdown.amount || 0);
      }, 0);
      
      // Optionally update the task's total
      currentTask.totalAmount = taskTotal;
      
      return total + taskTotal;
    }, 0);
  }

  const handleProjectTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Project Title Changed:', e.target.value)
    setProjectTitle(e.target.value)
  }

  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      const content = document.querySelector('[data-pdf-content]') as HTMLDivElement;
      if (!content) return;

      // Create a deep clone of the content
      const clone = content.cloneNode(true) as HTMLDivElement;
      
      // Style the clone for PDF
      clone.style.width = '210mm';
      clone.style.padding = '20mm';
      clone.style.backgroundColor = 'white';
      clone.style.position = 'fixed';
      clone.style.top = '0';
      clone.style.left = '0';
      clone.style.zIndex = '-9999';
      
      // Hide action buttons in clone
      const actionButtons = clone.querySelectorAll('.action-button');
      actionButtons.forEach(button => (button as HTMLElement).style.display = 'none');

      // Add clone to body
      document.body.appendChild(clone);

      // Wait for clone to render
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        logging: true,
        backgroundColor: '#ffffff',
        allowTaint: true,
        foreignObjectRendering: true,
        imageTimeout: 0,
        removeContainer: false,
        x: 0,
        y: 0,
        width: clone.offsetWidth,
        height: clone.offsetHeight
      });

      // Remove clone after capture
      document.body.removeChild(clone);

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Add image to PDF with proper dimensions
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, '', 'FAST');
      pdf.save(`quotation-${Date.now()}.pdf`);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleSaveQuotation = async () => {
    try {
      const supabase = createClientComponentClient();

      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No authenticated session found');
      }

      // Validate required fields
      if (!clientName || !projectTitle || tasks.length === 0) {
        alert('Please fill in all required fields');
        return;
      }

      // Format tasks and ensure all required fields are present
      const formattedTasks = tasks.map(task => {
        if (!task.name || !task.professional || !task.duration) {
          throw new Error('All task fields are required');
        }

        return {
          name: task.name,
          professional: task.professional,
          duration: task.duration,
          breakdowns: task.breakdowns.map(breakdown => ({
            phase: breakdown.phase || '',
            amount: Number(breakdown.amount) || 0,
            description: breakdown.description || ''
          }))
        };
      });

      const quotationData = {
        client_name: clientName.trim(),
        project_title: projectTitle.trim(),
        tasks: formattedTasks,
        notes: notes.map(note => ({ text: note.text || '' })),
        estimated_cost: calculateTotalAmount(),
        status: 'pending',
        date: new Date().toISOString(),
        user_id: session.user.id  // Add the user_id from the session
      };

      const { data, error } = await supabase
        .from('quotations')
        .insert([quotationData])
        .select()
        .single();

      if (error) {
        console.error('Error saving quotation:', error);
        throw new Error(`Failed to save quotation: ${error.message}`);
      }

      console.log('Quotation saved successfully:', data);
      return data;
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'Failed to save quotation');
      throw error;
    }
  };

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white rounded-lg w-[210mm] max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div data-pdf-content className="px-16 py-12">
          <div className="text-purple-600 text-center mb-6">
            <h1 className="font-bold text-2xl mb-2">
              KIMTHEARCHITECT CONSULTANTS & CONSTRUCTION LOGISTICS.
            </h1>
            <p className="mb-1">(Architects, Interior Designers and Project Managers)</p>
            <p className="mb-1">THE PREMIER NORTH PARK HUB, OFF EASTERN BYPASS</p>
            <p className="mb-1">P. O. BOX 51584– 00100, NAIROBI.</p>
            <p>Cell: 0719698588. Email: kimthearchitectlogistics@gmail.com</p>
          </div>

          <div className="mb-4 pb-6">
            <span className="font-bold mr-2">Dear</span>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="focus:outline-none pb-[10px]"
              placeholder="Name"
            />
          </div>

          <div className="mb-4 pb-6">
            <span className="font-bold mr-2">RE:</span>
            <input
              type="text"
              value={projectTitle}
              onChange={handleProjectTitleChange}
              className="focus:outline-none"
              placeholder="Project"
            />
          </div>

          <div className="mb-2 pb-6">
            <table className="w-full border border-black mb-8">
              <thead>
                <tr>
                  <th className="border border-black p-4">TASK</th>
                  <th className="border border-black p-4">PROFESSIONAL</th>
                  <th className="border border-black p-4">FEE BREAKDOWN</th>
                  <th className="border border-black p-4">DURATION</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, index) => (
                  <tr key={index}>
                    <td className="border border-black p-4">
                      <input
                        type="text"
                        value={task.name}
                        onChange={(e) => updateTask(index, 'name', e.target.value)}
                        className="w-full focus:outline-none"
                        placeholder="e.g., Architectural Design"
                      />
                    </td>
                    <td className="border border-black p-4">
                      <input
                        type="text"
                        value={task.professional}
                        onChange={(e) => updateTask(index, 'professional', e.target.value)}
                        className="w-full focus:outline-none"
                        placeholder="e.g., Senior Architect"
                      />
                    </td>
                    <td className="border border-black p-4">
                      {task.breakdowns.map((breakdown, idx) => (
                        <div key={idx} className="mb-2">
                          <input
                            type="text"
                            value={breakdown.phase}
                            onChange={(e) => updateBreakdown(index, idx, 'phase', e.target.value)}
                            className="w-full focus:outline-none mb-1"
                            placeholder="Phase"
                          />
                          <input
                            type="number"
                            value={breakdown.amount}
                            onChange={(e) => updateBreakdown(index, idx, 'amount', Number(e.target.value))}
                            className="w-full focus:outline-none mb-1"
                            placeholder="Amount"
                          />
                          <input
                            type="text"
                            value={breakdown.description}
                            onChange={(e) => updateBreakdown(index, idx, 'description', e.target.value)}
                            className="w-full focus:outline-none"
                            placeholder="Description"
                          />
                        </div>
                      ))}
                      <button
                        onClick={() => addBreakdown(index)}
                        className="text-blue-500 hover:text-blue-700 action-button"
                      >
                        + Add Breakdown
                      </button>
                    </td>
                    <td className="border border-black p-4">
                      <input
                        type="text"
                        value={task.duration}
                        onChange={(e) => updateTask(index, 'duration', e.target.value)}
                        className="w-full focus:outline-none"
                        placeholder="e.g., 2 weeks"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              onClick={addTask}
              className="text-blue-500 hover:text-blue-700 action-button"
            >
              + Add Task
            </button>
          </div>

          <div className="mb-4 pb-6">
            <div className="flex justify-between items-center">
              <span className="font-bold">TOTAL AMOUNT</span>
              <span>ksh {calculateTotalAmount().toLocaleString()}</span>
            </div>
          </div>

          <div className="mb-2 pb-6">
            <div className="font-bold mb-1">NB/</div>
            {notes.map((note, index) => (
              <div key={index} className="mb-1">
                <input
                  type="text"
                  value={note.text}
                  onChange={(e) => updateNote(index, e.target.value)}
                  className="w-full focus:outline-none pb-2"
                  placeholder="Enter note"
                />
              </div>
            ))}
            <button
              onClick={addNote}
              className="text-blue-500 hover:text-blue-700 action-button"
            >
              + Add Note
            </button>
          </div>

          <div className="mt-2">
            <p className="mb-4">Yours Sincerely,</p>
            <p className="font-bold mt-2">Arch.N.K. KIMATHI</p>
            <p>Director Kimthearchitect consultants & construction logistics.</p>
          </div>
        </div>

        <div className="flex justify-end space-x-4 p-4 px-8 bg-gray-50 rounded-b-lg">
          <button
            onClick={async () => {
              try {
                await handleSaveQuotation(); // Save first
                await handleDownloadPDF(); // Generate PDF
                onClose(); // Close the modal after successful PDF generation
              } catch (error) {
                console.error('Failed to process quotation:', error);
              }
            }}
            disabled={isGeneratingPDF}
            className="bg-[#DBA463] text-white px-4 py-2 rounded-lg hover:bg-[#c28a4f] transition-colors disabled:opacity-50"
          >
            {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}
          </button>
          <button
            onClick={onClose}
            disabled={isGeneratingPDF}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
} 