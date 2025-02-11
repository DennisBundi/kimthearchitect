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
    breakdowns: [{ description: '', amount: 0 }]
  }])
  const [notes, setNotes] = useState<Note[]>([])
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  const addTask = () => {
    setTasks([...tasks, {
      name: '',
      professional: '',
      duration: '',
      breakdowns: [{ description: '', amount: 0 }]
    }])
  }

  const addBreakdown = (taskIndex: number) => {
    const newTasks = [...tasks]
    newTasks[taskIndex].breakdowns.push({
      description: '',
      amount: 0,
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

      const modalContent = document.querySelector('[data-pdf-content]') as HTMLDivElement;
      if (!modalContent) {
        throw new Error('Could not find modal content');
      }

      // Create a deep clone of the content
      const clone = modalContent.cloneNode(true) as HTMLDivElement;

      // First, remove all existing Ksh spans to prevent duplication
      clone.querySelectorAll('.flex-nowrap').forEach(wrapper => {
        const existingKsh = wrapper.querySelector('span');
        if (existingKsh) {
          existingKsh.remove();
        }
      });

      // Convert all textareas and inputs to properly formatted div elements
      clone.querySelectorAll('textarea, input').forEach((element) => {
        const isTextArea = element instanceof HTMLTextAreaElement;
        const isInput = element instanceof HTMLInputElement;
        
        if (!isTextArea && !isInput) return;

        const div = document.createElement('div');
        
        // Preserve whitespace and line breaks
        div.style.whiteSpace = 'pre-wrap';
        div.style.wordBreak = 'break-word';
        div.style.minHeight = '20px';
        
        // Copy styles from the original element
        const computedStyle = window.getComputedStyle(element);
        div.style.width = computedStyle.width;
        div.style.padding = computedStyle.padding;
        div.style.margin = computedStyle.margin;
        
        // Special handling for amount inputs in fee breakdown
        if (isInput && element.type === 'number' && element.closest('td')) {
          div.style.fontWeight = 'bold';
          const amount = Number(element.value);
          // Add Ksh prefix directly to the formatted amount
          div.textContent = `Ksh ${amount.toLocaleString()}`;
        } else {
          div.textContent = isTextArea || isInput ? element.value : '';
        }
        
        // Special handling for table cells
        if (element.closest('td')) {
          div.style.width = '100%';
        }
        
        if (element.parentNode) {
          element.parentNode.replaceChild(div, element);
        }
      });

      // Style the clone for PDF
      clone.style.width = '210mm';
      clone.style.padding = '20mm';
      clone.style.backgroundColor = 'white';
      clone.style.position = 'fixed';
      clone.style.top = '0';
      clone.style.left = '0';
      clone.style.zIndex = '-9999';

      // Ensure table cells can grow with content
      clone.querySelectorAll('td').forEach((td) => {
        td.style.height = 'auto';
        td.style.minHeight = '30px';
        td.style.verticalAlign = 'top';
        td.style.whiteSpace = 'pre-wrap';
        td.style.wordBreak = 'break-word';
      });

      // Update the signature image in the clone
      const signatureImg = clone.querySelector('img[alt="Signature"]') as HTMLImageElement;
      if (signatureImg) {
        const newSignature = new Image();
        newSignature.src = '/signature.jpeg';
        newSignature.alt = 'Signature';
        newSignature.className = signatureImg.className;
        signatureImg.parentNode?.replaceChild(newSignature, signatureImg);

        // Wait for the image to load
        await new Promise((resolve) => {
          newSignature.onload = resolve;
        });
      }

      // Hide buttons and unnecessary elements in clone
      const buttonsToHide = clone.querySelectorAll('button, .action-button, .close-button');
      buttonsToHide.forEach(button => (button as HTMLElement).style.display = 'none');

      // Add clone to body
      document.body.appendChild(clone);

      // Wait longer for complex content to render
      await new Promise(resolve => setTimeout(resolve, 1500));

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        allowTaint: true,
        imageTimeout: 5000,
        windowWidth: clone.scrollWidth,
        windowHeight: clone.scrollHeight,
        onclone: (clonedDoc) => {
          // Additional styling for the cloned document
          const cells = clonedDoc.querySelectorAll('td');
          cells.forEach((cell) => {
            cell.style.height = 'auto';
            cell.style.wordBreak = 'break-word';
          });
        }
      });

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

      // Save the PDF
      console.log('Saving PDF...');
      pdf.save(`quotation-${Date.now()}.pdf`);
      console.log('PDF saved successfully');

      // Close modal after both operations succeed
      onClose();
    } catch (error) {
      console.error('Failed to process quotation:', error);
      alert(error instanceof Error ? error.message : 'Failed to process quotation. Please try again.');
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
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img
                src="/mainlogo.svg"
                alt="Kimthearchitect Logo"
                className="h-20 object-contain"
              />
            </div>
            <h2 className="text-xl font-semibold text-[#1a237e] mb-4">
              Kimthearchitect LTD
            </h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p>THE PREMIER NORTH PARK HUB, OFF EASTERN BYPASS</p>
              <p>P. O. BOX 51584– 00100, NAIROBI</p>
              <p>Cell: 0719 698 568</p>
              <p>Email: Kimthearchitect0@gmail.com</p>
            </div>
          </div>

          <div className="mb-4 pb-6 flex items-center">
            <span className="font-bold mr-2">Dear</span>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="focus:outline-none border-b border-gray-300 flex-1"
              placeholder="Name"
            />
          </div>

          <div className="mb-4 pb-6 flex items-center">
            <span className="font-bold mr-2">RE:</span>
            <input
              type="text"
              value={projectTitle}
              onChange={(e) => {
                // Convert to uppercase before setting
                setProjectTitle(e.target.value.toUpperCase())
              }}
              className="focus:outline-none border-b border-black flex-1 uppercase"
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
                      <textarea
                        value={task.name}
                        onChange={(e) => updateTask(index, 'name', e.target.value)}
                        className="w-full focus:outline-none resize-none overflow-hidden"
                        placeholder="e.g., Architectural Design"
                        rows={1}
                        onInput={(e) => {
                          // Auto-adjust height
                          const target = e.target as HTMLTextAreaElement;
                          target.style.height = 'auto';
                          target.style.height = `${target.scrollHeight}px`;
                        }}
                      />
                    </td>
                    <td className="border border-black p-4">
                      <textarea
                        value={task.professional}
                        onChange={(e) => updateTask(index, 'professional', e.target.value)}
                        className="w-full focus:outline-none resize-none overflow-hidden"
                        placeholder="e.g., Senior Architect"
                        rows={1}
                        onInput={(e) => {
                          const target = e.target as HTMLTextAreaElement;
                          target.style.height = 'auto';
                          target.style.height = `${target.scrollHeight}px`;
                        }}
                      />
                    </td>
                    <td className="border border-black p-4">
                      {task.breakdowns.map((breakdown, idx) => (
                        <div key={idx} className="mb-2">
                          <textarea
                            value={breakdown.description}
                            onChange={(e) => updateBreakdown(index, idx, 'description', e.target.value)}
                            className="w-full focus:outline-none resize-none overflow-hidden mb-1"
                            placeholder="Description"
                            rows={1}
                            onInput={(e) => {
                              const target = e.target as HTMLTextAreaElement;
                              target.style.height = 'auto';
                              target.style.height = `${target.scrollHeight}px`;
                            }}
                          />
                          <div className="flex items-center w-full">
                            <div className="flex items-center flex-nowrap min-w-[100px]">
                              <span className="whitespace-nowrap">Ksh</span>
                              <input
                                type="number"
                                value={breakdown.amount}
                                onChange={(e) => updateBreakdown(index, idx, 'amount', Number(e.target.value))}
                                className="w-full focus:outline-none ml-1 font-bold"
                                placeholder="Amount"
                                style={{ minWidth: '80px' }}
                              />
                            </div>
                          </div>
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
                      <textarea
                        value={task.duration}
                        onChange={(e) => updateTask(index, 'duration', e.target.value)}
                        className="w-full focus:outline-none resize-none overflow-hidden"
                        placeholder="e.g., 2 weeks"
                        rows={1}
                        onInput={(e) => {
                          const target = e.target as HTMLTextAreaElement;
                          target.style.height = 'auto';
                          target.style.height = `${target.scrollHeight}px`;
                        }}
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
              <span className="font-bold">Ksh {calculateTotalAmount().toLocaleString()}</span>
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

          <div className="mt-8">
            <p className="mb-4">Yours Sincerely,</p>
            <div className="flex flex-col items-end">
              <img 
                src="/signature.jpeg" 
                alt="Signature" 
                className="h-16 object-contain mb-2"
              />
              <p className="font-bold">Arch.N.K. KIMATHI</p>
              <p>Director Kimthearchitect consultants & construction logistics.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 p-4 px-8 bg-gray-50 rounded-b-lg">
          <button
            onClick={async () => {
              try {
                await handleSaveQuotation();
                await handleDownloadPDF();
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
