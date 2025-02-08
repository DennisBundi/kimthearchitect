'use client'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

interface Project {
  id: string
  name: string
  category: string
  description: string
  client: string
  location: string
  year: number
  cover_image: string
  images: string | string[] // Can be string (JSON) or array of strings
}

export default function ProjectDetail() {
  const [project, setProject] = useState<Project | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [projectImages, setProjectImages] = useState<string[]>([])
  const previewRef = useRef<HTMLDivElement>(null)
  const params = useParams()
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchProject = async () => {
      try {
        console.log('Fetching project with ID:', params.id)

        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', params.id)
          .single()
        
        if (error) {
          console.error('Supabase error:', error)
          return
        }
        
        if (data) {
          console.log('Fetched project data:', data)
          // Parse the images JSON string if it's a string
          let parsedImages: string[] = []
          try {
            parsedImages = typeof data.images === 'string' 
              ? JSON.parse(data.images)
              : (Array.isArray(data.images) ? data.images : [])
          } catch (e) {
            console.error('Error parsing images:', e)
          }

          setProject(data)
          setProjectImages(parsedImages)
          setSelectedImage(parsedImages[0] || data.cover_image)
        }
      } catch (error) {
        console.error('Error:', error)
      }
    }

    if (params.id) {
      fetchProject()
    }
  }, [params.id])

  const handleImageSelect = (image: string) => {
    setSelectedImage(image)
    // Smooth scroll to preview section
    previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#1A1F2E] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  console.log('Project images:', projectImages)
  console.log('Selected image:', selectedImage)

  return (
    <div className="min-h-screen bg-[#1A1F2E]">
      <Navbar />

      <div className="max-w-[1200px] mx-auto px-4 py-12 pt-[150px]">
        <button 
          onClick={() => router.push('/projects')}
          className="mb-8 text-[#C6A87D] hover:text-white transition-colors flex items-center gap-2"
        >
          ← Back to Projects
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="md:col-span-2">
            <h1 className="text-4xl font-bold text-white mb-4">{project.name}</h1>
            <p className="text-[#C6A87D] text-xl mb-4">{project.category}</p>
            {project.description && (
              <p className="text-gray-300 mb-6">{project.description}</p>
            )}
          </div>
          <div className="bg-gray-800/50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-4">Project Details</h2>
            <div className="space-y-3">
              {project.location && (
                <p className="text-gray-300"><span className="text-[#C6A87D]">Location:</span> {project.location}</p>
              )}
              {project.year && (
                <p className="text-gray-300"><span className="text-[#C6A87D]">Year:</span> {project.year}</p>
              )}
            </div>
          </div>
        </div>

        <div className="mb-8" ref={previewRef}>
          {selectedImage && (
            <img
              src={selectedImage}
              alt={project.name}
              className="w-full h-[600px] object-cover rounded-lg shadow-xl"
            />
          )}
        </div>

        {projectImages.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Project Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {projectImages.map((image, index) => (
                <div
                  key={`project-image-${index}`}
                  className={`cursor-pointer rounded-lg overflow-hidden ${
                    selectedImage === image ? 'ring-2 ring-[#C6A87D]' : ''
                  }`}
                  onClick={() => handleImageSelect(image)}
                >
                  <img
                    src={image}
                    alt={`${project.name} ${index + 1}`}
                    className="w-full h-48 object-cover hover:opacity-80 transition-opacity"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 