export default function NotFound() {
  return (
    <div className='flex-1 w-full flex items-center justify-center px-4 py-16'>
      <div className='w-full max-w-md rounded-2xl border-2 border-foreground bg-background p-8 flex flex-col gap-4'>
        <h1 className='text-2xl font-semibold tracking-wide text-foreground'>
          Nothing here
        </h1>
        <p className='text-foreground'>
          There's no page at this address. It may have moved, or the link
          you followed was wrong.
        </p>
        <div className='pt-2'>
          <a
            href='/'
            className='inline-block rounded-2xl border-2 border-foreground bg-foreground text-background font-semibold tracking-wide px-4 py-2 hover:opacity-90 transition-opacity'
          >
            Back to the homepage
          </a>
        </div>
      </div>
    </div>
  );
}
