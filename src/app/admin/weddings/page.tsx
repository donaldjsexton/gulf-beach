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
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Weddings</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all weddings in the system.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link
            href="/admin/weddings/new"
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <PlusIcon className="inline-block h-5 w-5" aria-hidden="true" />
            <span className="ml-1">Add Wedding</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Title
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Location
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                    >
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {weddings.map((wedding) => (
                    <tr key={wedding.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {wedding.title}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(wedding.date).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {wedding.location}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(
                            wedding.status
                          )}`}
                        >
                          {wedding.status.charAt(0).toUpperCase() +
                            wedding.status.slice(1)}
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Link
                          href={`/admin/weddings/${wedding.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <PencilIcon
                            className="inline-block h-5 w-5"
                            aria-hidden="true"
                          />
                          <span className="sr-only">Edit</span>
                        </Link>
                        <button
                          onClick={() => handleDelete(wedding.id)}
                          className="ml-4 text-red-600 hover:text-red-900"
                        >
                          <TrashIcon
                            className="inline-block h-5 w-5"
                            aria-hidden="true"
                          />
                          <span className="sr-only">Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 