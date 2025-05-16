'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import Image from "next/image";
import Link from 'next/link';

export default function HomePage() {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkSupabase = async () => {
      try {
        const { error } = await supabase.from('weddings').select('count').limit(1)
        if (error) throw error
      } catch (err) {
        console.error('Error connecting to Supabase:', err)
        setError('Unable to connect to the database. Please check your environment configuration.')
      }
    }

    checkSupabase()
  }, [])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Configuration Error
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold mb-4">Gulf Beach Weddings</h1>
      <p className="text-lg text-gray-700 mb-8">Beautiful, memorable weddings on the Gulf Coast. Explore our packages, real weddings, and more.</p>
      <nav className="space-x-4">
        <Link href="/about" className="text-blue-600 underline">About</Link>
        <Link href="/packages" className="text-blue-600 underline">Packages</Link>
        <Link href="/weddings" className="text-blue-600 underline">Weddings</Link>
        <Link href="/blog" className="text-blue-600 underline">Blog</Link>
        <Link href="/contact" className="text-blue-600 underline">Contact</Link>
      </nav>
    </main>
  );
}
