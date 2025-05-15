'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import dynamic from 'next/dynamic'
import { OutputData } from '@editorjs/editorjs'

// Dynamically import the Editor component to avoid SSR issues
const Editor = dynamic(() => import('@/components/Editor'), { ssr: false })

interface Post {
  id: string
  title: string
  content: OutputData
  published: boolean
}

interface PageProps {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default function EditPostPage({ params }: PageProps) {
  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const fetchPost = useCallback(async () => {
    try {
      const resolvedParams = await params
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', resolvedParams.id)
        .single()

      if (error) throw error
      setPost(data)
    } catch (err) {
      console.error('Error fetching post:', err)
      setError('Failed to load post')
    } finally {
      setIsLoading(false)
    }
  }, [params])

  useEffect(() => {
    fetchPost()
  }, [fetchPost])

  const handleChange = async (content: OutputData) => {
    try {
      const resolvedParams = await params
      const { error } = await supabase
        .from('blog_posts')
        .update({ content })
        .eq('id', resolvedParams.id)

      if (error) throw error
      router.push('/admin/blog')
    } catch (err) {
      console.error('Error saving post:', err)
      setError('Failed to save post')
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  if (!post) {
    return <div>Post not found</div>
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
      <Editor
        data={post.content}
        onChange={handleChange}
      />
    </div>
  )
} 