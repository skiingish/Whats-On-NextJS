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

  console.log(events);

  if (!events) return null;

  return (
    <div>
      <EventsDisplay events={events} user={user} />
    </div>
  );
};

export default EventsSection;
