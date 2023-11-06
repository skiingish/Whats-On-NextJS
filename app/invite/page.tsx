import Link from 'next/link';
import Result from './result';

export default function Invite() {
  return (
    <div className='flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2'>
      <Link
        href='/'
        className='absolute left-8 top-8 py-2 px-4 rounded-md no-underline text-foreground bg-btn-background hover:bg-btn-background-hover flex items-center group text-sm'
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1'
        >
          <polyline points='15 18 9 12 15 6' />
        </svg>{' '}
        Back
      </Link>

      <form
        className='flex-1 flex flex-col w-full justify-center gap-2 text-foreground'
        action='/auth/generate-invite'
        method='POST'
      >
        <h1 className='text-2xl mb-4 font-bold'>
          Specials Spotter - Invite A User
        </h1>
        <button className='bg-green-700 rounded px-4 py-2 text-white mb-2'>
          Create Invite Link
        </button>
        {/* <button
          formAction='/auth/sign-up'
          className='border border-gray-700 rounded px-4 py-2 text-white mb-2'
        >
          Sign Up
        </button> */}
        <Result />
      </form>
    </div>
  );
}