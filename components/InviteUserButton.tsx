import { UserPlusIcon } from 'lucide-react';

export default function InviteUserButton() {
  return (
    <form action='/invite' method='get'>
      <button className='py-2 flex no-underline text-foreground tracking-wider dark:text-dark-text-foreground border-foreground max-h-10'>
        Invite User <UserPlusIcon className='h-6 w-6 ml-2' />
      </button>
    </form>
  );
}
