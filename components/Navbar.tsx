import { FC } from 'react';
import Link from 'next/link';
import LogoutButton from '../components/LogoutButton';
import InviteUserButton from '@/components/InviteUserButton';

interface NavbarProps {
  user: any;
}

const Navbar: FC<NavbarProps> = async ({ user }) => {
  return (
    <nav className='w-full flex justify-center border-b border-b-foreground/10 h-16'>
      <div className='w-full max-w-4xl flex justify-between items-center p-3 text-sm text-foreground sm:text-xs'>
        <div />
        <div>
          {user ? (
            <div className='flex items-center gap-4  '>
              Hey, {user.email}!
              <LogoutButton />
              <InviteUserButton />
            </div>
          ) : (
            <Link
              href='/login'
              className='py-2 px-4 rounded-full no-underline text-foreground border-foreground border-2 bg-btn-background hover:bg-btn-background-hover'
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
