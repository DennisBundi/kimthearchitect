'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion, useScroll } from 'framer-motion'
import Image from 'next/image'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { scrollY } = useScroll()
  const [isScrolled, setIsScrolled] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  useEffect(() => {
    return scrollY.onChange((latest) => {
      setIsScrolled(latest > 50)
    })
  }, [scrollY])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  // Function to get user initials
  const getUserInitials = (email: string) => {
    return email
      .split('@')[0]
      .split('.')
      .map(part => part[0].toUpperCase())
      .join('')
  }

  const renderAuthSection = () => {
    if (!user) {
      return (
        <div className="flex items-center space-x-4">
          <Link href="/login" className="text-white hover:text-[#DBA463] transition-colors">
            Login
          </Link>
          <Link href="/signup" className="bg-[#DBA463] text-white px-4 py-2 rounded-lg hover:bg-[#DBA463]/90 transition-colors">
            Sign Up
          </Link>
        </div>
      )
    }

    if (user.email === 'kimthearchitect0@gmail.com') {
      return (
        <div className="flex items-center space-x-4">
          <Link href="/admin/dashboard" className="text-white hover:text-[#DBA463] transition-colors">
            Dashboard
          </Link>
          <button
            onClick={handleLogout}
            className="bg-[#DBA463] text-white px-4 py-2 rounded-lg hover:bg-[#DBA463]/90 transition-colors"
          >
            Logout
          </button>
        </div>
      )
    }

    return (
      <div className="flex items-center space-x-4">
        <div className="bg-[#DBA463] w-8 h-8 rounded-full flex items-center justify-center">
          <span className="text-white font-semibold">{getUserInitials(user.email)}</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-white hover:text-[#DBA463] transition-colors"
        >
          Logout
        </button>
      </div>
    )
  }

  return (
    <motion.nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-[#1A1F2E]/95 backdrop-blur-sm py-4' : 'bg-transparent py-6'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="relative w-auto h-[70px]">
              <Image
                src="/mainlogo.svg"
                alt="Kim The Architect Logo"
                width={150}
                height={70}
                priority
              />
            </div>
          </Link>

          {/* Navigation Links and Auth Section */}
          <div className="hidden md:flex items-center">
            {/* Nav Links */}
            <div className="flex space-x-8 mr-8">
              <Link href="/" className="text-white hover:text-[#DBA463] transition-colors">
                HOME
              </Link>
              <Link href="/projects" className="text-white hover:text-[#DBA463] transition-colors">
                PROJECTS
              </Link>
              <Link href="/about" className="text-white hover:text-[#DBA463] transition-colors">
                ABOUT
              </Link>
              <Link href="/contact" className="text-white hover:text-[#DBA463] transition-colors">
                CONTACT
              </Link>
            </div>

            {/* Auth Section */}
            {renderAuthSection()}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white p-2"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link href="/" className="block text-white hover:text-[#DBA463] transition-colors">
                HOME
              </Link>
              <Link href="/projects" className="block text-white hover:text-[#DBA463] transition-colors">
                PROJECTS
              </Link>
              <Link href="/about" className="block text-white hover:text-[#DBA463] transition-colors">
                ABOUT
              </Link>
              <Link href="/contact" className="block text-white hover:text-[#DBA463] transition-colors">
                CONTACT
              </Link>
              <div className="pt-4">
                {renderAuthSection()}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.nav>
  )
} 