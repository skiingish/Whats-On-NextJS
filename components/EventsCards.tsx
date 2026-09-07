import DeleteItemButton from './DeleteItemButton';
import ReportEventModal from './ReportEventModal';
import { dayformatter } from '@/utils/dataformatter';
import { addFavourite, removeFavourite } from '@/utils/favouritesHandler';
import { FC, useState } from 'react';
export const dynamic = 'force-dynamic';
import { CalendarDays, Clock, AlertCircle, Star, ExternalLink } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

interface EventsDisplayProps {
  events: Events[] | null;
  user: User | null;
  refreshFavourites: () => void;
}

function eventDestination(event: Events) {
  if (event.link) {
    return { href: event.link, label: 'View this special' };
  }

  if (typeof event.venue !== 'string' && event.venue.website) {
    return { href: event.venue.website, label: 'Visit venue website' };
  }

  return null;
}

function destinationHost(href: string) {
  try {
    return new URL(href).hostname.replace(/^www\./, '');
  } catch {
    return 'Venue website';
  }
}

const EventsCards: FC<EventsDisplayProps> = ({
  events,
  user,
  refreshFavourites,
}) => {
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [reportedEvent, reportEvent] = useState<Events | null>(null);

  // Opening the modal is a direct consequence of the user's click, not a
  // reaction to reportedEvent changing behind the scenes — so it's set here
  // rather than synced afterwards via an effect (which also needed
  // showReportModal itself as a dependency it didn't declare).
  const handleReportClick = (event: Events) => {
    reportEvent(event);
    setShowReportModal(true);
  };

  return (
    <>
      <ReportEventModal
        open={showReportModal}
        setOpen={setShowReportModal}
        event={reportedEvent}
      />
      <div className='flex flex-col gap-4'>
        {events && events?.length > 0 ? (
          events?.map((event, index) => {
            const destination = eventDestination(event);

            return (
              <div
                // card-board applies the sub-degree tilt (alternating by
                // nth-child so a column doesn't read as one skewed block) and
                // straightens on hover. chalk-in staggers the arrival: the
                // board being written on, 70ms apart, capped at 8 so a long
                // list doesn't leave the last card waiting a second and a half.
                className='card-board chalk-in relative rounded-lg border bg-background-secondary p-4 shadow-sm sm:p-5 hover:shadow-md'
                style={{ animationDelay: `${Math.min(index, 8) * 70}ms` }}
                key={event.id}
              >
                <div className='flex items-start justify-between gap-3'>
                  {event.venue && (
                    <h3 className='text-card-title min-w-0 break-words text-foreground'>
                      {typeof event.venue === 'string'
                        ? event.venue
                        : event.venue.name}
                    </h3>
                  )}
                  <div className='flex shrink-0 items-center gap-1'>
                    {event.is_favorite ? (
                      <button
                        aria-label='Remove favourite'
                        className='flex h-11 w-11 items-center justify-center rounded-lg text-primary transition-colors hover:bg-muted'
                        onClick={() => {
                          removeFavourite(event);
                          refreshFavourites();
                        }}
                      >
                        <Star fill='currentColor' size={20} />
                      </button>
                    ) : (
                      <button
                        aria-label='Add favourite'
                        className='flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-primary'
                        onClick={() => {
                          addFavourite(event);
                          refreshFavourites();
                        }}
                      >
                        <Star size={20} />
                      </button>
                    )}
                    <button
                      aria-label='Report'
                      className='flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-destructive'
                      onClick={() => {
                        handleReportClick(event);
                      }}
                    >
                      <AlertCircle size={20} />
                    </button>
                  </div>
                </div>

                {/*
                  The menu line: description on the left, price hard right,
                  joined by a dotted leader. That leader is the single most
                  recognisable typographic move in printed menus, and it does
                  real work here — it ties the dish to its price across a gap
                  instead of leaving them as two unrelated blocks, and it fills
                  the space that made the previous stacked version feel empty.
                */}
                <div className='mt-2 flex items-end gap-2'>
                  <p className='min-w-0 break-words text-foreground'>
                    {event.desc}
                  </p>

                  {event.special_price !== null && (
                    <>
                      <span
                        aria-hidden='true'
                        className='mb-1.5 min-w-6 flex-1 border-b border-dotted border-border/50'
                      />
                      <span className='text-price price-tag shrink-0'>
                        {event.special_price}
                      </span>
                    </>
                  )}
                </div>

                {/* Docket footer: mono, uppercase, above a chalk rule. */}
                <div className='rule-chalk mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t pt-3'>
                  <span className='text-meta flex items-center gap-1.5 text-muted-foreground'>
                    <CalendarDays size={14} />
                    {dayformatter(event.when)}
                  </span>
                  <span className='text-meta flex items-center gap-1.5 text-muted-foreground'>
                    <Clock size={14} />
                    {event.event_time}
                  </span>

                </div>

                {destination && (
                  <a
                    href={destination.href}
                    target='_blank'
                    rel='noopener noreferrer'
                    aria-label={`${destination.label} at ${destinationHost(destination.href)} (opens in a new tab)`}
                    className='group mt-4 flex min-h-12 items-center justify-between gap-4 border-y border-dashed border-border/70 bg-primary/10 px-3 py-2 text-primary transition-[background-color,color,transform] hover:bg-primary hover:text-primary-foreground focus-visible:bg-primary focus-visible:text-primary-foreground'
                  >
                    <span className='min-w-0'>
                      <span className='block font-display text-base font-bold leading-tight'>
                        {destination.label}
                      </span>
                      <span className='text-note block truncate opacity-75'>
                        {destinationHost(destination.href)}
                      </span>
                    </span>
                    <span className='flex size-9 shrink-0 items-center justify-center rounded-full border border-current transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5'>
                      <ExternalLink aria-hidden='true' size={16} />
                    </span>
                  </a>
                )}

                {user ? (
                  // Edit button removed (D22): there is no edit flow built
                  // yet, and admin inline editing is planned for Phase 5 of
                  // the admin plan. A dead button here would only look
                  // broken to a logged-in user.
                  <div className='mt-4'>
                    <DeleteItemButton id={event.id} />
                  </div>
                ) : null}
              </div>
            );
          })
        ) : (
          <p className='text-note py-8 text-center text-muted-foreground'>
            No specials to show right now — check back soon.
          </p>
        )}
      </div>
    </>
  );
};

export default EventsCards;
