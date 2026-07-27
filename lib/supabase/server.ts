import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Supabase client for use in Server Components, Server Actions, and Route
 * Handlers. Replaces `createServerComponentClient` / `createRouteHandlerClient`
 * from the deprecated `@supabase/auth-helpers-nextjs` package.
 *
 * `cookies()` is async as of Next.js 15, so this factory is async too.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // `setAll` was called from a Server Component, which can't set
            // cookies on the response. This is safe to ignore because the
            // middleware refreshes the session on every navigation.
          }
        },
      },
    }
  );
}
