'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import AdminNav from '../../../components/AdminNav'
import Link from 'next/link'
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi'
import ProjectForm from '../../../components/ProjectForm'

interface ProjectType {
  id: string
  name: string
  category: string
  year: number
  description: string
  location: string
  client: string
  images: string[]
  featured: boolean
  created_at?: string
}

interface ImagePreview {
  file: File
  preview: string
}

interface CategoryOption {
  main: string;
  sub?: string;
}

interface ProjectFormData {
  name: string
  category: string
  description: string
  location: string
  client: string
  year: number
  images: File[]
  featured: boolean
  area?: string
}

interface PreviewImage {
  file: File;
  preview: string;
}

export default function ManageProjects() {
  return (
    <div className="min-h-screen bg-[#1A1F2E]">
      <AdminNav />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Manage Projects</h1>
        
        {/* Project Form */}
        <div className="bg-gray-800/50 rounded-lg p-6 shadow-[0_0_15px_rgba(198,168,125,0.2)]">
          <h2 className="text-2xl font-bold text-white mb-6">Add New Project</h2>
          <ProjectForm />
        </div>
      </div>
    </div>
  )
} 