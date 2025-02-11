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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [newImages, setNewImages] = useState<string[]>([])
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

  useEffect(() => {
    console.log('Project Data:', project)
    console.log('Cover Image:', project?.cover_image)
    console.log('Additional Images:', project?.images)
  }, [project])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!project) return

    setIsSaving(true)

    try {
      // Upload new images first
      const newImages: string[] = []
      
      for (const file of selectedFiles) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('project-images')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const fullPath = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/project-images/${filePath}`
        newImages.push(fullPath)

        // If this is the first uploaded image and there's no cover image, use it as cover
        if (newImages.length === 1 && !project.cover_image) {
          project.cover_image = fullPath
        }
      }

      // Ensure current images is properly formatted
      const currentImages = Array.isArray(project.images) 
        ? project.images 
        : project.images 
          ? JSON.parse(project.images as string)
          : []

      // Combine existing and new images
      const allImages = [...currentImages, ...newImages]

      // Update project with all data including images and cover image
      const { data: updatedProject, error: updateError } = await supabase
        .from('projects')
        .update({
          name: project.name,
          description: project.description,
          year: project.year,
          client: project.client,
          location: project.location,
          category: project.category,
          subcategory: project.subcategory,
          cover_image: project.cover_image,
          images: allImages
        })
        .eq('id', params.id)
        .select()
        .single()

      if (updateError) throw updateError

      // Update local state with new data
      setProject({
        ...project,
        cover_image: updatedProject.cover_image,
        images: updatedProject.images
      })

      // Clear preview states
      setPreviewUrls(prev => {
        prev.forEach(url => URL.revokeObjectURL(url))
        return []
      })
      setSelectedFiles([])

      toast.success('Project updated successfully')

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

    // Store the files
    setSelectedFiles(prev => [...prev, ...Array.from(files)])

    // Create and store preview URLs
    const newPreviewUrls = Array.from(files).map(file => URL.createObjectURL(file))
    setPreviewUrls(prev => [...prev, ...newPreviewUrls])
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !project) return
    
    setUploadingImages(true)
    const files = Array.from(e.target.files)
    const uploadedImages: string[] = []

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
        uploadedImages.push(fullPath)
      }

      // Add to preview state instead of project state
      setNewImages(prev => [...prev, ...uploadedImages])
      toast.success('Images added to preview')
    } catch (error) {
      console.error('Error uploading images:', error)
      toast.error('Failed to upload images')
    } finally {
      setUploadingImages(false)
      if (e.target) {
        e.target.value = ''
      }
    }
  }

  const handleDeleteImage = async (imagePath: string) => {
    if (!project) return

    try {
      // Extract filename from path
      const filename = imagePath.includes('project-images/') 
        ? imagePath.split('project-images/').pop() 
        : imagePath

      // Delete from storage if it's not the cover image
      if (imagePath !== project.cover_image) {
        const { error: deleteError } = await supabase.storage
          .from('project-images')
          .remove([filename!])

        if (deleteError) {
          console.error('Error deleting from storage:', deleteError)
          throw deleteError
        }
      }

      // Ensure project.images is an array
      const currentImages = Array.isArray(project.images) 
        ? project.images 
        : project.images 
          ? [project.images] 
          : []

      // Update project images array
      const updatedImages = currentImages.filter(img => {
        const imgFilename = img.includes('project-images/') 
          ? img.split('project-images/').pop() 
          : img
        return imgFilename !== filename
      })

      // Update project record in database
      const { error: updateError } = await supabase
        .from('projects')
        .update({
          images: updatedImages
        })
        .eq('id', project.id)

      if (updateError) throw updateError

      toast.success('Image deleted successfully')
      
      // Refresh the page
      window.location.reload()

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

  // Add this function to remove images from preview
  const removeFromPreview = (imageUrl: string) => {
    setNewImages(prev => prev.filter(img => img !== imageUrl))
  }

  // Add function to remove preview
  const removePreview = (index: number) => {
    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(previewUrls[index])
    
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
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
            <h2 className="text-xl font-semibold text-white mb-4">Project Images</h2>
            
            {/* Cover Image */}
            {project?.cover_image && (
              <div className="mb-6">
                <h3 className="text-white mb-2">Cover Image</h3>
                <div className="relative aspect-video">
                  <img
                    src={project.cover_image}
                    alt="Cover image"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* Additional Images */}
            <div>
              <h3 className="text-white mb-2">Additional Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {project?.images && (
                  (typeof project.images === 'string' 
                    ? JSON.parse(project.images)
                    : project.images
                  ).filter(Boolean).map((imageUrl: string, index: number) => {
                    // Clean the URL by removing any quotes and backslashes
                    const cleanUrl = typeof imageUrl === 'string' 
                      ? imageUrl.replace(/['"\\]/g, '')
                      : imageUrl;
                    
                    return (
                      <div key={index} className="relative group aspect-square">
                        <img
                          src={cleanUrl}
                          alt={`Project image ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.preventDefault();
                            handleDeleteImage(cleanUrl);
                          }}
                          className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FiX size={16} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Upload New Images Section */}
          <div className="mt-6">
            <h3 className="text-white mb-2">Upload New Images</h3>
            <div className="relative">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="flex items-center justify-center px-4 py-2 bg-gray-700 text-white rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
              >
                <FiUpload className="mr-2" />
                Select Images
              </label>
            </div>

            {/* Preview Section */}
            {previewUrls.length > 0 && (
              <div className="mt-4">
                <h3 className="text-white mb-2">Selected Images Preview</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group aspect-square">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.onerror = null // Prevent infinite loop
                          target.src = '/images/placeholder.jpg' // Use a default image path that exists in your project
                        }}
                      />
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          removePreview(index)
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-gray-400 mt-2 text-sm">
                  Images will be uploaded when you click "Save Changes"
                </p>
              </div>
            )}
          </div>

          {/* New Images Preview Section */}
          {newImages.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-white mb-4">New Images Preview</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {newImages.map((image, index) => (
                  <div key={index} className="relative group aspect-square">
                    <img
                      src={image}
                      alt={`New image ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeFromPreview(image)}
                      className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-gray-400 mt-2 text-sm">
                These images will be added to the project when you click "Save Changes"
              </p>
            </div>
          )}

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