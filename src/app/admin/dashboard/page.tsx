'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AdminDashboard() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const checkUser = () => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
          router.push('/login')
          return
        }

        if (session.user.email !== 'kimthearchitect0@gmail.com') {
          router.push('/')
          return
        }

        setUserEmail(session.user.email)
        setLoading(false)

        // Set the initial admin dashboard state
        const dashboardLink = document.querySelector('a[href="/admin/dashboard"]')
        if (dashboardLink instanceof HTMLElement) {
          dashboardLink.click()
        }
      }).catch((error) => {
        console.error('Error checking auth:', error)
        router.push('/login')
      })
    }

    checkUser()
  }, [router, supabase.auth])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="p-8">
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-2">Welcome</h3>
        <p>Logged in as: {userEmail}</p>
      </div>
    </div>
  )
} 