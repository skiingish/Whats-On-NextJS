import './globals.css';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata, Viewport } from 'next';
import { Toaster } from 'sonner';

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
  themeColor: [{ media: '(prefers-color-scheme: dark)', color: '#fff' }],
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
    <html lang='en'>
      {/* overflow-x-hidden is a safety net for the full-bleed nav/footer
          bars below, which break out of the max-width container with a
          100vw-based trick (see components/Navbar.tsx, components/Footer.tsx)
          — this absorbs the sub-scrollbar-width rounding some browsers
          introduce, per the spec's "no horizontal scroll at any width" rule. */}
      <body className='overflow-x-hidden'>
        <main className='min-h-screen bg-background flex flex-col items-center'>
          {/* Page shell: content max-width and responsive gutters live here
              once, per the redesign spec, instead of being re-declared by
              every page. */}
          <div className='w-full max-w-[72rem] mx-auto flex flex-col items-center px-4 sm:px-6 lg:px-8'>
            {children}
          </div>
          <Analytics />
          <SpeedInsights />
          <Toaster />
        </main>
      </body>
    </html>
  );
}
