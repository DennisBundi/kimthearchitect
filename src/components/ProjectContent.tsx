'use client'

import Container from './Container'
import Link from 'next/link'
import { useState, useRef } from 'react'
import ContactForm from './ContactForm'

interface Project {
  id: string
  title: string
  category: string
  description: string
  client: string
  location: string
  year: string
  cover_image: string
  project_images: string[]
}

interface ProjectContentProps {
  project: Project
}

export default function ProjectContent({ project }: ProjectContentProps) {
  const [selectedImage, setSelectedImage] = useState(project.cover_image)
  const previewRef = useRef<HTMLDivElement>(null)

  const additionalImages = project.project_images.filter(
    imageUrl => imageUrl !== project.cover_image
  )

  const allImages = [project.cover_image, ...additionalImages]

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImage(imageUrl)
    previewRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    })
  }

  return (
    <Container>
      <div className="pt-[150px] pb-8">
        <Link 
          href="/projects" 
          className="text-[#C6A87D] hover:text-[#B59768]"
        >
          ← Back to Projects
        </Link>
        
        {/* Project info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{project.title}</h1>
            <p className="text-[#C6A87D] mb-6">{project.category}</p>
            <p className="text-gray-300 mb-8">{project.description}</p>
          </div>

          <div className="bg-[#232D3F] p-6 rounded-lg h-fit">
            <h2 className="text-2xl font-bold text-white mb-4">Project Details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-[#C6A87D]">Client:</p>
                <p className="text-white">{project.client}</p>
              </div>
              <div>
                <p className="text-[#C6A87D]">Location:</p>
                <p className="text-white">{project.location}</p>
              </div>
              <div>
                <p className="text-[#C6A87D]">Year:</p>
                <p className="text-white">{project.year}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Large Preview Image */}
        <div ref={previewRef} className="mt-12 mb-8 scroll-mt-24">
          <div className="aspect-[16/9] w-full overflow-hidden rounded-lg bg-gray-800">
            <img
              src={selectedImage}
              alt="Selected project image"
              className="w-full h-full object-cover transition-all duration-500"
            />
          </div>
        </div>

        {/* Thumbnail Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-24">
          {allImages.map((imageUrl, index) => (
            <div 
              key={index}
              onClick={() => handleImageSelect(imageUrl)}
              className={`
                aspect-[4/3] 
                overflow-hidden 
                rounded-lg 
                bg-gray-800 
                cursor-pointer
                transition-all
                duration-300
                ${selectedImage === imageUrl ? 'ring-2 ring-[#C6A87D]' : 'hover:opacity-80'}
              `}
            >
              <img
                src={imageUrl}
                alt={`Project image ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="bg-[#1B2537] py-16">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Interested in this project?
            </h2>
            <p className="text-gray-300 mb-8 text-center">
              Get in touch with us to learn more about this project or discuss your own architectural needs.
            </p>
            <ContactForm />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-24 border-t border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 py-16">
          <div>
            <h3 className="text-white text-xl mb-4">
              <span className="font-normal">KIMTHE</span>
              <span className="text-[#C6A87D]">ARCHITECT</span>
            </h3>
            <p className="text-gray-400 text-sm">
              Creating innovative architectural solutions that inspire and transform spaces into extraordinary experiences.
            </p>
          </div>

          <div>
            <h3 className="text-white text-lg mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link href="/" className="block text-gray-400 hover:text-[#C6A87D]">Home</Link>
              <Link href="/projects" className="block text-gray-400 hover:text-[#C6A87D]">Projects</Link>
              <Link href="/about" className="block text-gray-400 hover:text-[#C6A87D]">About</Link>
              <Link href="/contact" className="block text-gray-400 hover:text-[#C6A87D]">Contact</Link>
            </div>
          </div>

          <div>
            <h3 className="text-white text-lg mb-4">Contact Info</h3>
            <div className="space-y-2">
              <a 
                href="mailto:kimthearchitect0@gmail.com" 
                className="block text-gray-400 hover:text-[#C6A87D]"
              >
                kimthearchitect0@gmail.com
              </a>
              <p className="text-gray-400">+254 196 98588</p>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block text-gray-400 hover:text-[#C6A87D]"
              >
                Follow us on Instagram
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 py-8">
          <p className="text-center text-gray-400 text-sm">
            © 2025 Kimthearchitect. All rights reserved.
          </p>
        </div>
      </footer>
    </Container>
  )
} 