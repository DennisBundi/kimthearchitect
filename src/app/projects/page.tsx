'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Image from 'next/image'
import Link from 'next/link'
import { getProjects, Project } from '@/lib/supabase/projects'
import { useRouter } from 'next/navigation'

// You can replace these with your actual categories
const categories = ['All', 'Residential', 'Commercial', 'Interior', 'Landscape']

export default function Projects() {
  const [projects, setProjects] = useState<any[]>([])
  const [activeCategory, setActiveCategory] = useState('all')
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase.from('projects').select('*')
      if (data) setProjects(data)
    }
    fetchProjects()
  }, [])

  // Filter projects based on activeCategory
  const filteredProjects = activeCategory === 'all' 
    ? projects 
    : projects.filter(project => project.category.startsWith(activeCategory))

  const handleProjectClick = (projectId: string) => {
    router.push(`/projects/${projectId}`)
  }

  return (
    <div className="min-h-screen bg-[#1A1F2E]">
      <div className="fixed top-0 w-full z-50">
        <Navbar />
      </div>
      
      {/* Main content with padding-top to account for fixed navbar */}
      <div className="pt-18"> {/* Adjust pt-16 based on your navbar height */}
        <section className="max-w-[1200px] mx-auto px-4 py-12 pt-[150px]">
          <div className="flex gap-4 mb-12 max-w-[1200px] mx-auto overflow-x-auto">
            <button 
              onClick={() => setActiveCategory('all')}
              className={`${activeCategory === 'all' ? 'bg-[#C6A87D]' : 'bg-gray-700'} px-6 py-2 rounded-lg text-white hover:opacity-90 transition-opacity whitespace-nowrap`}
            >
              All
            </button>
            <button 
              onClick={() => setActiveCategory('Commercial')}
              className={`${activeCategory === 'Commercial' ? 'bg-[#C6A87D]' : 'bg-gray-700'} px-6 py-2 rounded-lg text-white hover:opacity-90 transition-opacity whitespace-nowrap`}
            >
              Commercial
            </button>
            <button 
              onClick={() => setActiveCategory('Residential')}
              className={`${activeCategory === 'Residential' ? 'bg-[#C6A87D]' : 'bg-gray-700'} px-6 py-2 rounded-lg text-white hover:opacity-90 transition-opacity whitespace-nowrap`}
            >
              Residential
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-[1200px] mx-auto">
            {filteredProjects.map((project) => (
              <div 
                key={project.id} 
                className="bg-gray-800/50 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-transform duration-300 shadow-xl cursor-pointer"
                onClick={() => handleProjectClick(project.id)}
              >
                <img 
                  src={project.cover_image} 
                  alt={project.name}
                  className="w-full h-72 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{project.name}</h3>
                  <p className="text-[#C6A87D] text-lg">{project.category}</p>
                  {project.client && (
                    <p className="text-gray-300 mt-2">{project.client}</p>
                  )}
                  {project.year && (
                    <p className="text-gray-400 text-sm mt-1">{project.year}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}