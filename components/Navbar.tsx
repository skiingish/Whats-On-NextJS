import { FC } from 'react';
import Link from 'next/link';
import LogoutButton from '../components/LogoutButton';
import InviteUserButton from '@/components/InviteUserButton';
import InstallAppButton from '@/components/InstallAppButton';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { LogInIcon, Menu } from 'lucide-react';

interface NavbarProps {
  user: any;
}

const LoginButton = () => {
  return (
    <Link
      href='/login'
      className='py-2 px-4 flex no-underline text-foreground tracking-wider dark:text-dark-text-foreground border-foreground max-h-10'
    >
      <p>Login</p>
      <LogInIcon className='h-6 w-6 ml-2' />
    </Link>
  );
};

const Navbar: FC<NavbarProps> = async ({ user }) => {
  return (
    <nav className='w-full flex justify-center border-b border-b-foreground/10 h-16'>
      <div className='w-full flex justify-between items-center p-3'>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              className='text-primary-foreground border-0'
            >
              <Menu className='h-6 w-6' />
              <span className='sr-only'>Open menu</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className='w-[20rem] bg-background dark:bg-dark-foreground border-black rounded-2xl'
            align='end'
          >
            <div className='grid gap-4'>
              {!user && <LoginButton />}
              {user && (
                <>
                  <p className='text-foreground dark:text-dark-text-foreground tracking-wider'>
                    Hey, {user.email}{' '}
                  </p>
                  <LogoutButton />
                  <InviteUserButton />
                </>
              )}
            </div>
          </PopoverContent>
        </Popover>
        <InstallAppButton />
      </div>
    </nav>
  );
};

export default Navbar;

{
  /* <div>
          {user ? (
            <div className='flex items-center gap-4  '>
              Hey, {user.email}!
              <LogoutButton />
              <InviteUserButton />
            </div>
          ) : (
            <div className='flex items-center gap-4'>
              <Link
                href='/login'
                className='py-2 px-4 rounded-full no-underline text-foreground border-foreground border-2 bg-btn-background hover:bg-btn-background-hover max-h-10'
              >
                Login
              </Link>
              <InstallAppButton />
            </div>
          )}
        </div> */
}
