'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { FiFolder, FiUsers, FiLayout, FiBook } from 'react-icons/fi'
import { Line, Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'

interface User {
  id: string
  email: string
  created_at: string
  last_sign_in_at?: string
}

interface DashboardStats {
  completedProjects: number
  activeUsers: number
  openProjects: number
  blueprints: number
  projectsData: number[]
  userDistribution: number[]
}

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    completedProjects: 0,
    activeUsers: 0,
    openProjects: 0,
    blueprints: 0,
    projectsData: [],
    userDistribution: []
  })
  const [dateRange, setDateRange] = useState('7')
  const [projectType, setProjectType] = useState('all')

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

      // Fetch featured projects
      const { data: featuredProjects, error: featuredError } = await supabase
        .from('projects')
        .select('*', { count: 'exact' })
        .eq('featured', true)

      if (featuredError) throw featuredError

      // Fetch users data
      const usersResponse = await fetch('/api/admin/users')
      const { users = [] } = await usersResponse.json() as { users: User[] }

      // Get projects data for timeline
      const { data: monthlyProjects, error: monthlyError } = await supabase
        .from('projects')
        .select('created_at')
        .order('created_at', { ascending: true })

      if (monthlyError) throw monthlyError

      // Process monthly projects data
      const projectsData = processMonthlyData(monthlyProjects || [])

      // Calculate user distribution with proper typing
      const activeUsers = users.filter((u: User) => u.last_sign_in_at).length
      const newUsers = users.filter((u: User) => isNewUser(u.created_at)).length
      const inactiveUsers = users.length - activeUsers

      const userDistribution = [activeUsers, newUsers, inactiveUsers]

      setStats({
        completedProjects: featuredProjects?.length || 0,
        activeUsers: users.length || 0,
        openProjects: projects?.length || 0,
        blueprints: 81,
        projectsData,
        userDistribution
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
      setStats({
        completedProjects: 0,
        activeUsers: 0,
        openProjects: 0,
        blueprints: 0,
        projectsData: [0, 0, 0, 0, 0, 0],
        userDistribution: [0, 0, 0]
      })
    } finally {
      setLoading(false)
    }
  }

  // Helper functions
  function processMonthlyData(projects: any[]) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    const monthlyCount = new Array(6).fill(0)
    
    projects.forEach(project => {
      const month = new Date(project.created_at).getMonth()
      if (month < 6) monthlyCount[month]++
    })
    
    return monthlyCount
  }

  function isNewUser(created_at: string) {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return new Date(created_at) > thirtyDaysAgo
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white">Loading stats...</div>
      </div>
    )
  }

  function fetchGraphData(value: string, projectType: string) {
    throw new Error('Function not implemented.')
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
        <h2 className="text-xl font-semibold text-white mb-4">Project Analytics</h2>
        <div className="flex items-center justify-between mb-4">
          {/* Filter by date range */}
          <select 
            value={dateRange}
            className="px-4 py-2 bg-[#1a1f2e] border border-white/10 rounded-lg text-white 
            focus:outline-none focus:ring-2 focus:ring-[#DBA463] focus:border-transparent
            appearance-none cursor-pointer hover:bg-[#252b3b]"
            style={{
              backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 1rem center',
              backgroundSize: '1em'
            }}
            onChange={(e) => {
              setDateRange(e.target.value);
              fetchGraphData(e.target.value, projectType);
            }}
          >
            <option value="7" className="bg-[#DBA463] text-white hover:bg-[#DBA463]/90">Last 7 days</option>
            <option value="30" className="bg-[#DBA463] text-white hover:bg-[#DBA463]/90">Last 30 days</option>
            <option value="90" className="bg-[#DBA463] text-white hover:bg-[#DBA463]/90">Last 3 months</option>
            <option value="180" className="bg-[#DBA463] text-white hover:bg-[#DBA463]/90">Last 6 months</option>
            <option value="365" className="bg-[#DBA463] text-white hover:bg-[#DBA463]/90">Last year</option>
          </select>

          {/* Filter by project type */}
          <select 
            value={projectType}
            className="px-4 py-2 bg-[#1a1f2e] border border-white/10 rounded-lg text-white 
            focus:outline-none focus:ring-2 focus:ring-[#DBA463] focus:border-transparent
            appearance-none cursor-pointer hover:bg-[#252b3b]"
            style={{
              backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 1rem center',
              backgroundSize: '1em'
            }}
            onChange={(e) => {
              setProjectType(e.target.value);
              fetchGraphData(dateRange, e.target.value);
            }}
          >
            <option value="all" className="bg-[#DBA463] text-white hover:bg-[#DBA463]/90">All Projects</option>
            <option value="featured" className="bg-[#DBA463] text-white hover:bg-[#DBA463]/90">Featured Projects</option>
            <option value="active" className="bg-[#DBA463] text-white hover:bg-[#DBA463]/90">Active Projects</option>
            <option value="completed" className="bg-[#DBA463] text-white hover:bg-[#DBA463]/90">Completed Projects</option>
          </select>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Projects Timeline Chart */}
          <div className="bg-white/5 rounded-lg p-4">
            <h3 className="text-white/90 font-semibold mb-4">Projects Timeline</h3>
            <Line
              data={{
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                  label: 'Projects',
                  data: stats.projectsData,
                  borderColor: '#DBA463',
                  backgroundColor: '#DBA463',
                  tension: 0.4
                }]
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                    labels: { color: 'white' }
                  }
                },
                scales: {
                  y: {
                    ticks: { color: 'white' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                  },
                  x: {
                    ticks: { color: 'white' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                  }
                }
              }}
            />
          </div>

          {/* User Distribution Pie Chart */}
          <div className="bg-white/5 rounded-lg p-4">
            <h3 className="text-white/90 font-semibold mb-4">User Distribution</h3>
            <Pie
              data={{
                labels: ['Active Users', 'New Users', 'Inactive Users'],
                datasets: [{
                  data: stats.userDistribution,
                  backgroundColor: [
                    '#DBA463',
                    '#8B4513',
                    '#CD853F'
                  ],
                  borderColor: 'rgba(255, 255, 255, 0.1)'
                }]
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { color: 'white' }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
} 