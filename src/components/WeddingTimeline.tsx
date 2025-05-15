'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

interface TimelineEvent {
  id: string
  title: string
  start_time: string
  end_time: string
  description: string | null
  location: string | null
  vendor_id: string | null
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
}

interface WeddingTimelineProps {
  weddingId: string
}

export default function WeddingTimeline({ weddingId }: WeddingTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null)

  const fetchEvents = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('wedding_timelines')
        .select('*')
        .eq('wedding_id', weddingId)
        .order('start_time', { ascending: true })

      if (error) throw error
      setEvents(data || [])
    } catch (err) {
      console.error('Error fetching timeline events:', err)
      setError('Failed to load timeline events')
    } finally {
      setIsLoading(false)
    }
  }, [weddingId])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      const { error } = await supabase
        .from('wedding_timelines')
        .delete()
        .eq('id', id)

      if (error) throw error
      setEvents(events.filter((event) => event.id !== id))
    } catch (err) {
      console.error('Error deleting event:', err)
      setError('Failed to delete event')
    }
  }

  const handleStatusChange = async (id: string, newStatus: TimelineEvent['status']) => {
    try {
      const { error } = await supabase
        .from('wedding_timelines')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error
      setEvents(
        events.map((event) =>
          event.id === id ? { ...event, status: newStatus } : event
        )
      )
    } catch (err) {
      console.error('Error updating event status:', err)
      setError('Failed to update event status')
    }
  }

  const getStatusColor = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
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
      <div className="space-y-4">
        <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded bg-gray-100" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Timeline</h3>
        <button
          onClick={() => {
            setEditingEvent(null)
            setIsModalOpen(true)
          }}
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <PlusIcon className="h-5 w-5" aria-hidden="true" />
          <span className="ml-1">Add Event</span>
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

      <div className="flow-root">
        <ul role="list" className="-mb-8">
          {events.map((event, eventIdx) => (
            <li key={event.id}>
              <div className="relative pb-8">
                {eventIdx !== events.length - 1 ? (
                  <span
                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative flex space-x-3">
                  <div>
                    <span className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center ring-8 ring-white">
                      <span className="h-2.5 w-2.5 rounded-full bg-white" />
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p className="text-sm text-gray-500">
                        {event.title}{' '}
                        <span className="font-medium text-gray-900">
                          {event.start_time} - {event.end_time}
                        </span>
                      </p>
                      {event.description && (
                        <p className="mt-1 text-sm text-gray-500">
                          {event.description}
                        </p>
                      )}
                      {event.location && (
                        <p className="mt-1 text-sm text-gray-500">
                          Location: {event.location}
                        </p>
                      )}
                    </div>
                    <div className="whitespace-nowrap text-right text-sm text-gray-500">
                      <select
                        value={event.status}
                        onChange={(e) =>
                          handleStatusChange(
                            event.id,
                            e.target.value as TimelineEvent['status']
                          )
                        }
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(
                          event.status
                        )}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <div className="mt-2 flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingEvent(event)
                            setIsModalOpen(true)
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <PencilIcon className="h-5 w-5" aria-hidden="true" />
                          <span className="sr-only">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-5 w-5" aria-hidden="true" />
                          <span className="sr-only">Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Timeline Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              aria-hidden="true"
              onClick={() => setIsModalOpen(false)}
            />

            <span
              className="hidden sm:inline-block sm:h-screen sm:align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className="relative inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
              <TimelineEventForm
                weddingId={weddingId}
                event={editingEvent}
                onClose={() => {
                  setIsModalOpen(false)
                  setEditingEvent(null)
                }}
                onSave={() => {
                  setIsModalOpen(false)
                  setEditingEvent(null)
                  fetchEvents()
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface TimelineEventFormProps {
  weddingId: string
  event: TimelineEvent | null
  onClose: () => void
  onSave: () => void
}

function TimelineEventForm({
  weddingId,
  event,
  onClose,
  onSave,
}: TimelineEventFormProps) {
  const [formData, setFormData] = useState<Partial<TimelineEvent>>({
    title: '',
    start_time: '',
    end_time: '',
    description: '',
    location: '',
    status: 'pending',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (event) {
      setFormData(event)
    }
  }, [event])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSaving(true)

    try {
      const data = {
        ...formData,
        wedding_id: weddingId,
      }

      if (event) {
        const { error } = await supabase
          .from('wedding_timelines')
          .update(data)
          .eq('id', event.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('wedding_timelines')
          .insert([data])
        if (error) throw error
      }

      onSave()
    } catch (err) {
      console.error('Error saving timeline event:', err)
      setError('Failed to save event')
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          {event ? 'Edit Event' : 'Add Event'}
        </h3>
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

      <div className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Title
          </label>
          <input
            type="text"
            name="title"
            id="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="start_time"
              className="block text-sm font-medium text-gray-700"
            >
              Start Time
            </label>
            <input
              type="time"
              name="start_time"
              id="start_time"
              required
              value={formData.start_time}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="end_time"
              className="block text-sm font-medium text-gray-700"
            >
              End Time
            </label>
            <input
              type="time"
              name="end_time"
              id="end_time"
              required
              value={formData.end_time}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <textarea
            name="description"
            id="description"
            rows={3}
            value={formData.description || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700"
          >
            Location
          </label>
          <input
            type="text"
            name="location"
            id="location"
            value={formData.location || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700"
          >
            Status
          </label>
          <select
            name="status"
            id="status"
            value={formData.status}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  )
} 