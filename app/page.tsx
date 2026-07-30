import { createClient } from '@/lib/supabase/server';
import AddEventDisplay from '@/components/AddEventDisplay';
import Image from 'next/image';
import localFont from 'next/font/local';

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

// The brand display face. Kept deliberately through the 2026 redesign: the
// palette is not the only thing carrying the brand, and the title is the one
// place a distinctive face earns its download.
const AgbalumoRegular = localFont({ src: './Agbalumo-Regular.ttf' });

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

      {/* Non-full-bleed page content: constrained to the shared 72rem shell
          width with the standard gutters, now that app/layout.tsx no longer
          applies that wrapper globally (see the comment there). */}
      <div className='w-full max-w-[72rem] mx-auto flex flex-col gap-8 px-4 py-8 sm:px-6 lg:gap-12 lg:px-8 lg:py-12'>
        <div className='animate-in flex flex-col items-center gap-6 opacity-0'>
          <h1
            className={`text-display text-center text-foreground ${AgbalumoRegular.className}`}
          >
            Specials Spotter!
          </h1>
          {/* Next/Image's static import carries intrinsic width/height, so
              the box is reserved before the image loads — no layout shift
              regardless of which day's picture renders. The `w-full
              lg:max-h-96 object-cover` classes are load-bearing: the visual
              suite pins this element to a 24rem height by selector
              (`img[alt="Picture logo"]`), see tests/visual/screens.spec.ts. */}
          <Image
            className='hidden w-full rounded-xl border border-border object-cover lg:block lg:max-h-96'
            src={heroPicture}
            alt='Picture logo'
            placeholder='blur'
            priority
          />
        </div>

        <div className='w-full max-w-4xl mx-auto flex flex-col gap-8 lg:gap-12'>
          <EventsSection user={user} />
          <AddEventDisplay userLoggedIn={!!user} />
        </div>
      </div>

      <Footer />
    </div>
  );
}
