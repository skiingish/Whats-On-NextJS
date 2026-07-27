import { updateSession } from '@/lib/supabase/middleware'

import type { NextRequest } from 'next/server'

export async function proxy(req: NextRequest) {
  // Refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  return await updateSession(req)
}
