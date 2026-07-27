import { updateSession } from '@/lib/supabase/middleware'

import type { NextRequest } from 'next/server'

export async function proxy(req: NextRequest) {
  // Refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  return await updateSession(req)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - image files (svg, png, jpg, jpeg, gif, webp)
     *
     * Taken from Supabase's Next.js SSR middleware reference:
     * https://supabase.com/docs/guides/auth/server-side/nextjs
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
