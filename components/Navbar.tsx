import { FC } from 'react';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import LogoutButton from '../components/LogoutButton';
import InstallAppButton from '@/components/InstallAppButton';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { LogInIcon, Menu } from 'lucide-react';

interface NavbarProps {
  user: User | null;
}

const LoginButton = () => {
  return (
    <Link
      href='/login'
      className='py-2 px-4 flex no-underline text-foreground tracking-wider border-foreground max-h-10'
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
              className='text-foreground border-0'
            >
              <Menu className='h-6 w-6' />
              <span className='sr-only'>Open menu</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className='w-[20rem] bg-popover text-popover-foreground border-foreground rounded-2xl'
            align='end'
          >
            <div className='grid gap-4'>
              {!user && <LoginButton />}
              {user && (
                <>
                  <p className='text-foreground tracking-wider'>
                    Hey, {user.email}{' '}
                  </p>
                  <LogoutButton />
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
