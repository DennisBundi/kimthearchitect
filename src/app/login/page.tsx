'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

function LoginContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      console.log('Attempting login with:', email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      })

      if (error) {
        console.error('Login error:', error)
        throw error
      }

      if (data.user) {
        console.log('Login successful:', data.user.email)
        
        // Directly navigate based on user email
        if (data.user.email?.toLowerCase() === 'kimthearchitect0@gmail.com'.toLowerCase()) {
          // Force a hard navigation to the admin page
          console.log('Admin user detected, redirecting to /admin')
          window.location.href = '/admin'
        } else {
          console.log('Regular user detected, redirecting to:', callbackUrl)
          window.location.href = callbackUrl
        }
      }
    } catch (error: any) {
      console.error('Error in login:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1A1F2E] px-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white/10 rounded-xl backdrop-blur-md">
        <div>
          <h2 className="text-3xl font-bold text-center text-white">Welcome Back</h2>
          <p className="mt-2 text-center text-white/60">
            Sign in to your account
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/80">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#DBA463] focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/80">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#DBA463] focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember_me"
                name="remember_me"
                type="checkbox"
                className="h-4 w-4 rounded border-white/10 bg-white/5 text-[#DBA463] focus:ring-[#DBA463]"
              />
              <label htmlFor="remember_me" className="ml-2 block text-sm text-white/80">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link href="/forgot-password" className="text-[#DBA463] hover:text-[#DBA463]/90">
                Forgot password?
              </Link>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg bg-[#DBA463] text-white hover:bg-[#DBA463]/90 transition-colors
              ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="text-center text-white/60">
            Don't have an account?{' '}
            <Link href="/signup" className="text-[#DBA463] hover:text-[#DBA463]/90">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
} 