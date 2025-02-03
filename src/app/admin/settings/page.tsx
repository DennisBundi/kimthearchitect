'use client'

import { useState } from 'react'
import { FiSave, FiRefreshCw } from 'react-icons/fi'
import { supabase } from '@/lib/supabase/client'

interface SettingsForm {
  siteName: string
  siteDescription: string
  contactEmail: string
  maintenanceMode: boolean
  theme: 'light' | 'dark'
}

export default function Settings() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [settings, setSettings] = useState<SettingsForm>({
    siteName: 'Kim The Architect',
    siteDescription: 'Architecture and Design Portfolio',
    contactEmail: 'kimthearchitect0@gmail.com',
    maintenanceMode: false,
    theme: 'dark'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    try {
      // Save settings to Supabase
      const { error } = await supabase
        .from('settings')
        .upsert({
          id: 1, // Single row for site settings
          ...settings,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        {success && (
          <div className="text-green-500 flex items-center">
            <FiRefreshCw className="mr-2" />
            Settings saved successfully!
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Settings */}
        <div className="bg-white/10 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">General Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">
                Site Name
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#DBA463] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">
                Site Description
              </label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#DBA463] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#DBA463] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="bg-white/10 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Appearance</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">
                Theme
              </label>
              <select
                value={settings.theme}
                onChange={(e) => setSettings({ ...settings, theme: e.target.value as 'light' | 'dark' })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#DBA463] focus:border-transparent"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>
        </div>

        {/* Maintenance Settings */}
        <div className="bg-white/10 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Maintenance</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="maintenanceMode"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="h-4 w-4 rounded border-white/10 bg-white/5 text-[#DBA463] focus:ring-[#DBA463]"
              />
              <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-white">
                Enable Maintenance Mode
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-6 py-2 bg-[#DBA463] text-white rounded-lg hover:bg-[#DBA463]/90 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <FiRefreshCw className="animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <FiSave className="mr-2" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
} 