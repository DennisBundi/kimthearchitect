'use client'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Image from 'next/image'
import Link from 'next/link'
import ImageSlideshow from '@/components/ImageSlideshow'
import { useRouter } from 'next/navigation'

interface Project {
  id: string
  name: string
  category: string
  description: string
  cover_image: string
  created_at: string
  year: number
  client: string
  location: string
  images: string[]
}

export default function About() {
  const [recentProjects, setRecentProjects] = useState<Project[]>([])
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchRecentProjects = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3)

        if (error) {
          console.error('Error fetching recent projects:', error)
          return
        }

        if (data) {
          setRecentProjects(data)
        }
      } catch (error) {
        console.error('Error:', error)
      }
    }

    fetchRecentProjects()
  }, [])

  return (
    <main className="min-h-screen bg-[#1A1F2E]">
      <Navbar />
      
      {/* Hero Section with Slideshow */}
      <section className="relative">
        <ImageSlideshow />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center z-10 px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              About <span className="text-[#DBA463]">Kimthearchitect</span>
            </h1>
            <p className="text-white/80 max-w-3xl mx-auto">
              Transforming Kenya's architectural landscape with innovative design solutions and sustainable practices.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative h-[400px]">
              <Image
                src="/logo.jpeg"
                alt="KimthArchitect Logo"
                fill
                className="object-contain rounded-lg"
                priority
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white">Our Story</h2>
              <p className="text-white/80">
                Founded in Kenya, KimthArchitect emerged from a vision to blend contemporary architectural innovation with the rich cultural heritage of East Africa. Our journey began with a commitment to creating sustainable, culturally relevant designs that respond to the unique needs of our diverse clientele.
              </p>
              <p className="text-white/80">
                Based in Kenya, we understand the local context and challenges, allowing us to deliver solutions that are both aesthetically pleasing and practically sound. Our designs reflect the vibrant spirit of Kenya while embracing modern architectural principles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#1A1F2E]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Innovation",
                description: "Pushing boundaries in architectural design while respecting local context and needs.",
                icon: (
                  <svg className="w-16 h-16 mb-6 text-[#DBA463]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" 
                      d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )
              },
              {
                title: "Sustainability",
                description: "Creating eco-friendly designs that consider Kenya's climate and environmental challenges.",
                icon: (
                  <svg className="w-16 h-16 mb-6 text-[#DBA463]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" 
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )
              },
              {
                title: "Cultural Integration",
                description: "Blending modern architecture with rich Kenyan cultural elements and traditions.",
                icon: (
                  <svg className="w-16 h-16 mb-6 text-[#DBA463]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" 
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              }
            ].map((value, index) => (
              <div key={index} className="bg-white/5 p-8 rounded-lg text-center hover:transform hover:scale-105 transition-all duration-300">
                <div className="flex justify-center">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-[#DBA463] mb-4">{value.title}</h3>
                <p className="text-white/80">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Our Expertise</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              "Residential Architecture",
              "Commercial Spaces",
              "Urban Planning",
              "Interior Design",
              "Sustainable Design",
              "Cultural Centers",
              "Educational Facilities",
              "Healthcare Architecture"
            ].map((expertise, index) => (
              <div key={index} 
                className="bg-[#1A1F2E] p-6 rounded-lg border border-white/10 hover:border-[#DBA463] transition-all duration-300 hover:transform hover:scale-105">
                <p className="text-white text-center">{expertise}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#1A1F2E]">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Our Location</h2>
          <p className="text-white/80 max-w-2xl mx-auto">
            Strategically located in Kenya, we serve clients throughout East Africa, bringing innovative architectural solutions to the region. Our local presence allows us to deeply understand and respond to the unique architectural needs of our community.
          </p>
        </div>
      </section>

      {/* Recent Projects Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#1A1F2E]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Recent Projects</h2>
            <p className="text-white/80">Explore our latest architectural achievements</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentProjects.map((project) => (
              <div 
                key={project.id}
                className="bg-gray-800/50 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-transform duration-300 cursor-pointer"
                onClick={() => router.push(`/projects/${project.id}`)}
              >
                <div className="relative h-64">
                  <img
                    src={project.cover_image}
                    alt={project.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{project.name}</h3>
                  <p className="text-[#C6A87D] mb-2">{project.category}</p>
                  {project.description && (
                    <p className="text-gray-300 line-clamp-2">{project.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => router.push('/projects')}
              className="bg-[#C6A87D] text-white px-8 py-3 rounded-lg hover:bg-[#B89A6F] transition-colors"
            >
              View All Projects
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A1F2E] text-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and Description */}
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-light mb-4">
                KIMTHE<span className="text-[#DBA463]">ARCHITECT</span>
              </h3>
              <p className="text-sm text-white/60 mb-4">
                Creating innovative architectural solutions that inspire and transform spaces into extraordinary experiences.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-light mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-white/60 hover:text-[#DBA463] transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/projects" className="text-white/60 hover:text-[#DBA463] transition-colors">
                    Projects
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-white/60 hover:text-[#DBA463] transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-white/60 hover:text-[#DBA463] transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-light mb-4">Contact Info</h4>
              <ul className="space-y-2">
                <li className="flex items-center text-white/60">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  kimthearchitect0@gmail.com
                </li>
                <li className="flex items-center text-white/60">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  +254 196 98588
                </li>
                
                {/* Instagram */}
                <li className="pt-4">
                  <a 
                    href="https://www.instagram.com/kim_thearchitect" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center text-white/60 hover:text-[#DBA463] transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    Follow us on Instagram
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-white/10 mt-12 pt-8 text-center text-sm text-white/60">
            <p>© {new Date().getFullYear()} Kimthearchitect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
} 