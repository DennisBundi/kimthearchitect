'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'
import AdminNav from '../../../components/AdminNav'
import { FiTrash2 } from 'react-icons/fi'

interface Contact {
  id: string
  name: string
  email: string
  message: string
  submitted_at: string
  phone_number: string
}

export default function ContactsList() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        console.log('Starting fetch...')
        
        // Simplified query
        const { data, error } = await supabase
          .from('contacts')
          .select('id, name, email, message, submitted_at, phone_number')

        console.log('Query response:', { data, error })

        if (error) {
          console.error('Error:', error)
          throw error
        }

        if (data) {
          console.log('Data received:', data)
          setContacts(data)
        } else {
          console.log('No data received')
        }

      } catch (error: any) {
        console.error('Catch block error:', error)
        setError(error.message)
        toast.error('Failed to load contacts')
      } finally {
        setLoading(false)
      }
    }

    fetchContacts()
  }, [])

  return (
    <div className="min-h-screen bg-[#1A1F2E]">
      <AdminNav />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Contact Messages</h1>
        
        <div className="bg-gray-800/50 rounded-lg p-6 shadow-[0_0_15px_rgba(198,168,125,0.2)]">
          {loading ? (
            <p className="text-white">Loading contacts...</p>
          ) : error ? (
            <div>
              <p className="text-red-400">Error: {error}</p>
              <pre className="text-white text-sm mt-2">
                {JSON.stringify({ error }, null, 2)}
              </pre>
            </div>
          ) : contacts.length === 0 ? (
            <div>
              <p className="text-white">No contacts found.</p>
              <pre className="text-white text-sm mt-2">
                Debug info: {JSON.stringify({ contactsLength: contacts.length }, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-white">
                <thead className="border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left">Name</th>
                    <th className="px-6 py-3 text-left">Email</th>
                    <th className="px-6 py-3 text-left">Phone</th>
                    <th className="px-6 py-3 text-left">Message</th>
                    <th className="px-6 py-3 text-left">Date</th>
                    <th className="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact) => (
                    <tr key={contact.id} className="border-b border-gray-700 hover:bg-gray-700/30">
                      <td className="px-6 py-4">{contact.name}</td>
                      <td className="px-6 py-4">
                        <a href={`mailto:${contact.email}`} className="text-[#C6A87D] hover:underline">
                          {contact.email}
                        </a>
                      </td>
                      <td className="px-6 py-4">{contact.phone_number}</td>
                      <td className="px-6 py-4">
                        <div className="max-w-md overflow-hidden text-ellipsis">
                          {contact.message}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {new Date(contact.submitted_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={async () => {
                            if (window.confirm('Are you sure you want to delete this contact?')) {
                              const { error } = await supabase
                                .from('contacts')
                                .delete()
                                .eq('id', contact.id)
                              
                              if (error) {
                                toast.error('Failed to delete contact')
                              } else {
                                setContacts(contacts.filter(c => c.id !== contact.id))
                                toast.success('Contact deleted')
                              }
                            }
                          }}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <FiTrash2 size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 