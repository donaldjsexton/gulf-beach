'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

interface Vendor {
  id: string
  name: string
  email: string | null
  phone: string | null
  website: string | null
  description: string | null
  category: string
  status: 'active' | 'inactive'
  created_at: string
}

export default function VendorsPage() {
  const router = useRouter()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchVendors()
  }, [])

  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      setVendors(data || [])
    } catch (err) {
      console.error('Error fetching vendors:', err)
      setError('Failed to load vendors')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vendor?')) return

    try {
      const { error } = await supabase.from('vendors').delete().eq('id', id)
      if (error) throw error
      setVendors(vendors.filter((vendor) => vendor.id !== id))
    } catch (err) {
      console.error('Error deleting vendor:', err)
      setError('Failed to delete vendor')
    }
  }

  if (isLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">Vendors</h1>
          </div>
        </div>
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <div className="h-96 animate-pulse bg-gray-100" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Vendors</h1>
      <p className="text-gray-600">This is the vendors list page. Build out the table or list here.</p>
    </div>
  )
} 