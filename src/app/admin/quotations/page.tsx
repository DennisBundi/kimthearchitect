'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { QuotationModal } from './QuotationModal'
import { Trash2, Pencil } from 'lucide-react'
import { EditQuotationModal } from './EditQuotationModal'

// Define the Quotation interface
interface Quotation {
  id: string
  client_name: string
  project_title: string
  project_id?: string
  date: string
  created_at: string
  estimated_cost: number
  status: string
  tasks: Task[]
  notes: Note[]
}

interface Task {
  name: string
  professional: string
  duration: string
  breakdowns: Breakdown[]
}

interface Breakdown {
  phase: string
  amount: number
  description: string
}

interface Note {
  text: string
}

export default function QuotationsPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [lastQuotationNumber, setLastQuotationNumber] = useState(0)
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(undefined)
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchQuotations()
  }, [])

  const fetchQuotations = async () => {
    try {
      const { data, error } = await supabase
        .from('quotations')
        .select(`
          *,
          projects:project_id (name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setQuotations(data || [])
    } catch (error) {
      console.error('Error fetching quotations:', error)
    }
  }

  const handleDownloadPDF = async (quotationData: any) => {
    try {
      // First save to Supabase
      const { data, error } = await supabase
        .from('quotations')
        .insert([{
          project_id: quotationData.projectId,
          client_name: quotationData.clientName,
          date: quotationData.date,
          project_title: quotationData.projectTitle,
          tasks: quotationData.tasks,
          notes: quotationData.notes,
          estimated_cost: quotationData.totalAmount,
          status: 'pending',
          details: JSON.stringify({
            tasks: quotationData.tasks,
            notes: quotationData.notes,
            clientName: quotationData.clientName,
            projectTitle: quotationData.projectTitle
          })
        }])
        .select()

      if (error) {
        throw error
      }

      // Then trigger PDF download
      // Your existing PDF generation code here
      console.log('Quotation saved:', data)
      
    } catch (error) {
      console.error('Error saving quotation:', error)
    }
  }

  const handleEdit = (quotation: Quotation) => {
    setSelectedQuotation(quotation)
    setIsEditModalOpen(true)
  }

  const handleUpdate = async () => {
    const { data: updatedQuotations } = await supabase
      .from('quotations')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (updatedQuotations) {
      setQuotations(updatedQuotations as Quotation[])
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this quotation?')) {
      const { error } = await supabase
        .from('quotations')
        .delete()
        .eq('id', id)

      if (error) {
        alert('Error deleting quotation')
        console.error('Error:', error)
      } else {
        const updatedQuotations = quotations.filter(quote => quote.id !== id)
        setQuotations(updatedQuotations)
      }
    }
  }

  return (
    <div className="bg-white/5 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'all'
                ? 'bg-[#DBA463] text-white'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            All Quotations
          </button>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#DBA463] text-white px-4 py-2 rounded-lg hover:bg-[#c28a4f] transition-colors"
        >
          Create New Quotation
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-gray-300">
          <thead>
            <tr className="text-gray-400 border-b border-gray-700">
              <th className="text-left p-4 text-sm font-medium">ID</th>
              <th className="text-left p-4 text-sm font-medium">Client</th>
              <th className="text-left p-4 text-sm font-medium">Project</th>
              <th className="text-left p-4 text-sm font-medium">Amount</th>
              <th className="text-left p-4 text-sm font-medium">Status</th>
              <th className="text-left p-4 text-sm font-medium">Date</th>
              <th className="text-left p-4 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {quotations.map((quotation) => (
              <tr key={quotation.id} className="border-b border-gray-700 hover:bg-gray-800/30">
                <td className="p-4 text-gray-400">{quotation.id}</td>
                <td className="p-4">{quotation.client_name}</td>
                <td className="p-4">{quotation.project_title}</td>
                <td className="p-4 text-gray-300">ksh {quotation.estimated_cost?.toLocaleString()}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    quotation.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 
                    quotation.status === 'approved' ? 'bg-green-500/20 text-green-400' : 
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {quotation.status}
                  </span>
                </td>
                <td className="p-4 text-gray-400">{new Date(quotation.date).toLocaleDateString()}</td>
                <td className="p-4">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleDelete(quotation.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      title="Delete quotation"
                    >
                      <Trash2 size={18} />
                    </button>
                    <button
                      onClick={() => handleEdit(quotation)}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                      title="Edit quotation"
                    >
                      <Pencil size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <QuotationModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            fetchQuotations()
          }}
          projectId={selectedProjectId}
        />
      )}

      {selectedQuotation && (
        <EditQuotationModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedQuotation(null)
          }}
          quotation={selectedQuotation}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  )
} 