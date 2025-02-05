'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-8">
      <img 
        src="/Kim The Architect.png" 
        alt="Kim The Architect" 
        className="h-12"
      />
      
      <div className="flex space-x-8">
        <a href="#" className="text-white">Instagram</a>
        <a href="#" className="text-white">LinkedIn</a>
        <a href="#" className="text-white">Twitter</a>
      </div>

      <p className="text-gray-400">
        © 2025 Kim The Architect. All rights reserved.
      </p>
    </div>
  )
} 