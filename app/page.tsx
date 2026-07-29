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

// Picks the hero image deterministically, seeded by the day of the year, so
// it still rotates day to day but two renders on the same day — including
// the two back-to-back requests Playwright's light/dark projects make in
// the same run — produce the exact same pick. `Math.random()` here used to
// violate react-hooks/purity (D31) and was also the root cause of the
// visual-test flakiness that `tests/visual/screens.spec.ts` works around:
// the source images have different aspect ratios (verified: most are
// ~1.5:1, but poutine is 1.25:1 and bingo is ~1.47:1), so a different pick
// shifted the rendered height of everything below the hero. Determinism
// fixes the within-run flakiness; the images' differing aspect ratios mean
// the height can still legitimately differ from one day to the next, so
// `pinHeroImage`'s height pin in the visual suite is still needed (see the
// comment there).
function pickHeroImage(): (typeof pictures)[number] {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor(
    (now.getTime() - startOfYear.getTime()) / 86_400_000
  );
  return pictures[dayOfYear % pictures.length];
}

export default async function Index() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const heroPicture = pickHeroImage();

  return (
    <div className='overscroll-contain font-sans w-full flex flex-col items-center bg-background'>
      <Navbar user={user} />

      <div className='animate-in flex flex-col gap-1 opacity-0 w-full py-1 lg:py-4 text-foreground'>
        <div className='flex flex-col items-center mx-2 lg:mb-8'>
          <p
            className={`flex text-4xl ${AgbalumoRegular.className} lg:text-6xl leading-tight! mx-auto max-w-xl text-center my-2`}
          >
            Specials Spotter!
          </p>
        </div>
        <Image
          className='hidden lg:block opacity-80 w-full lg:max-h-96 object-cover'
          src={heroPicture}
          alt='Picture logo'
          placeholder='blur'
        />
      </div>

      <div className='animate-in w-full gap-8 opacity-0 max-w-4xl py-8 lg:py-8 text-foreground'>
        <EventsSection user={user} />
        <AddEventDisplay userLoggedIn={!!user} />
      </div>
      <div className='w-full'>
        <Footer />
      </div>
    </div>
  );
}
