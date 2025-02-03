'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FiHome, FiUsers, FiSettings, FiFolder, FiMenu, FiLogOut, FiPieChart, FiMail } from 'react-icons/fi'
import { Toaster } from 'react-hot-toast'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Function to check if link is active
  const isActive = (path: string) => pathname === path

  // Function to get link classes
  const getLinkClasses = (path: string) => {
    return `flex items-center px-4 py-2 rounded-lg transition-colors ${
      isActive(path)
        ? 'bg-[#DBA463] text-white'
        : 'text-white hover:bg-white/5'
    }`
  }

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
      }
      setLoading(false)
    }

    checkSession()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1A1F2E]">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-[#1A1F2E] flex">
        {/* Fixed Sidebar */}
        <div className={`${isSidebarOpen ? 'w-64' : 'w-20'} fixed left-0 top-0 h-screen bg-white/10 flex flex-col transition-all duration-300`}>
          <div className="p-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="w-full flex items-center justify-center p-2 rounded-lg text-white hover:bg-white/5 transition-colors"
            >
              <FiMenu size={24} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto">
            {/* Main Navigation */}
            <div className="px-2 space-y-1">
              <Link 
                href="/"
                className={getLinkClasses('/')}
              >
                <FiHome className="mr-3" size={20} />
                {isSidebarOpen && <span>Home</span>}
              </Link>
              <Link 
                href="/about"
                className={getLinkClasses('/about')}
              >
                <FiUsers className="mr-3" size={20} />
                {isSidebarOpen && <span>About</span>}
              </Link>
              <Link 
                href="/projects"
                className={getLinkClasses('/projects')}
              >
                <FiFolder className="mr-3" size={20} />
                {isSidebarOpen && <span>Projects</span>}
              </Link>
              <Link 
                href="/contact"
                className={getLinkClasses('/contact')}
              >
                <FiMail className="mr-3" size={20} />
                {isSidebarOpen && <span>Contact</span>}
              </Link>
            </div>

            {/* Admin Section Divider */}
            <div className="mt-8 mb-4">
              {isSidebarOpen && (
                <div className="px-4 text-xs font-semibold text-white/40 uppercase tracking-wider">
                  Admin
                </div>
              )}
            </div>

            {/* Admin Navigation */}
            <div className="px-2 space-y-1">
              <Link 
                href="/admin"
                className={getLinkClasses('/admin')}
              >
                <FiPieChart className="mr-3" size={20} />
                {isSidebarOpen && <span>Dashboard</span>}
              </Link>
              <Link 
                href="/admin/projects"
                className={getLinkClasses('/admin/projects')}
              >
                <FiFolder className="mr-3" size={20} />
                {isSidebarOpen && <span>Manage Projects</span>}
              </Link>
              <Link 
                href="/admin/users"
                className={getLinkClasses('/admin/users')}
              >
                <FiUsers className="mr-3" size={20} />
                {isSidebarOpen && <span>Manage Users</span>}
              </Link>
              <Link 
                href="/admin/settings"
                className={getLinkClasses('/admin/settings')}
              >
                <FiSettings className="mr-3" size={20} />
                {isSidebarOpen && <span>Settings</span>}
              </Link>
            </div>
          </nav>

          {/* Sign Out Button */}
          <div className="p-4 border-t border-white/10">
            <button
              onClick={async () => {
                await supabase.auth.signOut()
                router.push('/login')
              }}
              className="w-full flex items-center text-white hover:text-red-500 px-4 py-2 rounded-lg transition-colors"
            >
              <FiLogOut className="mr-3" size={20} />
              {isSidebarOpen && <span>Sign Out</span>}
            </button>
          </div>
        </div>

        {/* Main Content with left margin to account for fixed sidebar */}
        <div className={`flex-1 ${isSidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
          {/* Top Navigation */}
          <div className="bg-white/5 p-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <h1 className="text-white text-xl font-semibold">
                {pathname === '/admin' && 'Dashboard'}
                {pathname === '/admin/projects' && 'Manage Projects'}
                {pathname === '/admin/users' && 'Manage Users'}
                {pathname === '/admin/settings' && 'Settings'}
              </h1>
            </div>
          </div>

          {/* Page Content */}
          <main className="max-w-7xl mx-auto p-8">
            {children}
          </main>
        </div>
      </div>
      <Toaster position="top-right" />
    </>
  )
} 