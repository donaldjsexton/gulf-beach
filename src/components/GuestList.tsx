'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
  TableCellsIcon,
} from '@heroicons/react/24/outline'

interface Guest {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  address: string | null
  dietary_restrictions: string | null
  notes: string | null
  rsvp: RSVP | null
  table_assignment: TableAssignment | null
}

interface RSVP {
  id: string
  status: 'pending' | 'attending' | 'declined' | 'maybe'
  plus_one: boolean
  plus_one_name: string | null
  dietary_notes: string | null
  notes: string | null
  responded_at: string | null
}

interface Table {
  id: string
  name: string
  capacity: number
  location: string | null
  notes: string | null
  assignments: TableAssignment[]
}

interface TableAssignment {
  id: string
  table_id: string
  guest_id: string
  seat_number: number | null
}

interface GuestListProps {
  weddingId: string
}

export default function GuestList({ weddingId }: GuestListProps) {
  const [guests, setGuests] = useState<Guest[]>([])
  const [tables, setTables] = useState<Table[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'guests' | 'tables'>('guests')

  const fetchData = useCallback(async () => {
    try {
      // Fetch guests with their RSVPs
      const { data: guestsData, error: guestsError } = await supabase
        .from('guests')
        .select(`
          *,
          rsvps (*),
          table_assignments (*)
        `)
        .order('last_name', { ascending: true })

      if (guestsError) throw guestsError

      // Fetch tables with their assignments
      const { data: tablesData, error: tablesError } = await supabase
        .from('tables')
        .select(`
          *,
          table_assignments (*)
        `)
        .eq('wedding_id', weddingId)
        .order('name', { ascending: true })

      if (tablesError) throw tablesError

      setGuests(
        guestsData.map((guest) => ({
          ...guest,
          rsvp: guest.rsvps?.[0] || null,
          table_assignment: guest.table_assignments?.[0] || null,
        }))
      )
      setTables(tablesData)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load guest list')
    } finally {
      setIsLoading(false)
    }
  }, [weddingId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleAddGuest = async () => {
    const firstName = prompt('Enter first name:')
    if (!firstName) return

    const lastName = prompt('Enter last name:')
    if (!lastName) return

    try {
      const { data: guest, error: guestError } = await supabase
        .from('guests')
        .insert([
          {
            first_name: firstName,
            last_name: lastName,
          },
        ])
        .select()
        .single()

      if (guestError) throw guestError

      // Create initial RSVP
      const { error: rsvpError } = await supabase.from('rsvps').insert([
        {
          guest_id: guest.id,
          status: 'pending',
        },
      ])

      if (rsvpError) throw rsvpError

      await fetchData()
    } catch (err) {
      console.error('Error adding guest:', err)
      setError('Failed to add guest')
    }
  }

  const handleUpdateRSVP = async (guestId: string, status: RSVP['status']) => {
    try {
      const { error } = await supabase
        .from('rsvps')
        .update({
          status,
          responded_at: new Date().toISOString(),
        })
        .eq('guest_id', guestId)

      if (error) throw error

      await fetchData()
    } catch (err) {
      console.error('Error updating RSVP:', err)
      setError('Failed to update RSVP')
    }
  }

  const handleAddTable = async () => {
    const name = prompt('Enter table name:')
    if (!name) return

    const capacity = prompt('Enter table capacity:')
    if (!capacity) return

    try {
      const { error } = await supabase.from('tables').insert([
        {
          wedding_id: weddingId,
          name,
          capacity: parseInt(capacity),
        },
      ])

      if (error) throw error

      await fetchData()
    } catch (err) {
      console.error('Error adding table:', err)
      setError('Failed to add table')
    }
  }

  const handleAssignTable = async (guestId: string, tableId: string) => {
    try {
      const { error } = await supabase.from('table_assignments').insert([
        {
          guest_id: guestId,
          table_id: tableId,
        },
      ])

      if (error) throw error

      await fetchData()
    } catch (err) {
      console.error('Error assigning table:', err)
      setError('Failed to assign table')
    }
  }

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('guests')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'guests'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Guests
          </button>
          <button
            onClick={() => setActiveTab('tables')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'tables'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tables
          </button>
        </div>
        <button
          onClick={activeTab === 'guests' ? handleAddGuest : handleAddTable}
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          {activeTab === 'guests' ? (
            <>
              <UserPlusIcon className="h-5 w-5 mr-1" />
              Add Guest
            </>
          ) : (
            <>
              <TableCellsIcon className="h-5 w-5 mr-1" />
              Add Table
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'guests' ? (
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Contact
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  RSVP
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Table
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {guests.map((guest) => (
                <tr key={guest.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {guest.first_name} {guest.last_name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div>{guest.email}</div>
                    <div>{guest.phone}</div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <select
                      value={guest.rsvp?.status || 'pending'}
                      onChange={(e) =>
                        handleUpdateRSVP(guest.id, e.target.value as RSVP['status'])
                      }
                      className="rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="attending">Attending</option>
                      <option value="declined">Declined</option>
                      <option value="maybe">Maybe</option>
                    </select>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {guest.table_assignment ? (
                      <span>
                        {
                          tables.find(
                            (t) => t.id === guest.table_assignment?.table_id
                          )?.name
                        }
                      </span>
                    ) : (
                      <select
                        onChange={(e) =>
                          handleAssignTable(guest.id, e.target.value)
                        }
                        className="rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value="">Assign Table</option>
                        {tables.map((table) => (
                          <option key={table.id} value={table.id}>
                            {table.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          // Implement edit functionality
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <PencilIcon className="h-5 w-5" aria-hidden="true" />
                        <span className="sr-only">Edit</span>
                      </button>
                      <button
                        onClick={() => {
                          // Implement delete functionality
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5" aria-hidden="true" />
                        <span className="sr-only">Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tables.map((table) => (
            <div
              key={table.id}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {table.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Capacity: {table.capacity}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      // Implement delete functionality
                    }}
                    className="text-red-400 hover:text-red-500"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
                {table.location && (
                  <p className="mt-1 text-sm text-gray-500">
                    Location: {table.location}
                  </p>
                )}
              </div>
              <div className="border-t border-gray-200">
                <div className="p-4">
                  <h4 className="text-sm font-medium text-gray-900">
                    Assigned Guests
                  </h4>
                  <ul className="mt-2 space-y-2">
                    {table.assignments.map((assignment) => {
                      const guest = guests.find((g) => g.id === assignment.guest_id)
                      return (
                        guest && (
                          <li
                            key={assignment.id}
                            className="text-sm text-gray-500"
                          >
                            {guest.first_name} {guest.last_name}
                            {assignment.seat_number && (
                              <span className="ml-2 text-gray-400">
                                (Seat {assignment.seat_number})
                              </span>
                            )}
                          </li>
                        )
                      )
                    })}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 