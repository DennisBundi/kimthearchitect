'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { FiFolder, FiUsers, FiLayout, FiBook } from 'react-icons/fi'

interface DashboardStats {
  completedProjects: number
  activeUsers: number
  openProjects: number
  blueprints: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    completedProjects: 0,
    activeUsers: 0,
    openProjects: 0,
    blueprints: 0
  })

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      // Fetch projects count
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*', { count: 'exact' })

      if (projectsError) throw projectsError

      // You can add more specific queries based on your data structure
      setStats({
        completedProjects: 5, // Replace with actual completed projects count
        activeUsers: 0, // Replace with actual active users count
        openProjects: projects?.length || 42, // Using actual projects count
        blueprints: 81 // Replace with actual blueprints count
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white">Loading stats...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Design Stats */}
        <div className="bg-[#DBA463] rounded-lg p-6 transition-transform hover:scale-105">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white/90">Design Stats</h2>
            <FiLayout className="text-white/80" size={24} />
          </div>
          <div className="mt-4">
            <p className="text-4xl font-bold text-white">{stats.completedProjects}</p>
            <p className="text-sm text-white/60 mt-1">+3% from last month</p>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-[#DBA463] rounded-lg p-6 transition-transform hover:scale-105">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white/90">Active Users</h2>
            <FiUsers className="text-white/80" size={24} />
          </div>
          <div className="mt-4">
            <p className="text-4xl font-bold text-white">{stats.activeUsers}</p>
            <p className="text-sm text-white/60 mt-1">+3% from last month</p>
          </div>
        </div>

        {/* Open Projects */}
        <div className="bg-[#DBA463] rounded-lg p-6 transition-transform hover:scale-105">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white/90">Open Projects</h2>
            <FiFolder className="text-white/80" size={24} />
          </div>
          <div className="mt-4">
            <p className="text-4xl font-bold text-white">{stats.openProjects}</p>
            <p className="text-sm text-white/60 mt-1">+3% from last month</p>
          </div>
        </div>

        {/* Blueprints */}
        <div className="bg-[#DBA463] rounded-lg p-6 transition-transform hover:scale-105">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white/90">Blueprints</h2>
            <FiBook className="text-white/80" size={24} />
          </div>
          <div className="mt-4">
            <p className="text-4xl font-bold text-white">{stats.blueprints}</p>
            <p className="text-sm text-white/60 mt-1">+3% from last month</p>
          </div>
        </div>
      </div>

      {/* Graphs Section */}
      <div className="bg-white/10 rounded-lg p-6 mt-8">
        <h2 className="text-xl font-semibold text-white mb-4">Graphs</h2>
        <div className="flex items-center justify-between mb-4">
          <input
            type="text"
            placeholder="Search for a metric"
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#DBA463] focus:border-transparent"
          />
          <select className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#DBA463] focus:border-transparent">
            <option value="">Sort by</option>
            <option value="date">Date</option>
            <option value="value">Value</option>
          </select>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/5 rounded-lg p-4 h-64 flex items-center justify-center">
            <p className="text-white/40">Chart will be implemented here</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 h-64 flex items-center justify-center">
            <p className="text-white/40">Chart will be implemented here</p>
          </div>
        </div>
      </div>
    </div>
  )
} 