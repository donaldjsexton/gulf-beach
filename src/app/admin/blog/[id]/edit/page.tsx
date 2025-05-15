'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase/client'

// Dynamically import the Editor component to avoid SSR issues
const Editor = dynamic(() => import('@/components/Editor'), { ssr: false })

interface BlogPost {
  id: string
  title: string
  slug: string
  content: any
  published: boolean
  created_at: string
  updated_at: string
}

export default function EditBlogPostPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [editorData, setEditorData] = useState<any>(null)

  useEffect(() => {
    if (params.id !== 'new') {
      fetchPost()
    } else {
      setIsLoading(false)
    }
  }, [params.id])

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error
      setPost(data)
      setEditorData(data.content)
    } catch (err) {
      setError('Failed to fetch blog post')
      console.error('Error fetching blog post:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    const formData = new FormData(e.target as HTMLFormElement)
    const title = formData.get('title') as string
    const slug = formData.get('slug') as string
    const published = formData.get('published') === 'true'

    try {
      if (params.id === 'new') {
        const { error } = await supabase
          .from('blog_posts')
          .insert([{ title, slug, content: editorData, published }])
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .update({ title, slug, content: editorData, published })
          .eq('id', params.id)
        if (error) throw error
      }
      router.push('/admin/blog')
    } catch (err) {
      setError('Failed to save blog post')
      console.error('Error saving blog post:', err)
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          {params.id === 'new' ? 'New Blog Post' : 'Edit Blog Post'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow sm:rounded-md">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  defaultValue={post?.title}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                  Slug
                </label>
                <input
                  type="text"
                  name="slug"
                  id="slug"
                  defaultValue={post?.slug}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="published" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  name="published"
                  id="published"
                  defaultValue={post?.published ? 'true' : 'false'}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="true">Published</option>
                  <option value="false">Draft</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Content</label>
                <div className="mt-1">
                  <Editor data={editorData} onChange={setEditorData} />
                </div>
              </div>
            </div>
          </div>
          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
            <button
              type="button"
              onClick={() => router.push('/admin/blog')}
              className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
} 