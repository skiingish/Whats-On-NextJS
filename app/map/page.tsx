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
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-2xl font-bold mb-4'>Venue Map</h1>
      <VenueMap user={user} venues={venues || []} />
    </div>
  );
}
