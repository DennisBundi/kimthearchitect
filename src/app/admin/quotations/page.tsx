'use client'

import { useState } from 'react'
import { PDFDownloadLink, pdf, BlobProvider } from '@react-pdf/renderer'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { QuotationData } from '@/types/quotation'
import QuotationForm from '@/components/QuotationForm'
import QuotationPDF from '@/components/QuotationPDF'

export default function QuotationsPage() {
  const supabase = createClientComponentClient()
  const [quotationData, setQuotationData] = useState<QuotationData>({
    companyDetails: {
      name: 'MWONTO CONSULTANTS & CONSTRUCTION LOGISTICS.',
      address: 'KILIMANI ROAD PLAZA, KILIMANI RD, OFF',
      poBox: 'MENELIK RD. P. O. BOX 51584– 00100, NAIROBI.',
      contact: 'Cell: 0719698588. Email: mwontologistics@gmail.com'
    },
    date: '',
    projectTitle: '',
    salutation: 'Sir/Madam',
    recipientName: '',
    tasks: [
      {
        task: '',
        professional: '',
        feeBreakdown: [
          {
            description: '',
            amount: '',
            duration: ''
          }
        ]
      }
    ],
    totalAmount: 0,
    notes: []
  })
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [email, setEmail] = useState('')
  const [isSending, setIsSending] = useState(false)

  const saveQuotation = async () => {
    try {
      // First, check if the storage bucket exists
      const { data: bucketExists } = await supabase
        .storage
        .getBucket('quotations')

      if (!bucketExists) {
        // Create the bucket if it doesn't exist
        await supabase
          .storage
          .createBucket('quotations', { public: false })
      }

      // Generate PDF blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        pdf(<QuotationPDF data={quotationData} />)
          .toBlob()
          .then(resolve)
          .catch(reject)
      });

      // Create unique filename
      const fileName = `quotation_${Date.now()}.pdf`

      // Upload to Supabase Storage
      const { data: storageData, error: storageError } = await supabase
        .storage
        .from('quotations')
        .upload(fileName, blob, {
          contentType: 'application/pdf',
          cacheControl: '3600'
        })

      if (storageError) {
        console.error('Storage error:', storageError)
        throw new Error(`Failed to upload PDF: ${storageError.message}`)
      }

      // Get the public URL of the uploaded file
      const { data: { publicUrl } } = supabase
        .storage
        .from('quotations')
        .getPublicUrl(fileName)

      // Save quotation metadata to database
      const { error: dbError } = await supabase
        .from('quotations')
        .insert({
          project_id: null, // You can add project selection later
          estimated_cost: Number(quotationData.totalAmount),
          details: quotationData.projectTitle,
          quotation_image: publicUrl,
          created_at: new Date().toISOString()
        })

      if (dbError) {
        console.error('Database error:', dbError)
        throw new Error(`Failed to save quotation data: ${dbError.message}`)
      }

      alert('Quotation saved successfully!')
    } catch (error) {
      console.error('Error saving quotation:', error)
      alert(error instanceof Error ? error.message : 'Failed to save quotation')
    }
  }

  const sendQuotation = async () => {
    if (!email) {
      alert('Please enter an email address')
      return
    }

    setIsSending(true)
    try {
      // Generate PDF blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        pdf(<QuotationPDF data={quotationData} />)
          .toBlob()
          .then(resolve)
          .catch(reject)
      });

      // Create unique filename
      const fileName = `quotation_${Date.now()}.pdf`

      // Upload to Supabase Storage
      const { data: storageData, error: storageError } = await supabase
        .storage
        .from('quotations')
        .upload(fileName, blob, {
          contentType: 'application/pdf',
          cacheControl: '3600'
        })

      if (storageError) throw storageError

      // Get the public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('quotations')
        .getPublicUrl(fileName)

      // Send email using your API route
      const response = await fetch('/api/send-quotation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          quotationUrl: publicUrl,
          projectTitle: quotationData.projectTitle,
          recipientName: quotationData.recipientName || quotationData.salutation
        }),
      })

      if (!response.ok) throw new Error('Failed to send email')

      alert('Quotation sent successfully!')
      setShowEmailModal(false)
      setEmail('')
    } catch (error) {
      console.error('Error sending quotation:', error)
      alert('Failed to send quotation. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="p-6 relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Create Quotation</h1>
        <div className="space-x-4">
          <button
            onClick={() => setShowEmailModal(true)}
            className="bg-[#DBA463] text-white px-4 py-2 rounded-lg"
          >
            Send as Email
          </button>
          {typeof window !== 'undefined' && (
            <BlobProvider document={<QuotationPDF data={quotationData} />}>
              {({ blob, url, loading }) => (
                <a
                  href={url || '#'}
                  download={`quotation-${Date.now()}.pdf`}
                  className="bg-[#DBA463] text-white px-4 py-2 rounded-lg inline-block"
                  style={{ textDecoration: 'none' }}
                >
                  {loading ? 'Generating PDF...' : 'Download PDF'}
                </a>
              )}
            </BlobProvider>
          )}
        </div>
      </div>

      <QuotationForm 
        quotationData={quotationData} 
        setQuotationData={setQuotationData} 
      />

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-[#1E1E1E] p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Send Quotation</h2>
            <div className="mb-4">
              <label className="block text-white mb-2">Recipient Email:</label>
              <input
                type="email"
                className="bg-white/10 p-2 rounded w-full text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 rounded-lg text-white"
                disabled={isSending}
              >
                Cancel
              </button>
              <button
                onClick={sendQuotation}
                className="bg-[#DBA463] px-4 py-2 rounded-lg text-white"
                disabled={isSending}
              >
                {isSending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 