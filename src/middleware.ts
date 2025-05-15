import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Debug logging
  console.log('Middleware - Request URL:', req.nextUrl.pathname)
  
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Debug logging
  console.log('Middleware - Session:', session ? 'Present' : 'Missing')

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/reset-password']
  const isPublicRoute = publicRoutes.includes(req.nextUrl.pathname)

  // If user is not signed in and trying to access a protected route
  if (!session && !isPublicRoute) {
    console.log('Middleware - Redirecting to login')
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is signed in and trying to access login page
  if (session && req.nextUrl.pathname === '/login') {
    console.log('Middleware - Redirecting to admin')
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/admin'
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
} 