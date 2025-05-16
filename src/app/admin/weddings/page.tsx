'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

interface Wedding {
  id: string
  title: string
  date: string
  location: string
  status: 'upcoming' | 'completed' | 'cancelled'
  created_at: string
}

export default function WeddingsPage() {
  const [weddings, setWeddings] = useState<Wedding[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchWeddings()
  }, [])

  const fetchWeddings = async () => {
    try {
      const { data, error } = await supabase
        .from('weddings')
        .select('*')
        .order('date', { ascending: true })

      if (error) throw error
      setWeddings(data || [])
    } catch (err) {
      console.error('Error fetching weddings:', err)
      setError('Failed to load weddings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this wedding?')) return

    try {
      const { error } = await supabase.from('weddings').delete().eq('id', id)
      if (error) throw error
      setWeddings(weddings.filter((wedding) => wedding.id !== id))
    } catch (err) {
      console.error('Error deleting wedding:', err)
      setError('Failed to delete wedding')
    }
  }

  const getStatusColor = (status: Wedding['status']) => {
    switch (status) {
      case 'upcoming':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">Weddings</h1>
            <p className="mt-2 text-sm text-gray-700">
              A list of all weddings in the system.
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <div className="h-10 w-32 animate-pulse rounded-md bg-gray-200" />
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
      <h1 className="text-2xl font-bold mb-4">Weddings</h1>
      <p className="text-gray-600">This is the weddings list page. Build out the table or list here.</p>
    </div>
  );
} 