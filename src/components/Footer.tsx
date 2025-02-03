'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#1A1F2E] text-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-light mb-4">
              KIMTHE<span className="text-[#DBA463]">ARCHITECT</span>
            </h3>
            <p className="text-sm text-white/60 mb-4">
              Creating innovative architectural solutions that inspire and transform spaces into extraordinary experiences.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-light mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-white/60 hover:text-[#DBA463] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/projects" className="text-white/60 hover:text-[#DBA463] transition-colors">
                  Projects
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-white/60 hover:text-[#DBA463] transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white/60 hover:text-[#DBA463] transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 mt-12 pt-8 text-center text-sm text-white/60">
          <p>© {new Date().getFullYear()} Kimthearchitect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
} 
{/* Logo and Description */}
<div className="col-span-1 md:col-span-2">
  <h3 className="text-2xl font-light mb-4">
    KIMTH<span className="text-[#DBA463]">ARCHITECT</span>
  </h3>
  <p className="text-sm text-white/60 mb-4">
    Creating innovative architectural solutions that inspire and transform spaces into extraordinary experiences.
  </p>
</div>

{/* ... rest of footer ... */}

{/* Copyright */}
<div className="border-t border-white/10 mt-12 pt-8 text-center text-sm text-white/60">
  <p>© {new Date().getFullYear()} Kimthearchitect. All rights reserved.</p>
</div> 