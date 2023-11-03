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
        <div className='w-full max-w-4xl flex justify-between items-center p-3 text-sm text-foreground'>
          <div />
          <div>
            {user ? (
              <div className='flex items-center gap-4'>
                Hey, {user.email}!
                <LogoutButton />
              </div>
            ) : (
              <Link
                href='/login'
                className='py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover'
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      <div className='animate-in flex flex-col gap-4 opacity-0 max-w-4xl px-3 py-4 lg:py-8 text-foreground'>
        <div className='flex flex-col items-center mb-2 lg:mb-8'>
          <p className='flex text-4xl lg:text-4xl tracking-wider italic !leading-tight font-medium mx-auto max-w-xl text-center my-2'>
            <PawPrint size={48} className=' pr-1.5' /> Jasper Specials
          </p>
          <div className='flex my-4 justify-center items-center'>
            <Image
              className='rounded-lg opacity-80'
              src={randomPicture}
              alt='Picture logo'
              width={270}
              placeholder='blur'
            />
          </div>
        </div>
        <AddEventDisplay user={user} />
      </div>

      <div className='animate-in w-full gap-8 opacity-0 max-w-4xl py-8 lg:py-8 px-8 text-foreground'>
        <EventsDisplay events={events || []} user={user} />
      </div>
    </div>
  );
}
