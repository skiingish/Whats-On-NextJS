'use client';

import { useEffect } from 'react';
import Link from 'next/link';

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
    <div className="flex-1 w-full flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-lg border border-border bg-background-secondary shadow-md p-6 sm:p-8 flex flex-col gap-4">
        <h1 className="text-title text-foreground">This page hit a snag</h1>
        <p className="text-foreground">
          Something went wrong while loading this part of the site. Nothing
          you did caused it, and the rest of the app is unaffected.
        </p>
        {error.digest && (
          <p className="text-sm text-muted-foreground">
            Reference code: <code>{error.digest}</code> — include this if you
            report the problem.
          </p>
        )}
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={reset}
            className="h-11 inline-flex items-center justify-center rounded-md bg-primary px-4 text-primary-foreground font-semibold tracking-wide hover:bg-primary-hover transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="h-11 inline-flex items-center justify-center rounded-md border border-input bg-background-secondary px-4 text-foreground font-semibold tracking-wide hover:bg-muted transition-colors"
          >
            Back to the homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
