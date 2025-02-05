'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion, useScroll } from 'framer-motion'
import Image from 'next/image'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Container from '@/components/Container'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { scrollY } = useScroll()
  const [isScrolled, setIsScrolled] = useState(false)
  const [user, setUser] = useState<any>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  useEffect(() => {
    return scrollY.onChange((latest) => {
      setIsScrolled(latest > 50)
    })
  }, [scrollY])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const isAdmin = user?.email === 'kimthearchitect0@gmail.com'

  return (
    <motion.nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-[#1A1F2E]/95 backdrop-blur-sm py-4' : 'bg-transparent py-6'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container>
        <div className="px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="relative w-auto h-[70px]">
                <Image
                  src="/mainlogo.svg"
                  alt="Kim The Architect Logo"
                  width={300}
                  height={132}
                  priority
                  className="h-12 w-auto"
                />
              </div>
            </Link>
          </div>

          {/* Navigation Links and Auth Buttons */}
          <div className="flex items-center gap-x-8">
            {/* Nav Links */}
            <div className="flex space-x-8">
              <Link href="/" className="text-white hover:text-[#C6A87D]">
                HOME
              </Link>
              <Link href="/projects" className="text-white hover:text-[#C6A87D]">
                PROJECTS
              </Link>
              <Link href="/about" className="text-white hover:text-[#C6A87D]">
                ABOUT
              </Link>
              <Link href="/contact" className="text-white hover:text-[#C6A87D]">
                CONTACT
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              {isAdmin && (
                <Link 
                  href="/admin/dashboard" 
                  className="text-[#C6A87D] hover:text-white"
                >
                  Dashboard
                </Link>
              )}

              {user ? (
                <button 
                  onClick={handleSignOut}
                  className="px-4 py-2 border border-[#C6A87D] text-[#C6A87D] rounded-md hover:bg-[#C6A87D] hover:text-white transition-colors"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className="px-4 py-2 border border-[#C6A87D] text-[#C6A87D] rounded-md hover:bg-[#C6A87D] hover:text-white transition-colors"
                  >
                    Login
                  </Link>
                  <Link 
                    href="/signup" 
                    className="px-4 py-2 bg-[#C6A87D] text-white rounded-md hover:bg-[#B59768] transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
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
          </motion.button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-full left-0 right-0 bg-[#1A1F2E]/95 backdrop-blur-sm"
          >
            <div className="px-4 py-6 space-y-4">
              {['HOME', 'PROJECTS', 'ABOUT', 'CONTACT'].map((item) => (
                <Link
                  key={item}
                  href={item === 'HOME' ? '/' : `/${item.toLowerCase()}`}
                  className="block text-white/80 hover:text-[#DBA463] transition-colors text-sm tracking-wider"
                  onClick={() => setIsOpen(false)}
                >
                  {item}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </Container>
    </motion.nav>
  )
} 