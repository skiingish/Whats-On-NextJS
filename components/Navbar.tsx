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
      className='flex max-h-10 items-center gap-2 py-2 text-foreground no-underline tracking-wide hover:text-primary'
    >
      Login
      <LogInIcon className='h-5 w-5' />
    </Link>
  );
};

// Shared between the desktop inline nav and the mobile popover menu, so the
// two surfaces can never drift out of sync.
const AuthStatus = ({ user }: { user: User | null }) => {
  if (!user) {
    return <LoginButton />;
  }

  return (
    <div className='flex items-center gap-4'>
      <p className='text-meta text-muted-foreground'>Hey, {user.email}</p>
      <LogoutButton />
    </div>
  );
};

const Navbar: FC<NavbarProps> = async ({ user }) => {
  return (
    // Full-bleed sticky bar: app/layout.tsx puts no max-width wrapper around
    // page content, so `w-full` here already spans the true viewport width
    // (see the comment in app/layout.tsx for why this replaced a
    // `w-screen`/scrollbar-sensitive breakout trick). The inner row still
    // aligns to the shared 72rem content width via its own max-width.
    <nav className='sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md'>
      <div className='mx-auto flex h-16 w-full max-w-[72rem] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8'>
        <Link href='/' className='text-section text-foreground no-underline'>
          Specials Spotter
        </Link>

        {/* Desktop: links surfaced inline instead of hidden in the menu. */}
        <div className='hidden sm:flex sm:items-center sm:gap-6'>
          <AuthStatus user={user} />
        </div>

        <div className='flex items-center gap-2'>
          <InstallAppButton />

          {/* Mobile only: the same links tucked behind a menu popover. */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                aria-label='Open menu'
                className='sm:hidden'
              >
                <Menu className='h-6 w-6' />
              </Button>
            </PopoverTrigger>
            <PopoverContent align='end'>
              <div className='grid gap-4'>
                <AuthStatus user={user} />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
