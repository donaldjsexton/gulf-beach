import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function getMiddlewareSupabase(req: NextRequest, res: NextResponse) {
  return createMiddlewareClient({ req, res });
} 