'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

interface Stats {
  totalWeddings: number
  totalClients: number
  totalBlogPosts: number
  recentWeddings: Array<{
    id: string
    title: string
    created_at: string
  }>
  recentClients: Array<{
    id: string
    name: string
    created_at: string
  }>
  recentBlogPosts: Array<{
    id: string
    title: string
    created_at: string
  }>
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch total counts
        const [weddingsCount, clientsCount, blogCount] = await Promise.all([
          supabase.from('weddings').select('id', { count: 'exact' }),
          supabase.from('clients').select('id', { count: 'exact' }),
          supabase.from('blog_posts').select('id', { count: 'exact' }),
        ])

        // Fetch recent items
        const [recentWeddings, recentClients, recentBlogPosts] = await Promise.all([
          supabase
            .from('weddings')
            .select('id, title, created_at')
            .order('created_at', { ascending: false })
            .limit(5),
          supabase
            .from('clients')
            .select('id, name, created_at')
            .order('created_at', { ascending: false })
            .limit(5),
          supabase
            .from('blog_posts')
            .select('id, title, created_at')
            .order('created_at', { ascending: false })
            .limit(5),
        ])

        setStats({
          totalWeddings: weddingsCount.count || 0,
          totalClients: clientsCount.count || 0,
          totalBlogPosts: blogCount.count || 0,
          recentWeddings: recentWeddings.data || [],
          recentClients: recentClients.data || [],
          recentBlogPosts: recentBlogPosts.data || [],
        })
      } catch (err) {
        setError('Failed to fetch dashboard data')
        console.error('Error fetching dashboard data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-gray-200 rounded" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded" />
              ))}
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Stats */}
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">
                      Total Weddings
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      {stats?.totalWeddings}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link
                  href="/admin/weddings"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  View all
                </Link>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">
                      Total Clients
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      {stats?.totalClients}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link
                  href="/admin/clients"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  View all
                </Link>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">
                      Total Blog Posts
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      {stats?.totalBlogPosts}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link
                  href="/admin/blog"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  View all
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Recent Weddings */}
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-5">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Recent Weddings
              </h3>
              <div className="mt-4 flow-root">
                <ul role="list" className="-my-5 divide-y divide-gray-200">
                  {stats?.recentWeddings.map((wedding) => (
                    <li key={wedding.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {wedding.title}
                          </p>
                          <p className="truncate text-sm text-gray-500">
                            {new Date(wedding.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <Link
                            href={`/admin/weddings/${wedding.id}/edit`}
                            className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                          >
                            Edit
                          </Link>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Recent Clients */}
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-5">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Recent Clients
              </h3>
              <div className="mt-4 flow-root">
                <ul role="list" className="-my-5 divide-y divide-gray-200">
                  {stats?.recentClients.map((client) => (
                    <li key={client.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {client.name}
                          </p>
                          <p className="truncate text-sm text-gray-500">
                            {new Date(client.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <Link
                            href={`/admin/clients/${client.id}/edit`}
                            className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                          >
                            Edit
                          </Link>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Recent Blog Posts */}
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-5">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Recent Blog Posts
              </h3>
              <div className="mt-4 flow-root">
                <ul role="list" className="-my-5 divide-y divide-gray-200">
                  {stats?.recentBlogPosts.map((post) => (
                    <li key={post.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {post.title}
                          </p>
                          <p className="truncate text-sm text-gray-500">
                            {new Date(post.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <Link
                            href={`/admin/blog/${post.id}/edit`}
                            className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                          >
                            Edit
                          </Link>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 