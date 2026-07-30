'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Reaches Vercel's function logs even without a tracking service wired
    // up yet (see docs/observability-options.md).
    console.error('[app/error.tsx] route segment crashed:', error);
  }, [error]);

  return (
    <div className='flex-1 w-full flex items-center justify-center px-4 py-16'>
      <div className='w-full max-w-md rounded-2xl border-2 border-foreground bg-background p-8 flex flex-col gap-4'>
        <h1 className='text-2xl font-semibold tracking-wide text-foreground'>
          This page hit a snag
        </h1>
        <p className='text-foreground'>
          Something went wrong while loading this part of the site. Nothing
          you did caused it, and the rest of the app is unaffected.
        </p>
        {error.digest && (
          <p className='text-sm text-foreground/60'>
            Reference code: <code>{error.digest}</code> — include this if you
            report the problem.
          </p>
        )}
        <div className='flex flex-wrap gap-3 pt-2'>
          <button
            onClick={reset}
            className='rounded-2xl border-2 border-foreground bg-foreground text-background font-semibold tracking-wide px-4 py-2 hover:opacity-90 transition-opacity'
          >
            Try again
          </button>
          <a
            href='/'
            className='rounded-2xl border-2 border-foreground bg-background text-foreground font-semibold tracking-wide px-4 py-2 hover:opacity-80 transition-opacity'
          >
            Back to the homepage
          </a>
        </div>
      </div>
    </div>
  );
}
