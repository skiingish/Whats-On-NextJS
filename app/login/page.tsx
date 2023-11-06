import Link from 'next/link';
import Messages from './messages';

// Sorry to make you sign up, just gotta protect from those pesky spam bots. :robot

export default function Login() {
  return (
    <div className='flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2'>
      <Link
        href='/'
        className='absolute left-8 top-8 py-2 px-4 rounded-full border-2 border-foreground no-underline text-foreground bg-btn-background hover:bg-btn-background-hover flex items-center group text-sm'
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
        action='/auth/sign-in'
        method='post'
      >
        <label className='text-md font-semibold tracking-wide' htmlFor='email'>
          Email
        </label>
        <input
          className='rounded-xl px-4 py-2 bg-inherit border-2 border-foreground bg-white mb-6'
          name='email'
          placeholder='you@example.com'
          required
        />
        <label
          className='text-md font-semibold tracking-wide'
          htmlFor='password'
        >
          Password
        </label>
        <input
          className='rounded-xl px-4 py-2 bg-inherit border-2 border-foreground bg-white mb-6'
          type='password'
          name='password'
          placeholder='••••••••'
          required
        />
        <button className='bg-btn-background hover:bg-btn-background-hover px-4 py-2 font-semibold tracking-wide text-foreground border-foreground border-2 rounded-full mb-2'>
          Sign In
        </button>
        {/* <button
          formAction='/auth/sign-up'
          className='border border-gray-700 rounded px-4 py-2 text-white mb-2'
        >
          Sign Up
        </button> */}
        <Messages />
      </form>
    </div>
  );
}
