'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error
      
      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1A1F2E] px-4">
        <div className="max-w-md w-full space-y-8 p-8 bg-white/10 rounded-xl backdrop-blur-md">
          <h2 className="text-2xl font-bold text-center text-white">Check your email</h2>
          <p className="text-center text-white/80">
            We've sent you a password reset link. Please check your inbox to reset your password.
          </p>
          <Link 
            href="/login"
            className="block w-full text-center py-3 px-4 rounded-lg bg-[#DBA463] text-white hover:bg-[#DBA463]/90 transition-colors"
          >
            Return to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1A1F2E] px-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white/10 rounded-xl backdrop-blur-md">
        <div>
          <h2 className="text-3xl font-bold text-center text-white">Reset Password</h2>
          <p className="mt-2 text-center text-white/60">
            Enter your email to receive a password reset link
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/80">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#DBA463] focus:border-transparent"
              placeholder="Enter your email"
            />
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
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>

          <p className="text-center text-white/60">
            Remember your password?{' '}
            <Link href="/login" className="text-[#DBA463] hover:text-[#DBA463]/90">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
} 