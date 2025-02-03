'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import AdminNav from '../../../../../components/AdminNav'
import { FiUpload, FiX } from 'react-icons/fi'
import Image from 'next/image'

interface Project {
  id: string
  name: string
  category: string
  subcategory: string
  year: number
  description: string
  location: string
  client: string
  cover_image: string
  images: string[] // Changed from additional_images to match your schema
}

export default function EditProject({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', params.id)
          .single()

        if (error) throw error
        
        // Debug logs
        console.log('Project data:', data)
        console.log('Cover image:', data?.cover_image)
        console.log('Additional images:', data?.images)
        
        setProject(data)
      } catch (error) {
        console.error('Error:', error)
        toast.error('Failed to load project')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProject()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!project) return

    setIsSaving(true)

    try {
      // Get all current images, including the cover image
      const allImages: string[] = (() => {
        const images: string[] = []
        
        // Add additional images
        if (project.images) {
          if (typeof project.images === 'string') {
            // If it's a single string, add it directly
            images.push(project.images)
          } else if (Array.isArray(project.images)) {
            // For each image, ensure we're storing just the filename or full path correctly
            project.images.forEach(img => {
              // If it's a full URL, extract just the filename
              if (img.includes('project-images/')) {
                const filename = img.split('project-images/').pop()
                if (filename) images.push(filename)
              } else {
                // If it's already a filename, use it as is
                images.push(img)
              }
            })
          }
        }

        return images
      })()

      // Prepare the update data
      const updateData = {
        name: project.name,
        description: project.description,
        year: project.year,
        client: project.client,
        location: project.location,
        building_type: project.category,
        sub_category: project.subcategory,
        cover_image: project.cover_image,
        images: allImages // Store cleaned up image paths
      }

      const { error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', params.id)

      if (error) throw error

      toast.success('Project updated successfully')
      router.push('/admin/projects/list')
    } catch (error) {
      console.error('Error updating project:', error)
      toast.error('Failed to update project')
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Clear previous previews
    setPreviewUrls([])

    // Create preview URLs for selected images
    Array.from(files).forEach(file => {
      const previewUrl = URL.createObjectURL(file)
      setPreviewUrls(prev => [...prev, previewUrl])
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !project) return
    
    setUploadingImages(true)
    const files = Array.from(e.target.files)
    const newImages: string[] = []

    try {
      // Upload each new image
      for (const file of files) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('project-images')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        // Create full URL for the uploaded image
        const fullPath = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/project-images/${filePath}`
        newImages.push(fullPath)
      }

      // Get current images array with proper typing
      const currentImages: string[] = (() => {
        if (!project.images) return []
        if (typeof project.images === 'string') return [project.images]
        if (Array.isArray(project.images)) return project.images
        return []
      })()

      // Combine current images with new ones
      const updatedImages: string[] = [...currentImages, ...newImages]

      // Update the project with all images
      const { error: updateError } = await supabase
        .from('projects')
        .update({
          images: updatedImages
        })
        .eq('id', project.id)

      if (updateError) throw updateError

      // Update local state with all images
      setProject(prev => ({
        ...prev!,
        images: updatedImages
      }))

      toast.success('Images uploaded successfully')
    } catch (error) {
      console.error('Error uploading images:', error)
      toast.error('Failed to upload images')
    } finally {
      setUploadingImages(false)
      // Clear the input
      if (e.target) {
        e.target.value = ''
      }
    }
  }

  const handleDeleteImage = async (imagePath: string) => {
    if (!project) return

    try {
      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('project-images')
        .remove([imagePath])

      if (deleteError) throw deleteError

      // Update project
      const updatedImages = project.images?.filter(img => img !== imagePath) || []
      const { error: updateError } = await supabase
        .from('projects')
        .update({
          images: updatedImages
        })
        .eq('id', params.id)

      if (updateError) throw updateError

      // Update local state
      setProject(prev => prev ? {
        ...prev,
        images: updatedImages
      } : null)

      toast.success('Image deleted successfully')
    } catch (error) {
      console.error('Error deleting image:', error)
      toast.error('Failed to delete image')
    }
  }

  // Helper function to clean and parse image paths
  const parseImagePaths = (rawImages: any): string[] => {
    if (!rawImages) return []

    try {
      // If it's already an array, return it
      if (Array.isArray(rawImages)) return rawImages

      // If it's a string, try to clean and parse it
      if (typeof rawImages === 'string') {
        // Remove escaped characters and try to extract URLs
        const cleaned = rawImages
          .replace(/\\/g, '') // Remove backslashes
          .replace(/\[|\]/g, '') // Remove square brackets
          .split(',') // Split by comma
          .map(url => url.trim()) // Clean up whitespace
          .filter(url => url.includes('project-images/')) // Only keep valid image paths
          .map(url => {
            // Extract the filename part
            const match = url.match(/project-images\/([^"]+)/)
            return match ? match[1] : null
          })
          .filter(Boolean) // Remove any null values

        return cleaned as string[]
      }
    } catch (error) {
      console.error('Error parsing image paths:', error)
    }
    return []
  }

  // Function to get all project images
  const getAllProjectImages = () => {
    const allImages = []
    
    // Add cover image if it exists
    if (project?.cover_image) {
      const coverPath = project.cover_image.includes('project-images/') 
        ? project.cover_image.split('project-images/')[1]
        : project.cover_image
      allImages.push(coverPath)
    }

    // Add additional images
    if (project?.images) {
      const additionalImages = parseImagePaths(project.images)
      allImages.push(...additionalImages)
    }

    console.log('All images:', allImages)
    return allImages
  }

  // Helper function to get display URL for images
  const getImageUrl = (path: string): string => {
    if (!path) return ''
    if (path.startsWith('http')) {
      return path
    }
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/project-images/${path}`
  }

  if (isLoading) {
    return <div className="text-white">Loading...</div>
  }

  if (!project) {
    return <div className="text-white">Project not found</div>
  }

  return (
    <div className="min-h-screen bg-[#1A1F2E]">
      <AdminNav />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Edit Project</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
          <div>
            <label className="block text-white mb-2">Project Name</label>
            <input
              type="text"
              value={project.name}
              onChange={(e) => setProject({ ...project, name: e.target.value })}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C6A87D]"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-white mb-2">Building Type</label>
              <select
                value={project.category}
                onChange={(e) => setProject({ ...project, category: e.target.value })}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C6A87D]"
              >
                <option value="">Select Building Type</option>
                {/* Add your building type options here */}
              </select>
            </div>

            <div>
              <label className="block text-white mb-2">Sub Category</label>
              <select
                value={project.subcategory}
                onChange={(e) => setProject({ ...project, subcategory: e.target.value })}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C6A87D]"
              >
                <option value="">Select Sub Category</option>
                {/* Add your subcategory options here */}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-white mb-2">Description</label>
            <textarea
              value={project.description}
              onChange={(e) => setProject({ ...project, description: e.target.value })}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C6A87D]"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="block text-white mb-2">Year</label>
              <input
                type="number"
                value={project.year}
                onChange={(e) => setProject({ ...project, year: parseInt(e.target.value) })}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C6A87D]"
              />
            </div>

            <div>
              <label className="block text-white mb-2">Client</label>
              <input
                type="text"
                value={project.client}
                onChange={(e) => setProject({ ...project, client: e.target.value })}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C6A87D]"
              />
            </div>

            <div>
              <label className="block text-white mb-2">Location</label>
              <input
                type="text"
                value={project.location}
                onChange={(e) => setProject({ ...project, location: e.target.value })}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C6A87D]"
              />
            </div>
          </div>

          {/* Project Images Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Project Images</h2>

              {/* All Project Images */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {getAllProjectImages().map((image, index) => (
                  <div 
                    key={index} 
                    className={`relative group ${index === 0 ? 'col-span-2 md:col-span-3' : ''}`}
                  >
                    <div className={`relative ${index === 0 ? 'aspect-video' : 'aspect-square'}`}>
                      <img
                        src={getImageUrl(image)}
                        alt={`Project image ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          console.error('Failed to load image:', image)
                          const target = e.target as HTMLImageElement
                          target.src = '/placeholder.jpg'
                        }}
                      />
                      {index === 0 && (
                        <div className="absolute top-2 left-2 px-2 py-1 bg-gray-800 bg-opacity-75 text-white text-sm rounded">
                          Cover Image
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Upload New Images Section */}
              <div className="mt-6">
                <h3 className="text-white mb-2">Upload New Images</h3>
                <div className="relative">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    disabled={uploadingImages}
                  />
                  <label
                    htmlFor="image-upload"
                    className={`flex items-center justify-center px-4 py-2 bg-gray-700 text-white rounded-lg cursor-pointer hover:bg-gray-600 transition-colors ${
                      uploadingImages ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <FiUpload className="mr-2" />
                    {uploadingImages ? 'Uploading...' : 'Upload New Images'}
                  </label>
                </div>

                {/* Preview Section */}
                {previewUrls.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-white mb-2">Preview</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {previewUrls.map((url, index) => (
                        <div key={index} className="relative aspect-square">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Buttons */}
          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              disabled={isSaving || uploadingImages}
              className="bg-[#C6A87D] hover:bg-[#B89A6F] text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/projects/list')}
              className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 