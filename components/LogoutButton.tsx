import { LogOutIcon } from 'lucide-react';
import { Button } from './ui/button';

export default function LogoutButton() {
  return (
    <form action='/auth/sign-out' method='post'>
      <Button
        type='submit'
        variant='ghost'
        className='gap-2 tracking-wide text-foreground hover:text-primary'
      >
        Logout
        <LogOutIcon className='h-5 w-5' />
      </Button>
    </form>
  );
}
