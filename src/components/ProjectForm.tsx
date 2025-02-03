'use client'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

interface ProjectFormData {
  name: string
  category: string
  subcategory: string
  description: string
  year: number
  client: string
  location: string
  images: File[]
  featured: boolean
}

export default function ProjectForm() {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    category: '',
    subcategory: '',
    description: '',
    year: new Date().getFullYear(),
    client: '',
    location: '',
    images: [],
    featured: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const supabase = createClientComponentClient()

  const categories = {
    'Commercial - Malls': [
      'Rentals & Flats',
      'Malls',
      'Hotels',
      'Restaurants',
      'Villas'
    ],
    'Residential': [
      'Bungalow - Roofed/Skillion',
      'Hidden Roof',
      'Roof Slab RC',
      'Mansion - Roofed',
      'Flat Roof',
      'Hidden Roof'
    ]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const loadingToast = toast.loading('Uploading images...')

    try {
      // Upload images in parallel
      const imagePromises = formData.images.map(async (file) => {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('project-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true
          })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('project-images')
          .getPublicUrl(fileName)

        return publicUrl
      })

      const imageUrls = await Promise.all(imagePromises)
      
      // Create project with simplified category
      const { error: insertError } = await supabase
        .from('projects')
        .insert([{
          name: formData.name,
          // Use just the main category without any suffixes
          category: formData.category.split(' - ')[0],  // This will take just 'Commercial' or 'Residential'
          subcategory: formData.subcategory,
          description: formData.description,
          year: formData.year,
          client: formData.client,
          location: formData.location,
          cover_image: imageUrls[0] || '',
          images: imageUrls,
          featured: formData.featured
        }])

      if (insertError) throw insertError

      toast.success('Project created successfully!', { id: loadingToast })
      
      // Reset form
      setFormData({
        name: '',
        category: '',
        subcategory: '',
        description: '',
        year: new Date().getFullYear(),
        client: '',
        location: '',
        images: [],
        featured: false
      })
      setUploadedImages([])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to create project', { id: loadingToast })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newImages = Array.from(files)
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }))

    // Preview URLs for uploaded images
    const imageUrls = newImages.map(file => URL.createObjectURL(file))
    setUploadedImages(prev => [...prev, ...imageUrls])
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset subcategory when category changes
      ...(name === 'category' ? { subcategory: '' } : {})
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-gray-300 mb-2">Project Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-[#C6A87D] focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="category" className="block text-gray-300 mb-2">Building Type</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-[#C6A87D] focus:outline-none"
          >
            <option value="">Select Building Type</option>
            {Object.keys(categories).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="subcategory" className="block text-gray-300 mb-2">Sub Category</label>
          <select
            id="subcategory"
            name="subcategory"
            value={formData.subcategory}
            onChange={handleChange}
            required
            disabled={!formData.category}
            className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-[#C6A87D] focus:outline-none disabled:opacity-50"
          >
            <option value="">Select Sub Category</option>
            {formData.category && categories[formData.category as keyof typeof categories].map((sub) => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-gray-300 mb-2">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={4}
          className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-[#C6A87D] focus:outline-none"
        ></textarea>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="year" className="block text-gray-300 mb-2">Year</label>
          <input
            type="number"
            id="year"
            name="year"
            value={formData.year}
            onChange={handleChange}
            required
            min="1900"
            max="2100"
            className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-[#C6A87D] focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="client" className="block text-gray-300 mb-2">Client</label>
          <input
            type="text"
            id="client"
            name="client"
            value={formData.client}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-[#C6A87D] focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-gray-300 mb-2">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-[#C6A87D] focus:outline-none"
          />
        </div>
      </div>

      {/* Simplified Image Upload Section */}
      <div className="space-y-4">
        <label className="block text-gray-300 mb-2">Project Images</label>
        <div className="bg-gray-700/50 border-2 border-dashed border-gray-600 rounded-lg p-8">
          <div className="text-center">
            <div className="flex flex-col items-center">
              <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              <p className="text-gray-300 mb-2">Click to upload images</p>
              <p className="text-gray-500 text-sm">First image will be the cover image</p>
              <p className="text-gray-500 text-sm">PNG, JPG, GIF up to 10MB</p>
            </div>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#C6A87D] hover:bg-[#B89A6F] cursor-pointer"
            >
              Choose Files
            </label>
          </div>
        </div>

        {/* Image Preview */}
        {uploadedImages.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {uploadedImages.map((url, index) => (
              <div key={index} className="relative group">
                {index === 0 && (
                  <span className="absolute top-2 left-2 bg-[#C6A87D] text-white px-2 py-1 text-xs rounded">
                    Cover Image
                  </span>
                )}
                <img
                  src={url}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Featured Project Checkbox */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="featured"
          name="featured"
          checked={formData.featured}
          onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
          className="w-4 h-4 text-[#C6A87D] bg-gray-700 border-gray-600 rounded focus:ring-[#C6A87D]"
        />
        <label htmlFor="featured" className="ml-2 text-gray-300">
          Featured Project
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#C6A87D] text-white py-3 px-6 rounded-lg hover:bg-[#B89A6F] transition-colors disabled:opacity-50"
      >
        {isSubmitting ? 'Creating Project...' : 'Create Project'}
      </button>
    </form>
  )
} 