'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

const images = ['/about1.jpg', '/about2.jpg', '/about3.jpg']

export default function ImageSlideshow() {
  const [currentImage, setCurrentImage] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length)
    }, 5000) // Change image every 5 seconds

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative w-full h-[60vh] overflow-hidden">
      {images.map((src, index) => (
        <div
          key={src}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ease-in-out
            ${index === currentImage ? 'opacity-100' : 'opacity-0'}`}
        >
          <Image
            src={src}
            alt={`About Us Slide ${index + 1}`}
            fill
            priority={index === 0}
            className="object-cover"
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/50" />
        </div>
      ))}
    </div>
  )
} 