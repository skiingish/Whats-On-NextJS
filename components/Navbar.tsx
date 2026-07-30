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
    // Full-bleed sticky bar: broken out of the page shell's max-width
    // container (see app/layout.tsx) via the 100vw trick, so the blurred
    // background spans the whole viewport while its own inner row still
    // aligns to the same 72rem content width.
    <nav className='sticky top-0 left-1/2 z-40 w-screen -translate-x-1/2 border-b border-border bg-background/80 backdrop-blur-md'>
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
