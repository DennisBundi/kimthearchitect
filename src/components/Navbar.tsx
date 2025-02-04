'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion, useScroll } from 'framer-motion'
import Image from 'next/image'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { scrollY } = useScroll()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    return scrollY.onChange((latest) => {
      setIsScrolled(latest > 50)
    })
  }, [scrollY])

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

          {/* Navigation Links and Auth Buttons */}
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

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <Link 
                href="/login" 
                className="text-white hover:text-[#DBA463] transition-colors"
              >
                Login
              </Link>
              <Link 
                href="/signup" 
                className="bg-[#DBA463] text-white px-4 py-2 rounded-lg hover:bg-[#DBA463]/90 transition-colors"
              >
                Sign Up
              </Link>
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
      </div>
    </motion.nav>
  )
} 