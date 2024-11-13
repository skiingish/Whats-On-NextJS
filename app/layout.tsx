import './globals.css';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
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
  themeColor: [{ media: '(prefers-color-scheme: dark)', color: '#fff' }],
  authors: [
    { name: 'Sean Corcoran' },
    {
      name: 'Sean Corcoran',
      url: 'https://www.seanbuildsthings.com',
    },
  ],
  viewport:
    'minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover',
  icons: [
    { rel: 'apple-touch-icon', url: 'icons/icon-128x128.png' },
    { rel: 'icon', url: 'icons/icon-128x128.png' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body>
        <main className='min-h-screen bg-background flex flex-col items-center'>
          {children}
          <Analytics />
          <SpeedInsights />
          <Toaster />
        </main>
      </body>
    </html>
  );
}
