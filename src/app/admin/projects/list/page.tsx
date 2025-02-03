'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'
import AdminNav from '../../../../components/AdminNav'
import { FiEdit2, FiTrash2, FiPlus, FiFilter } from 'react-icons/fi'
import Link from 'next/link'

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
  created_at: string
}

export default function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const supabase = createClientComponentClient()

  const fetchProjects = async () => {
    try {
      setError(null)
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
      setFilteredProjects(data || [])
    } catch (error: any) {
      console.error('Error:', error)
      setError(error.message)
      toast.error('Failed to load projects')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    let filtered = [...projects]

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(project => project.category === categoryFilter)
    }

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7))
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30))
      const ninetyDaysAgo = new Date(now.setDate(now.getDate() - 90))

      filtered = filtered.filter(project => {
        const projectDate = new Date(project.created_at)
        switch (dateFilter) {
          case '7days':
            return projectDate >= sevenDaysAgo
          case '30days':
            return projectDate >= thirtyDaysAgo
          case '90days':
            return projectDate >= ninetyDaysAgo
          default:
            return true
        }
      })
    }

    setFilteredProjects(filtered)
  }, [categoryFilter, dateFilter, projects])

  // Get unique categories from projects
  const categories = ['all', ...new Set(projects.map(project => project.category))]

  const handleDelete = async (projectId: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return

    try {
      // First, delete associated images from storage
      const { data: project } = await supabase
        .from('projects')
        .select('cover_image')
        .eq('id', projectId)
        .single()

      if (project?.cover_image) {
        const { error: storageError } = await supabase
          .storage
          .from('project-images')
          .remove([project.cover_image])

        if (storageError) throw storageError
      }

      // Then delete the project record
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)

      if (error) throw error

      toast.success('Project deleted successfully')
      setProjects(projects.filter(p => p.id !== projectId))
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to delete project')
    }
  }

  return (
    <div className="min-h-screen bg-[#1A1F2E]">
      <AdminNav />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">All Projects</h1>
          <Link 
            href="/admin/projects"
            className="bg-[#C6A87D] hover:bg-[#B89A6F] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <FiPlus /> Add New Project
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-gray-800/30 p-4 rounded-lg mb-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <FiFilter className="text-[#C6A87D]" />
              <span className="text-white">Filters:</span>
            </div>
            
            <div className="flex gap-4">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-gray-700 text-white px-3 py-1.5 rounded-lg border border-gray-600 focus:border-[#C6A87D] focus:outline-none"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>

              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-gray-700 text-white px-3 py-1.5 rounded-lg border border-gray-600 focus:border-[#C6A87D] focus:outline-none"
              >
                <option value="all">All Time</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-6 shadow-[0_0_15px_rgba(198,168,125,0.2)]">
          {isLoading ? (
            <p className="text-white">Loading projects...</p>
          ) : error ? (
            <p className="text-red-400">{error}</p>
          ) : filteredProjects.length === 0 ? (
            <p className="text-white">No projects found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-white">
                <thead className="border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left">Image</th>
                    <th className="px-6 py-3 text-left">Name</th>
                    <th className="px-6 py-3 text-left">Category</th>
                    <th className="px-6 py-3 text-left">Year</th>
                    <th className="px-6 py-3 text-left">Location</th>
                    <th className="px-6 py-3 text-left">Client</th>
                    <th className="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((project) => (
                    <tr key={project.id} className="border-b border-gray-700 hover:bg-gray-700/30">
                      <td className="px-6 py-4">
                        {project.cover_image && (
                          <div className="w-20 h-20">
                            <img
                              src={project.cover_image}
                              alt={project.name}
                              className="w-full h-full object-cover rounded"
                            />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">{project.name}</td>
                      <td className="px-6 py-4">{project.category}</td>
                      <td className="px-6 py-4">{project.year}</td>
                      <td className="px-6 py-4">{project.location}</td>
                      <td className="px-6 py-4">{project.client}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-3">
                          <Link
                            href={`/admin/projects/edit/${project.id}`}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            <FiEdit2 size={20} />
                          </Link>
                          <button
                            onClick={() => handleDelete(project.id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <FiTrash2 size={20} />
                          </button>
                        </div>
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