import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import LogoutButton from '../components/LogoutButton';
import Logo from '../components/Logo';
import EventsDisplay from '@/components/EventsDisplay';
import AddEventDisplay from '@/components/AddEventDisplay';
import { PawPrint } from 'lucide-react';
import Image from 'next/image';

import hamburger from '../public/assets/hamburger_1280.jpg';
import pizza from '../public/assets/pizza_1280.jpg';
import neon from '../public/assets/neon_1280.jpg';
import pasta from '../public/assets/pasta_1280.jpg';
import poutine from '../public/assets/poutine_1280.jpg';
import steak from '../public/assets/steak_1280.jpg';
import InviteUserButton from '@/components/InviteUserButton';

export const dynamic = 'force-dynamic';

const pictures = [hamburger, pizza, neon, pasta, poutine, steak];

export default async function Index() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let { data: events } = await supabase.from('events').select();

  // Randomly select a picture from the array.
  let randomPicture = pictures[Math.floor(Math.random() * pictures.length)];

  return (
    <div className='font-sans w-full flex flex-col items-center'>
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

      <div className='animate-in flex flex-col gap-1 opacity-0 w-full py-1 lg:py-4 text-foreground'>
        <div className='flex flex-col items-center mb-2 lg:mb-8'>
          <p className='flex text-4xl lg:text-4xl tracking-wider italic !leading-tight font-medium mx-auto max-w-xl text-center my-2'>
            <PawPrint size={48} className=' pr-1.5' /> Jasper Specials
          </p>
        </div>
        <Image
          className='opacity-80 w-full lg:max-h-96 object-cover'
          src={randomPicture}
          alt='Picture logo'
          placeholder='blur'
        />
      </div>

      <div className='animate-in w-full gap-8 opacity-0 max-w-4xl py-8 lg:py-8 px-8 text-foreground'>
        <EventsDisplay events={events || []} user={user} />
        <AddEventDisplay userStatus={user?.aud} />
      </div>
    </div>
  );
}
