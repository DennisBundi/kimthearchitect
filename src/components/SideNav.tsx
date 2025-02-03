'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function SideNav() {
  const pathname = usePathname()
  
  // Check if we're in the admin section and highlight "Manage Projects" for all admin routes
  const isAdminSection = pathname.startsWith('/admin')

  return (
    <div className="w-64 bg-[#1B2028] min-h-screen p-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <Link
            href="/"
            className={`block px-4 py-2 rounded-lg transition-colors ${
              pathname === '/' ? 'text-[#C6A87D]' : 'text-white hover:text-[#C6A87D]'
            }`}
          >
            Home
          </Link>
          <Link
            href="/about"
            className={`block px-4 py-2 rounded-lg transition-colors ${
              pathname === '/about' ? 'text-[#C6A87D]' : 'text-white hover:text-[#C6A87D]'
            }`}
          >
            About
          </Link>
          <Link
            href="/projects"
            className={`block px-4 py-2 rounded-lg transition-colors ${
              pathname === '/projects' ? 'text-[#C6A87D]' : 'text-white hover:text-[#C6A87D]'
            }`}
          >
            Projects
          </Link>
          <Link
            href="/contact"
            className={`block px-4 py-2 rounded-lg transition-colors ${
              pathname === '/contact' ? 'text-[#C6A87D]' : 'text-white hover:text-[#C6A87D]'
            }`}
          >
            Contact
          </Link>
        </div>

        <div className="pt-4 border-t border-gray-700">
          <p className="px-4 text-sm text-gray-400 mb-2">ADMIN</p>
          <div className="space-y-2">
            <Link
              href="/admin/dashboard"
              className={`block px-4 py-2 rounded-lg transition-colors ${
                pathname === '/admin/dashboard' ? 'text-[#C6A87D]' : 'text-white hover:text-[#C6A87D]'
              }`}
            >
              Dashboard
            </Link>
            <div 
              className={`block px-4 py-2 rounded-lg transition-colors ${
                isAdminSection 
                  ? 'bg-[#C6A87D]/10'
                  : ''
              }`}
            >
              <Link
                href="/admin/projects"
                className={`block transition-colors ${
                  isAdminSection 
                    ? 'text-[#C6A87D] font-medium'
                    : 'text-white hover:text-[#C6A87D]'
                }`}
              >
                Manage Projects
              </Link>
            </div>
            <Link
              href="/admin/users"
              className={`block px-4 py-2 rounded-lg transition-colors ${
                pathname === '/admin/users' ? 'text-[#C6A87D]' : 'text-white hover:text-[#C6A87D]'
              }`}
            >
              Manage Users
            </Link>
            <Link
              href="/admin/settings"
              className={`block px-4 py-2 rounded-lg transition-colors ${
                pathname === '/admin/settings' ? 'text-[#C6A87D]' : 'text-white hover:text-[#C6A87D]'
              }`}
            >
              Settings
            </Link>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-700">
          <Link
            href="/api/auth/signout"
            className="block px-4 py-2 text-white hover:text-[#C6A87D] transition-colors"
          >
            Sign Out
          </Link>
        </div>
      </div>
    </div>
  )
} 