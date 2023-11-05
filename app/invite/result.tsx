'use client';

import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useState } from 'react';

export default function Result() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const token = searchParams.get('token');

  const [isCopied, setIsCopied] = useState<boolean>(false);

  if (error) {
    toast.error(error);
  }

  const copyToClipboard = async (e: any) => {
    e.preventDefault();
    if (!token) return;
    if ('clipboard' in navigator) {
      await navigator.clipboard.writeText(
        `${window.location.origin}/sign-up?token=${token}`
      );
    } else {
      document.execCommand(
        'copy',
        true,
        `${window.location.origin}/sign-up?token=${token}`
      );
    }
    setIsCopied(true);
  };

  return (
    <>
      {error && (
        <p className='mt-4 p-4 bg-neutral-900 text-neutral-300 text-center'>
          {error}
        </p>
      )}
      {token && (
        <div>
          <input
            type='text'
            className='w-full rounded-md break-words mt-4 p-4 bg-neutral-900 text-neutral-300 text-center'
            value={`${window.location.origin}/sign-up?token=${token}`}
            readOnly
          />
          <button
            className='w-full rounded-md mt-4 p-4 ring-1 ring-inset ring-gray-300'
            onClick={copyToClipboard}
          >
            <span>{isCopied ? 'Copied!' : 'Copy Link'}</span>
          </button>
        </div>
      )}
    </>
  );
}
