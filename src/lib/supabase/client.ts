import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Debug logging
console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Present' : 'Missing')

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing Supabase environment variables. Please check your .env file and ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
  )
}

export const supabase = createPagesBrowserClient();

export interface SupabaseError {
  message: string
  status?: number
  name?: string
  details?: string
  hint?: string
  code?: string
}

export function handleSupabaseError(error: unknown): SupabaseError {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
    }
  }
  return {
    message: 'An unknown error occurred',
  }
}

// Types for our database tables
export type Tables = {
  users: {
    id: string
    email: string
    role: 'ADMIN' | 'EDITOR'
    created_at: string
    updated_at: string
  }
  weddings: {
    id: string
    slug: string
    title: string
    content: {
      time: number
      blocks: Array<{
        id: string
        type: string
        data: Record<string, unknown>
      }>
      version: string
    }
    published: boolean
    created_at: string
    updated_at: string
    client_id: string | null
  }
  clients: {
    id: string
    name: string
    email: string
    phone: string | null
    package: string
    notes: string | null
    wedding_id: string | null
    created_at: string
    updated_at: string
  }
} 