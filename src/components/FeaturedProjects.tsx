'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FiArrowRight } from 'react-icons/fi'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function FeaturedProjects() {
  const [featuredProjects, setFeaturedProjects] = useState<any[]>([])
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchProjects() {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .limit(3)
        .order('created_at', { ascending: false })

      if (data) {
        setFeaturedProjects(data)
      }
    }

    fetchProjects()
  }, [])

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-white mb-8">Featured Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProjects.map((project) => (
            <div key={project.id} className="group">
              <Link href={`/projects/${project.id}`} className="block">
                <div className="relative aspect-video overflow-hidden rounded-lg mb-4">
                  <Image
                    src={project.cover_image}
                    alt={project.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{project.name}</h3>
                <p className="text-gray-400">{project.category}</p>
              </Link>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link 
            href="/projects" 
            className="inline-flex items-center text-white bg-primary px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
          >
            View All Projects
            <FiArrowRight className="ml-2" />
          </Link>
        </div>
      </div>
    </section>
  )
} 