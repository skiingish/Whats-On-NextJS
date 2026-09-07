import './globals.css';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata, Viewport } from 'next';
import { Toaster } from 'sonner';
import { Archivo, Courier_Prime, Fraunces } from 'next/font/google';

/*
 * Three faces, each with a job (docs/redesign-board-spec.md):
 *
 * Fraunces  — display, venue names, prices. A variable serif with SOFT and
 *             WONK axes, i.e. deliberate irregularity in its curves. It reads
 *             as hand-cut signage rather than as a font, which is the whole
 *             chalkboard register. Loading the variable axes is what makes it
 *             worth having; without them it is just another serif.
 * Archivo   — body and controls. A grotesque with actual width and warmth,
 *             which holds up small on a phone without going anonymous.
 * Courier   — day, time, source links. Typewriter: dockets, receipts,
 *             laminated bistro menus.
 *
 * All three are `display: 'swap'` so a slow connection gets text immediately
 * rather than a blank board.
 */
const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  axes: ['SOFT', 'WONK', 'opsz'],
  variable: '--font-fraunces',
});

const archivo = Archivo({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-archivo',
});

const courierPrime = Courier_Prime({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '700'],
  variable: '--font-courier-prime',
});

export const dynamic = 'force-dynamic';

// export const metadata: Metadata = {
//   title: 'Specials Spotter',
//   description: 'App to find the best specials in your area.',
// };

export const metadata: Metadata = {
  title: 'Specials Spotter',
  description: 'App to find the best specials in your area.',
  generator: 'Next.js',
  manifest: '/manifest.json',
  keywords: ['nextjs', 'nextjs13', 'next13', 'pwa', 'next-pwa'],
  authors: [
    { name: 'Sean Corcoran' },
    {
      name: 'Sean Corcoran',
      url: 'https://www.seanbuildsthings.com',
    },
  ],
  icons: [
    { rel: 'apple-touch-icon', url: 'icons/icon-128x128.png' },
    { rel: 'icon', url: 'icons/icon-128x128.png' },
  ],
};

export const viewport: Viewport = {
  // Browser chrome (status bar/tab strip) colour, matched to the actual
  // --background token in each theme so it doesn't clash with the page
  // beneath it. The dark entry was '#fff' (white) before this pass — the
  // exact opposite of the near-black dark background it was meant to sit
  // beside (chunk 9 audit) — and there was no light entry at all.
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#efe6d6' },
    { media: '(prefers-color-scheme: dark)', color: '#141a1d' },
  ],
  minimumScale: 1,
  initialScale: 1,
  width: 'device-width',
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang='en'
      className={`${fraunces.variable} ${archivo.variable} ${courierPrime.variable}`}
    >
      {/* overflow-x-hidden is a belt-and-braces safety net for the mobile-
          first "no horizontal scroll at any width" rule. It is NOT load-
          bearing for layout width the way it once was: the shell used to
          rely on it to contain a `w-screen`-based full-bleed trick in
          components/Navbar.tsx, components/EventsDisplay.tsx and
          components/Footer.tsx, but `100vw` measures the viewport
          *including* the scrollbar gutter, which is wider than the visible,
          scrollable area (`document.documentElement.clientWidth`) whenever a
          vertical scrollbar is present. That mismatch was perturbing layout
          width during a window resize and was the root cause of the Mapbox
          canvas/container size drift covered by
          tests/functional/map-sizing.spec.ts. Those three components now go
          full-bleed by simply being `w-full` with no page-shell wrapper
          around them, so there is no vw-vs-clientWidth gap left to contain —
          this is now just cheap insurance, not the fix itself. */}
      <body className='overflow-x-hidden'>
        <main className='min-h-screen bg-background flex flex-col items-center'>
          {/* No max-width wrapper here on purpose (see above): Navbar,
              EventsDisplay's sticky filter bar and Footer need to span the
              true, unconstrained width of `main` to be genuinely full-bleed.
              Each page is responsible for constraining its own non-full-bleed
              content to `max-w-[72rem]` with the standard gutters
              (`px-4 sm:px-6 lg:px-8`), same as those three components do
              internally for their own row of content. */}
          {children}
          <Analytics />
          <SpeedInsights />
          <Toaster />
        </main>
      </body>
    </html>
  );
}
