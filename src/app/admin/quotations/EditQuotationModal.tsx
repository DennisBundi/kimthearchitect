import { useState, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface Note {
  text: string;
}

interface Task {
  name: string;
  professional: string;
  duration: string;
  breakdowns: Breakdown[];
}

interface Breakdown {
  phase: string;
  amount: number;
  description: string;
}

interface EditQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: {
    id: string;
    client_name: string;
    project_title: string;
    tasks: Task[];
    notes: Note[];
    estimated_cost: number;
  };
  onUpdate: () => void;
}

export function EditQuotationModal({ isOpen, onClose, quotation, onUpdate }: EditQuotationModalProps) {
  const [clientName, setClientName] = useState(quotation.client_name);
  const [projectTitle, setProjectTitle] = useState(quotation.project_title);
  const [tasks, setTasks] = useState<Task[]>(quotation.tasks);
  const [notes, setNotes] = useState<Note[]>(quotation.notes);
  const [isSaving, setIsSaving] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const addTask = () => {
    setTasks([...tasks, { name: '', professional: '', duration: '', breakdowns: [] }]);
  };

  const updateTask = (index: number, field: keyof Task, value: string) => {
    const newTasks = [...tasks];
    newTasks[index] = { ...newTasks[index], [field]: value };
    setTasks(newTasks);
  };

  const addBreakdown = (taskIndex: number) => {
    const newTasks = [...tasks];
    newTasks[taskIndex].breakdowns.push({ phase: '', amount: 0, description: '' });
    setTasks(newTasks);
  };

  const updateBreakdown = (taskIndex: number, breakdownIndex: number, field: keyof Breakdown, value: string | number) => {
    const newTasks = [...tasks];
    newTasks[taskIndex].breakdowns[breakdownIndex] = {
      ...newTasks[taskIndex].breakdowns[breakdownIndex],
      [field]: value
    };
    setTasks(newTasks);
  };

  const addNote = () => {
    setNotes([...notes, { text: '' }]);
  };

  const updateNote = (index: number, text: string) => {
    const newNotes = [...notes];
    newNotes[index] = { text };
    setNotes(newNotes);
  };

  const calculateTotalAmount = (): number => {
    return tasks.reduce((total, task) => {
      return total + task.breakdowns.reduce((subtotal, breakdown) => subtotal + (breakdown.amount || 0), 0);
    }, 0);
  };

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      const supabase = createClientComponentClient();

      // Prepare the update data without updated_at field
      const updateData = {
        client_name: clientName,
        project_title: projectTitle,
        tasks: tasks.map(task => ({
          name: task.name,
          professional: task.professional,
          duration: task.duration,
          breakdowns: task.breakdowns.map(breakdown => ({
            phase: breakdown.phase,
            amount: Number(breakdown.amount),
            description: breakdown.description
          }))
        })),
        notes: notes.map(note => ({ text: note.text })),
        estimated_cost: calculateTotalAmount()
      };

      const { error } = await supabase
        .from('quotations')
        .update(updateData)
        .eq('id', quotation.id);

      if (error) {
        console.error('Update error:', error);
        throw new Error('Failed to update quotation');
      }

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating quotation:', error);
      alert('Failed to update quotation');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div 
        ref={modalRef} 
        className="bg-white rounded-lg w-[210mm] max-h-[90vh] overflow-y-auto scrollbar-hide"
      >
        <div data-pdf-content className="p-16">
          {/* Header */}
          <div className="text-purple-600 text-center mb-12">
            <h1 className="font-bold text-2xl mb-4">KIMTHEARCHITECT CONSULTANTS & CONSTRUCTION LOGISTICS.</h1>
            <p className="mb-2">(Architects, Interior Designers and Project Managers)</p>
            <p className="mb-2">THE PREMIER NORTH PARK HUB, OFF EASTERN BYPASS</p>
            <p className="mb-2">P. O. BOX 51584– 00100, NAIROBI.</p>
            <p>Cell: 0719698588. Email: kimthearchitectlogistics@gmail.com</p>
          </div>

          {/* Client Name */}
          <div className="mb-6">
            <span className="font-bold mr-2">Dear</span>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="border-b border-black focus:outline-none"
              placeholder="Name"
            />
          </div>

          {/* Project Title */}
          <div className="mb-6">
            <span className="font-bold mr-2">RE:</span>
            <input
              type="text"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              className="border-b border-black focus:outline-none"
              placeholder="Project Title"
            />
          </div>

          {/* Tasks */}
          <div className="mb-8">
            <table className="w-full mb-4">
              <thead>
                <tr>
                  <th className="text-left">TASK</th>
                  <th className="text-left">PROFESSIONAL</th>
                  <th className="text-left">FEE BREAKDOWN</th>
                  <th className="text-left">DURATION</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, taskIndex) => (
                  <tr key={taskIndex}>
                    <td className="py-2">
                      <input
                        type="text"
                        value={task.name}
                        onChange={(e) => updateTask(taskIndex, 'name', e.target.value)}
                        className="border-b border-black focus:outline-none"
                        placeholder="e.g., Archit"
                      />
                    </td>
                    <td className="py-2">
                      <input
                        type="text"
                        value={task.professional}
                        onChange={(e) => updateTask(taskIndex, 'professional', e.target.value)}
                        className="border-b border-black focus:outline-none"
                        placeholder="e.g., Senior Archite"
                      />
                    </td>
                    <td className="py-2">
                      {task.breakdowns.map((breakdown, breakdownIndex) => (
                        <div key={breakdownIndex} className="mb-2">
                          <input
                            type="text"
                            value={breakdown.phase}
                            onChange={(e) => updateBreakdown(taskIndex, breakdownIndex, 'phase', e.target.value)}
                            className="border-b border-black focus:outline-none mb-1"
                            placeholder="Phase"
                          />
                          <input
                            type="number"
                            value={breakdown.amount}
                            onChange={(e) => updateBreakdown(taskIndex, breakdownIndex, 'amount', parseFloat(e.target.value))}
                            className="border-b border-black focus:outline-none mb-1"
                            placeholder="0"
                          />
                          <input
                            type="text"
                            value={breakdown.description}
                            onChange={(e) => updateBreakdown(taskIndex, breakdownIndex, 'description', e.target.value)}
                            className="border-b border-black focus:outline-none"
                            placeholder="Description"
                          />
                        </div>
                      ))}
                      <button
                        onClick={() => addBreakdown(taskIndex)}
                        className="text-blue-500 hover:text-blue-700 text-sm"
                      >
                        + Add Breakdown
                      </button>
                    </td>
                    <td className="py-2">
                      <input
                        type="text"
                        value={task.duration}
                        onChange={(e) => updateTask(taskIndex, 'duration', e.target.value)}
                        className="border-b border-black focus:outline-none"
                        placeholder="e.g., 2 weeks"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              onClick={addTask}
              className="text-blue-500 hover:text-blue-700"
            >
              + Add Task
            </button>
          </div>

          {/* Total Amount */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <span className="font-bold">TOTAL AMOUNT</span>
              <span>ksh {calculateTotalAmount().toLocaleString()}</span>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-8">
            <div className="font-bold mb-2">NB/</div>
            {notes.map((note, index) => (
              <div key={index} className="mb-2">
                <input
                  type="text"
                  value={note.text}
                  onChange={(e) => updateNote(index, e.target.value)}
                  className="w-full border-b border-black focus:outline-none"
                  placeholder="Enter note"
                />
              </div>
            ))}
            <button
              onClick={addNote}
              className="text-blue-500 hover:text-blue-700"
            >
              + Add Note
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-6 p-8 px-16 bg-gray-50 rounded-b-lg">
          <button
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="bg-[#DBA463] text-white px-6 py-3 rounded-lg hover:bg-[#c28a4f] transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 