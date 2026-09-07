import { createClient } from '@/lib/supabase/server';
import VenueMap from '@/components/VenueMap';

export default async function MapPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch venues and their events with coordinates
  const { data: venues } = await supabase
    .from('venues')
    .select('*, events(*)')
    .not('latitude', 'is', null)
    .not('longitude', 'is', null);

  return (
    <div className='w-full max-w-[72rem] mx-auto flex flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8'>
      <div className='flex flex-col gap-1'>
        <h1 className='text-title text-foreground'>Venue Map</h1>
        <p className='text-note text-muted-foreground'>
          Every venue with a live special, pinned — tap a marker to see what&apos;s on.
        </p>
      </div>
      <VenueMap user={user} venues={venues || []} />
    </div>
  );
}
