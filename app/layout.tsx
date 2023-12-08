import './globals.css';
import { Analytics } from '@vercel/analytics/react';
import { Toaster } from 'sonner';

export const metadata = {
  title: 'Specials Spotter',
  description: 'App to find the best specials in your area.',
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
          <Toaster />
        </main>
      </body>
    </html>
  );
}
