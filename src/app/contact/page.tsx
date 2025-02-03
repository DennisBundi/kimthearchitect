'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { FaPhone, FaEnvelope, FaInstagram, FaMapMarkerAlt } from 'react-icons/fa'
import Image from 'next/image'
import Footer from '@/components/Footer'

interface ContactForm {
  name: string
  email: string
  phone_number: string
  message: string
}

export default function Contact() {
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    phone_number: '',
    message: ''
  })
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  
  const supabase = createClientComponentClient()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    setSuccess(false)

    try {
      const { error: insertError } = await supabase
        .from('contacts')
        .insert({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone_number: formData.phone_number.trim(),
          message: formData.message.trim()
        })

      if (insertError) {
        console.error('Supabase error:', insertError)
        throw insertError
      }

      // Clear form and show success message
      setFormData({
        name: '',
        email: '',
        phone_number: '',
        message: ''
      })
      setSuccess(true)

      // Show success message briefly before redirecting
      setTimeout(() => {
        router.push('/projects')
      }, 1500) // Redirect after 1.5 seconds
    } catch (error: any) {
      console.error('Error:', error)
      setError(error.message || 'Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) setError('')
  }

  return (
    <main className="min-h-screen bg-[#1A1F2E]">
      <Navbar />
      
      {/* Hero Section with Background Image */}
      <section className="relative h-[60vh] min-h-[400px]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/hrc.jpg"  // Updated to use your image
            alt="Contact Us Hero"
            fill
            className="object-cover"
            priority
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* Content */}
        <div className="relative h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Get In <span className="text-[#DBA463]">Touch</span>
            </h1>
            <p className="text-white/80 max-w-2xl mx-auto">
              We'd love to hear from you. Whether you have a question about our services, projects, or anything else, our team is ready to answer all your questions.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Contact Information</h2>
                <div className="space-y-4">
                  <div className="flex items-center text-white/80">
                    <FaPhone className="w-5 h-5 text-[#DBA463] mr-4" />
                    <span>+254 196 98588</span>
                  </div>
                  <div className="flex items-center text-white/80">
                    <FaEnvelope className="w-5 h-5 text-[#DBA463] mr-4" />
                    <span>kimthearchitect0@gmail.com</span>
                  </div>
                  <div className="flex items-center text-white/80">
                    <FaMapMarkerAlt className="w-5 h-5 text-[#DBA463] mr-4" />
                    <span>Nairobi, Kenya</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-4">Office Hours</h3>
                <div className="space-y-2 text-white/80">
                  <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
                  <p>Saturday: 9:00 AM - 1:00 PM</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-4">Follow Us</h3>
                <a 
                  href="https://www.instagram.com/kim_thearchitect" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-white/80 hover:text-[#DBA463] transition-colors"
                >
                  <FaInstagram className="w-5 h-5 mr-2" />
                  @kim_thearchitect
                </a>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white/5 p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-white mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-[#C6A87D] focus:outline-none"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-[#C6A87D] focus:outline-none"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone_number" className="block text-gray-300 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    id="phone_number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    required
                    className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-[#C6A87D] focus:outline-none"
                    placeholder="+254 XXX XXX XXX"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-gray-300 mb-2">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-[#C6A87D] focus:outline-none"
                    placeholder="Your message"
                  ></textarea>
                </div>

                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}

                {success && (
                  <p className="text-green-500 text-sm">Message sent successfully!</p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#C6A87D] text-white py-3 px-6 rounded-lg hover:bg-[#B89A6F] transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="relative h-[400px] rounded-lg overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d255281.19036273!2d36.70730744863281!3d-1.3028617999999908!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f1172d84d49a7%3A0xf7cf0254b297924c!2sNairobi%2C%20Kenya!5e0!3m2!1sen!2sus!4v1645089415897!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0"
            ></iframe>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                question: "What services do you offer?",
                answer: "We offer a comprehensive range of architectural services including residential design, commercial projects, interior design, and urban planning."
              },
              {
                question: "How do I start a project with you?",
                answer: "Simply reach out to us through our contact form or give us a call. We'll schedule an initial consultation to discuss your needs and vision."
              },
              {
                question: "Do you work outside of Nairobi?",
                answer: "Yes, while we're based in Nairobi, we work on projects throughout Kenya and East Africa."
              },
              {
                question: "What is your typical project timeline?",
                answer: "Project timelines vary depending on scope and complexity. During our initial consultation, we'll provide you with a detailed timeline for your specific project."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-[#1A1F2E] p-6 rounded-lg">
                <h3 className="text-lg font-bold text-white mb-2">{faq.question}</h3>
                <p className="text-white/80">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  )
} 