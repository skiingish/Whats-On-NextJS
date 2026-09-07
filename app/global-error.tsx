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
 *
 * The colour values below are the same HSL triplets as the light/dark
 * tokens in globals.css (--background, --foreground, --background-secondary,
 * --border, --primary, --primary-hover, --primary-foreground,
 * --muted-foreground) — duplicated here as literal CSS custom properties,
 * switched by a plain `@media (prefers-color-scheme: dark)` block, since
 * this file can't rely on the Tailwind/@theme pipeline being intact.
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
    <html lang="en">
      <body className="ge-root">
        <style>{`
          .ge-root {
            --ge-bg: hsl(36 44% 94%);
            --ge-fg: hsl(265 25% 11%);
            --ge-card: hsl(40 60% 99%);
            --ge-border: hsl(265 12% 87%);
            --ge-primary: hsl(261 84% 62%);
            --ge-primary-hover: hsl(261 84% 55%);
            --ge-primary-fg: hsl(0 0% 100%);
            --ge-muted-fg: hsl(265 8% 42%);
            margin: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
            background-color: var(--ge-bg);
            color: var(--ge-fg);
            font-family: system-ui, sans-serif;
          }
          @media (prefers-color-scheme: dark) {
            .ge-root {
              --ge-bg: hsl(265 20% 8%);
              --ge-fg: hsl(40 30% 96%);
              --ge-card: hsl(265 15% 16%);
              --ge-border: hsl(265 12% 20%);
              --ge-primary: hsl(261 90% 72%);
              --ge-primary-hover: hsl(261 90% 78%);
              --ge-primary-fg: hsl(265 30% 10%);
              --ge-muted-fg: hsl(265 8% 65%);
            }
          }
          .ge-card {
            width: 100%;
            max-width: 28rem;
            border-radius: 1.25rem;
            border: 1px solid var(--ge-border);
            background-color: var(--ge-card);
            box-shadow: 0 12px 32px -8px hsl(265 25% 11% / 0.12);
            padding: 2rem;
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }
          .ge-btn-primary:hover {
            background-color: var(--ge-primary-hover);
          }
          .ge-btn-secondary:hover {
            background-color: var(--ge-border);
          }
        `}</style>

        <div className="ge-card">
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
            The whole page failed to load
          </h1>
          <p style={{ margin: 0 }}>
            Something broke at the top level of the site, not just this page.
            Reloading usually clears it; if it keeps happening, the problem is
            on our end and has already been logged.
          </p>
          {error.digest && (
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--ge-muted-fg)' }}>
              Reference code: <code>{error.digest}</code> — include this if
              you report the problem.
            </p>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', paddingTop: '0.5rem' }}>
            <button
              onClick={reset}
              className="ge-btn-primary"
              style={{
                height: '2.75rem',
                minWidth: '2.75rem',
                borderRadius: '0.875rem',
                border: 'none',
                backgroundColor: 'var(--ge-primary)',
                color: 'var(--ge-primary-fg)',
                fontWeight: 600,
                letterSpacing: '0.01em',
                padding: '0 1rem',
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
            <a
              href="/"
              className="ge-btn-secondary"
              style={{
                height: '2.75rem',
                display: 'inline-flex',
                alignItems: 'center',
                borderRadius: '0.875rem',
                border: `1px solid var(--ge-border)`,
                backgroundColor: 'transparent',
                color: 'var(--ge-fg)',
                fontWeight: 600,
                letterSpacing: '0.01em',
                padding: '0 1rem',
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
