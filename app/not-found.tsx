import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex-1 w-full flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-lg border border-border bg-background-secondary shadow-md p-6 sm:p-8 flex flex-col gap-4">
        <h1 className="text-title text-foreground">Nothing here</h1>
        <p className="text-foreground">
          There&apos;s no page at this address. It may have moved, or the link
          you followed was wrong.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-4 text-primary-foreground font-semibold tracking-wide hover:bg-primary-hover transition-colors"
          >
            Back to the homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
