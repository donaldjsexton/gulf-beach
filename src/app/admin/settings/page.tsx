'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

interface Settings {
  id: string
  site_name: string
  site_description: string
  contact_email: string
  contact_phone: string
  address: string
  facebook_url: string
  instagram_url: string
  twitter_url: string
  created_at: string
  updated_at: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single()

      if (error) throw error
      setSettings(data)
    } catch (err) {
      setError('Failed to fetch settings')
      console.error('Error fetching settings:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccessMessage(null)

    const formData = new FormData(e.target as HTMLFormElement)
    const updatedSettings = {
      site_name: formData.get('site_name') as string,
      site_description: formData.get('site_description') as string,
      contact_email: formData.get('contact_email') as string,
      contact_phone: formData.get('contact_phone') as string,
      address: formData.get('address') as string,
      facebook_url: formData.get('facebook_url') as string,
      instagram_url: formData.get('instagram_url') as string,
      twitter_url: formData.get('twitter_url') as string,
    }

    try {
      if (settings) {
        const { error } = await supabase
          .from('settings')
          .update(updatedSettings)
          .eq('id', settings.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('settings')
          .insert([updatedSettings])
        if (error) throw error
      }
      setSuccessMessage('Settings saved successfully')
      fetchSettings()
    } catch (err) {
      setError('Failed to save settings')
      console.error('Error saving settings:', err)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <p className="text-gray-600">This is the settings page. Build out the settings form and controls here.</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Success!</strong>
          <span className="block sm:inline"> {successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow sm:rounded-md">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="site_name" className="block text-sm font-medium text-gray-700">
                  Site Name
                </label>
                <input
                  type="text"
                  name="site_name"
                  id="site_name"
                  defaultValue={settings?.site_name}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="site_description" className="block text-sm font-medium text-gray-700">
                  Site Description
                </label>
                <textarea
                  name="site_description"
                  id="site_description"
                  rows={3}
                  defaultValue={settings?.site_description}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700">
                  Contact Email
                </label>
                <input
                  type="email"
                  name="contact_email"
                  id="contact_email"
                  defaultValue={settings?.contact_email}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  name="contact_phone"
                  id="contact_phone"
                  defaultValue={settings?.contact_phone}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <textarea
                  name="address"
                  id="address"
                  rows={3}
                  defaultValue={settings?.address}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="facebook_url" className="block text-sm font-medium text-gray-700">
                  Facebook URL
                </label>
                <input
                  type="url"
                  name="facebook_url"
                  id="facebook_url"
                  defaultValue={settings?.facebook_url}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="instagram_url" className="block text-sm font-medium text-gray-700">
                  Instagram URL
                </label>
                <input
                  type="url"
                  name="instagram_url"
                  id="instagram_url"
                  defaultValue={settings?.instagram_url}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="twitter_url" className="block text-sm font-medium text-gray-700">
                  Twitter URL
                </label>
                <input
                  type="url"
                  name="twitter_url"
                  id="twitter_url"
                  defaultValue={settings?.twitter_url}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
} 