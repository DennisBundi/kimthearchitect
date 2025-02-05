import { DocumentTextIcon } from '@heroicons/react/16/solid'
import { ClockIcon, FolderIcon, UsersIcon, CogIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="admin-section">
      <div className="label">ADMIN</div>
      
      <Link 
        href="/admin/dashboard"
        className={pathname === '/admin/dashboard' ? 'active' : ''}
      >
        <ClockIcon /> Dashboard
      </Link>
      
      <Link 
        href="/admin/manage-projects"
        className={pathname === '/admin/manage-projects' ? 'active' : ''}
      >
        <FolderIcon /> Manage Projects
      </Link>
      
      <Link 
        href="/admin/invoices"
        className={pathname === '/admin/invoices' ? 'active' : ''}
      >
        <DocumentTextIcon /> Invoices
      </Link>
      
      <Link 
        href="/admin/manage-users"
        className={pathname === '/admin/manage-users' ? 'active' : ''}
      >
        <UsersIcon /> Manage Users
      </Link>
      
      <Link 
        href="/admin/settings"
        className={pathname === '/admin/settings' ? 'active' : ''}
      >
        <CogIcon /> Settings
      </Link>
    </div>
  )
} 