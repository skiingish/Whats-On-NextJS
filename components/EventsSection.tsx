import { FC } from 'react';
import type { User } from '@supabase/supabase-js';
import EventsDisplay from './EventsDisplay';
import { createClient } from '@/lib/supabase/server';

interface EventsSectionProps {
  user: User | null;
}

const EventsSection: FC<EventsSectionProps> = async ({ user }) => {
  const supabase = await createClient();

  // Order explicitly. Without it Postgres may return rows in any physical
  // order, so the list re-shuffled between identical requests — which the
  // visual suite caught as a phantom diff. id is the tiebreaker so events
  // sharing a created_at still land in a stable order.
  let { data: events } = await supabase
    .from('events')
    .select(
      `
      *,
      venue:venues (
        *
      )
    `
    )
    .order('created_at', { ascending: false })
    .order('id', { ascending: false });

  const { data: venues } = await supabase
    .from('venues')
    .select('*, events(*)')
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)
    .order('name');

  if (!events) return null;

  return (
    <div>
      <EventsDisplay events={events} venues={venues || []} user={user} />
    </div>
  );
};

export default EventsSection;
