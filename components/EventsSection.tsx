import { FC } from 'react';
import EventsDisplay from './EventsDisplay';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

interface EventsSectionProps {
  user: any;
}

const EventsSection: FC<EventsSectionProps> = async ({ user }) => {
  const supabase = createServerComponentClient({ cookies });

  let { data: events } = await supabase.from('events').select(`
      *,
      venue:venues (
        *
      )
    `);

  const { data: venues } = await supabase
    .from('venues')
    .select('*, events(*)')
    .not('latitude', 'is', null)
    .not('longitude', 'is', null);

  if (!events) return null;

  return (
    <div>
      <EventsDisplay events={events} venues={venues || []} user={user} />
    </div>
  );
};

export default EventsSection;
