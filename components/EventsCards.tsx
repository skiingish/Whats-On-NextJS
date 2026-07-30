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
          events?.map((event) => {
            return (
              <div
                className='relative rounded-lg border border-border bg-background-secondary p-4 shadow-sm transition-shadow sm:p-5 hover:shadow-md'
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

                <p className='mt-2 break-words text-foreground'>
                  {event.desc}
                </p>

                {event.special_price !== null && (
                  <span className='text-price mt-3 inline-flex items-center rounded-full bg-accent px-3 py-1 text-accent-foreground'>
                    {event.special_price}
                  </span>
                )}

                <div className='text-meta mt-3 flex flex-col gap-1 text-muted-foreground'>
                  <span className='flex items-center gap-1.5'>
                    <CalendarDays size={16} />
                    {dayformatter(event.when)}
                  </span>
                  <span className='flex items-center gap-1.5'>
                    <Clock size={16} />
                    {event.event_time}
                  </span>
                </div>

                {event.link && (
                  <a
                    href={event.link}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-meta mt-3 inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-primary'
                  >
                    View source
                    <ExternalLink size={14} />
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
          <p className='text-meta py-8 text-center text-muted-foreground'>
            No specials to show right now — check back soon.
          </p>
        )}
      </div>
    </>
  );
};

export default EventsCards;
