import { LogOutIcon } from 'lucide-react';

export default function LogoutButton() {
  return (
    <form action='/auth/sign-out' method='post'>
      <button className='py-2 flex no-underline text-foreground tracking-wider dark:text-dark-text-foreground border-foreground max-h-10'>
        Logout
        <LogOutIcon className='h-6 w-6 ml-2' />
      </button>
    </form>
  );
}
