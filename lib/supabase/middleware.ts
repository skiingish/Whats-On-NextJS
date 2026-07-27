import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Refreshes the Supabase auth session for use by `middleware.ts`. Replaces
 * `createMiddlewareClient({ req, res })` from the deprecated
 * `@supabase/auth-helpers-nextjs` package.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not add code between createServerClient and getUser(). A simple
  // mistake here can make it very hard to debug users being randomly logged
  // out. getUser() (not getSession()) is required because it revalidates the
  // token against the Auth server instead of trusting the cookie as-is.
  await supabase.auth.getUser();

  // IMPORTANT: return supabaseResponse as-is so refreshed cookies reach both
  // the server components downstream and the browser.
  return supabaseResponse;
}
