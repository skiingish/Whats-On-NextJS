'use client';

import { useEffect } from 'react';

/**
 * Catches a crash in the root layout itself (app/layout.tsx). Next.js
 * requires this file to render its own <html> and <body> because, unlike
 * app/error.tsx, there is no surviving layout left to provide them.
 *
 * Deliberately dependency-light: no shared components, no font import, no
 * Toaster/Analytics. If the root layout broke, those are exactly the kinds
 * of things that might be implicated, so this stays self-contained plain
 * markup with inline styles rather than trusting globals.css or any
 * component in components/ui to still work.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[app/global-error.tsx] root layout crashed:', error);
  }, [error]);

  return (
    <html lang='en'>
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          backgroundColor: 'hsl(34 47% 89%)',
          color: 'hsl(200 50% 3%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '28rem',
            borderRadius: '1rem',
            border: '2px solid hsl(200 50% 3%)',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>
            The whole page failed to load
          </h1>
          <p style={{ margin: 0 }}>
            Something broke at the top level of the site, not just this page.
            Reloading usually clears it; if it keeps happening, the problem is
            on our end and has already been logged.
          </p>
          {error.digest && (
            <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.6 }}>
              Reference code: <code>{error.digest}</code> — include this if
              you report the problem.
            </p>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', paddingTop: '0.5rem' }}>
            <button
              onClick={reset}
              style={{
                borderRadius: '1rem',
                border: '2px solid hsl(200 50% 3%)',
                backgroundColor: 'hsl(200 50% 3%)',
                color: 'hsl(34 47% 89%)',
                fontWeight: 600,
                letterSpacing: '0.025em',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
            <a
              href='/'
              style={{
                borderRadius: '1rem',
                border: '2px solid hsl(200 50% 3%)',
                backgroundColor: 'transparent',
                color: 'hsl(200 50% 3%)',
                fontWeight: 600,
                letterSpacing: '0.025em',
                padding: '0.5rem 1rem',
                textDecoration: 'none',
              }}
            >
              Back to the homepage
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
