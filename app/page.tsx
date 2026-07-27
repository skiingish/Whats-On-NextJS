import { createClient } from '@/lib/supabase/server';
import AddEventDisplay from '@/components/AddEventDisplay';
import Image from 'next/image';

import localFont from 'next/font/local';

const AgbalumoRegular = localFont({ src: './Agbalumo-Regular.ttf' });

import hamburger from '../public/assets/hamburger_1280.jpg';
import pizza from '../public/assets/pizza_1280.jpg';
import neon from '../public/assets/neon_1280.jpg';
import pasta from '../public/assets/pasta_1280.jpg';
import poutine from '../public/assets/poutine_1280.jpg';
import shopping from '../public/assets/shopping_1280.jpg';
import bingo from '../public/assets/bingo_1280.png';
import skistore from '../public/assets/skistore_1280.jpg';

import Footer from '@/components/Footer';
import EventsSection from '@/components/EventsSection';
import Navbar from '@/components/Navbar';

export const dynamic = 'force-dynamic';

const pictures = [
  hamburger,
  pizza,
  neon,
  pasta,
  poutine,
  shopping,
  bingo,
  skistore,
];

export default async function Index() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Randomly select a picture from the array.
  let randomPicture = pictures[Math.floor(Math.random() * pictures.length)];

  return (
    <div className='overscroll-contain font-sans w-full flex flex-col items-center bg-background dark:bg-dark-background'>
      <Navbar user={user} />

      <div className='animate-in flex flex-col gap-1 opacity-0 w-full py-1 lg:py-4 text-foreground'>
        <div className='flex flex-col items-center mx-2 lg:mb-8'>
          <p
            className={`flex text-4xl ${AgbalumoRegular.className} lg:text-6xl !leading-tight mx-auto max-w-xl text-center my-2 dark:text-dark-text-foreground`}
          >
            Specials Spotter!
          </p>
        </div>
        <Image
          className='hidden lg:block opacity-80 w-full lg:max-h-96 object-cover'
          src={randomPicture}
          alt='Picture logo'
          placeholder='blur'
        />
      </div>

      <div className='animate-in w-full gap-8 opacity-0 max-w-4xl py-8 lg:py-8 text-foreground'>
        <EventsSection user={user} />
        <AddEventDisplay userStatus={user?.aud} />
      </div>
      <div className='w-full'>
        <Footer />
      </div>
    </div>
  );
}
