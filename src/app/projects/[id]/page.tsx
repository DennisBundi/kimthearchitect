import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import ProjectContent from '@/components/ProjectContent'
import Navbar from '@/components/Navbar'

export default async function ProjectDetail({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies })
  
  // Get project with all images
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!project) return <div>Project not found</div>

  // Parse the images array from the project
  const projectWithImages = {
    ...project,
    project_images: project.images ? JSON.parse(project.images) : []
  }

  console.log('Project with images:', projectWithImages)

  return (
    <main className="min-h-screen bg-[#1B2537]">
      <Navbar />
      <ProjectContent project={projectWithImages} />
    </main>
  )
} 