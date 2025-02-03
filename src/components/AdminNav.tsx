'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <div className="bg-[#1B2028] p-4 flex justify-between items-center shadow-[0_0_15px_rgba(198,168,125,0.2)]">
      <h1 className="text-white text-2xl font-bold">Admin Dashboard</h1>
      <div className="flex gap-4">
        <Link 
          href="/admin/projects"
          className={`transition-colors ${
            pathname === '/admin/projects'
              ? 'text-[#C6A87D] underline underline-offset-4 font-semibold'
              : 'text-white hover:text-[#C6A87D]'
          }`}
        >
          Manage Projects
        </Link>
        <Link 
          href="/admin/contacts" 
          className={`transition-colors ${
            pathname === '/admin/contacts'
              ? 'text-[#C6A87D] underline underline-offset-4 font-semibold'
              : 'text-white hover:text-[#C6A87D]'
          }`}
        >
          View Contacts
        </Link>
        <Link 
          href="/admin/projects/list" 
          className={`transition-colors ${
            pathname === '/admin/projects/list'
              ? 'text-[#C6A87D] underline underline-offset-4 font-semibold'
              : 'text-white hover:text-[#C6A87D]'
          }`}
        >
          View Projects
        </Link>
        <Link 
          href="/" 
          className="text-white hover:text-[#C6A87D] transition-colors"
        >
          Back to Site
        </Link>
      </div>
    </div>
  )
} 