import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies, headers } from 'next/headers';
import AddEventDisplay from '@/components/AddEventDisplay';
import { PawPrint } from 'lucide-react';
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
import RainingBurgers from '@/components/RainingAnimatation';

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

const getSubdomainFromUrl = (url: string | null) => {
  if (!url) return '';
  const u = 'https://jasper.specials-spotter.com/';
  const subdomain = u.split('://')[1].split('.')[0];
  console.log(subdomain);
  return subdomain;
};

// Capitalize the first letter of a string.
const capitalize = (s: string) => {
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export default async function Index() {
  const headersList = headers();
  const url = headersList.get('referer');
  const subdomain = getSubdomainFromUrl(url);

  const supabase = createServerComponentClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Randomly select a picture from the array.
  let randomPicture = pictures[Math.floor(Math.random() * pictures.length)];

  return (
    <div className='overscroll-contain font-sans w-full flex flex-col items-center bg-background dark:bg-dark-background'>
      {/* <RainingBurgers /> */}
      <Navbar user={user} />

      <div className='animate-in flex flex-col gap-1 opacity-0 w-full py-1 lg:py-4 text-foreground'>
        <div className='flex flex-col items-center mx-2 mb-2 lg:mb-8'>
          <p
            className={`flex text-4xl ${AgbalumoRegular.className} lg:text-6xl !leading-tight mx-auto max-w-xl text-center my-2 dark:text-dark-text-foreground`}
          >
            <PawPrint size={48} className=' pr-1.5' /> {capitalize(subdomain)}{' '}
            Specials!
          </p>
        </div>
        <Image
          className='opacity-80 w-full lg:max-h-96 object-cover'
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
