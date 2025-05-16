'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

interface Stat {
  id: string
  title: string
  created_at: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    weddings: 0,
    clients: 0,
    blog: 0,
    recentWeddings: [] as Stat[],
    recentClients: [] as Stat[],
    recentBlog: [] as Stat[],
  })
  const [blogStats, setBlogStats] = useState({
    total: 0,
    published: 0,
    drafts: 0,
    latest: null as null | { title: string; slug: string; published_at: string }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      const [weddings, clients, blog, recentWeddings, recentClientsRaw, recentBlog, published, drafts, latestPublished] = await Promise.all([
        supabase.from('weddings').select('id', { count: 'exact' }),
        supabase.from('clients').select('id', { count: 'exact' }),
        supabase.from('blog_posts').select('id', { count: 'exact' }),
        supabase.from('weddings').select('id, title, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('clients').select('id, name, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('blog_posts').select('id, title, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('blog_posts').select('id', { count: 'exact', head: true }).eq('published', true),
        supabase.from('blog_posts').select('id', { count: 'exact', head: true }).eq('published', false),
        supabase.from('blog_posts').select('title, slug, published_at').eq('published', true).order('published_at', { ascending: false }).limit(1),
      ])
      // Map client name to title for recentClients
      const recentClients = (recentClientsRaw.data || []).map((c: any) => ({
        id: c.id,
        title: c.name,
        created_at: c.created_at,
      }))
      setStats({
        weddings: weddings.count || 0,
        clients: clients.count || 0,
        blog: blog.count || 0,
        recentWeddings: recentWeddings.data || [],
        recentClients,
        recentBlog: recentBlog.data || [],
      })
      setBlogStats({
        total: blog.count || 0,
        published: published.count || 0,
        drafts: drafts.count || 0,
        latest: latestPublished.data?.[0] || null
      })
      setLoading(false)
    }
    fetchStats()
  }, [])

  if (loading) return <div className="p-8">Loading dashboard...</div>

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Weddings</h2>
          <p className="text-2xl">{stats.weddings}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Clients</h2>
          <p className="text-2xl">{stats.clients}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Blog Posts</h2>
          <div className="flex gap-4 items-end">
            <div>
              <div className="text-2xl font-bold">{blogStats.total}</div>
              <div className="text-gray-500 text-xs">Total</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-700">{blogStats.published}</div>
              <div className="text-gray-500 text-xs">Published</div>
            </div>
            <div>
              <div className="text-lg font-bold text-yellow-700">{blogStats.drafts}</div>
              <div className="text-gray-500 text-xs">Drafts</div>
            </div>
          </div>
          {blogStats.latest && (
            <div className="mt-4">
              <div className="text-gray-700 text-sm">Latest Published:</div>
              <Link href={`/admin/blog/${blogStats.latest.slug}`} className="text-indigo-600 hover:underline">
                {blogStats.latest.title}
              </Link>
              <div className="text-xs text-gray-500">
                {new Date(blogStats.latest.published_at).toLocaleDateString()}
              </div>
            </div>
          )}
          <div className="mt-4">
            <Link href="/admin/blog" className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 text-sm">
              Manage Blog Posts
            </Link>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <h3 className="font-semibold mb-2">Recent Weddings</h3>
          <ul>
            {stats.recentWeddings.map((w) => (
              <li key={w.id}>
                <Link href={`/admin/weddings/${w.id}`}>{w.title}</Link>
                <span className="text-xs text-gray-500 ml-2">{new Date(w.created_at).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Recent Clients</h3>
          <ul>
            {stats.recentClients.map((c) => (
              <li key={c.id}>
                <Link href={`/admin/clients/${c.id}`}>{c.title}</Link>
                <span className="text-xs text-gray-500 ml-2">{new Date(c.created_at).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  )
} 