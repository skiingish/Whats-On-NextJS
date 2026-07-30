'use client';
import { FC, useEffect, useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { ChevronDown, Search } from 'lucide-react';
import EventsCards from './EventsCards';
import { getFavourites } from '@/utils/favouritesHandler';
import VenueMap from './VenueMap';
import { cn } from '@/lib/utils';
export const dynamic = 'force-dynamic';

interface EventsDisplayProps {
  events: Events[] | null | undefined;
  venues: Array<Venue> | null;
  user: User | null;
}

const EventsDisplay: FC<EventsDisplayProps> = ({ events, venues, user }) => {
  const [activeList, setActiveList] = useState<string>('all');
  const [showList, setShowList] = useState<boolean>(true);

  // Bumped (not toggled) whenever a favourite changes, purely so the memo
  // below has a dependency that changes on every call and re-reads
  // localStorage — addFavourite/removeFavourite mutate it outside of React
  // state, so there's nothing else to depend on. A previous version used a
  // boolean flipped true->false by an effect for this same purpose, which
  // is exactly the setState-in-effect pattern react-hooks/set-state-in-effect
  // flags (D31): the effect existed solely to synchronize two pieces of
  // React state with each other, with no external system involved.
  const [favouritesVersion, setFavouritesVersion] = useState(0);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchDay, setSearchDay] = useState<string>(() =>
    new Date().toLocaleString('en-us', { weekday: 'long' })
  );
  const [animateSelector, setAnimateSelector] = useState<boolean>(true);

  const refreshFavourites = () => {
    console.log('refreshing favourites');
    setFavouritesVersion((version) => version + 1);
  };

  useEffect(() => {
    setTimeout(() => {
      setAnimateSelector(false);
    }, 3000);
  }, []);

  // If the search has changed.
  const changeSpecialsSearch = (e: any) => {
    setSearchTerm(e.target.value);
  };

  const handleOptionChange = (e: any) => {
    // If the value is blank, then we want to show all events.
    if (e.target.value === 'blank') {
      setSearchDay('');
    } else if (e.target.value === 'today') {
      // If the value is today, then we want to show all events that are on today.
      setSearchDay(new Date().toLocaleString('en-us', { weekday: 'long' }));
    } else {
      // Otherwise, we want to show all events that are on that day.
      setSearchDay(e.target.value);
    }
  };

  // Attach is_favorite without mutating the incoming `events` prop — the
  // original code wrote onto the prop objects directly, which meant a
  // re-render with the same prop reference (e.g. from a parent re-fetch)
  // could see favourites "stick" from a previous render, and made `events`
  // unsafe to reuse elsewhere. Mapping to new objects avoids both.
  const eventsWithFavourites = useMemo(() => {
    const favourites: Events[] = getFavourites();
    return events?.map((event) => ({
      ...event,
      is_favorite: favourites.some((favorite) => favorite.id === event.id),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, favouritesVersion]);

  // If active list not equal to all, then we want to filter the events by the user's favourites.
  const activeListEvents = useMemo(() => {
    if (activeList === 'all') return eventsWithFavourites;
    return eventsWithFavourites?.filter((event) => event.is_favorite);
  }, [eventsWithFavourites, activeList]);

  // Order events by least number of days the special is on and then by newest first.
  const sortedEvents = useMemo(() => {
    if (!activeListEvents) return activeListEvents;
    return [...activeListEvents].sort((a, b) => {
      const daysA = a.when.split(' ').length;
      const daysB = b.when.split(' ').length;

      if (daysA !== daysB) {
        return daysA - daysB; // Order by least number of days the special is on
      } else {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ); // Order by newest added
      }
    });
  }, [activeListEvents]);

  const filteredEventsByDay = useMemo(() => {
    return sortedEvents?.filter((event) => {
      return event.when.toLowerCase().includes(searchDay.toLocaleLowerCase());
    });
  }, [sortedEvents, searchDay]);

  // Search for different items, including day of the week, title, and the place.
  const filteredSearchedEvents = useMemo(() => {
    return filteredEventsByDay?.filter((event) => {
      return (
        event.desc.toLowerCase().includes(searchTerm.toLocaleLowerCase()) ||
        event.when.toLowerCase().includes(searchTerm.toLocaleLowerCase()) ||
        (typeof event.venue === 'string'
          ? event.venue.toLowerCase()
          : event.venue.name.toLowerCase()
        ).includes(searchTerm.toLocaleLowerCase())
      );
    });
  }, [filteredEventsByDay, searchTerm]);

  return (
    <div className='w-full'>
      <h2 className='text-section mb-4 text-foreground'>What&apos;s On</h2>

      {/* Single sticky control bar: search, day filter and the List/Map
          toggle, reachable one-handed while scrolling a long list (spec
          mobile rule 3). Full-bleed like the navbar/footer — `w-full` is
          the true viewport width since app/layout.tsx puts no max-width
          wrapper around page content (see the comment there for why this
          replaced a `w-screen` breakout trick) — so the blurred surface
          spans the viewport while its inner row still aligns to this
          section's own max-w-4xl column. Sits right under the navbar: the
          navbar's row is `h-16` (64px) but the `<nav>` element itself also
          carries a 1px bottom border, making its true rendered height 65px —
          `top-16` alone left a 1px gap/overlap between the two sticky bars
          on scroll (chunk 9 audit), so the offset adds the shared
          `--border-width` token rather than a bare `top-16`. */}
      <div
        className='sticky z-30 w-full border-b border-border bg-background/85 backdrop-blur-md'
        style={{ top: 'calc(4rem + var(--border-width))' }}
      >

        <div className='mx-auto flex w-full max-w-4xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:px-6 lg:px-8'>
          <div className='relative flex-1'>
            <label htmlFor='search' className='sr-only'>
              Search specials
            </label>
            <Search
              aria-hidden='true'
              className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground'
            />
            <input
              className='h-11 w-full rounded-sm border border-input bg-background-secondary pl-9 pr-4 text-foreground placeholder:text-muted-foreground'
              type='text'
              onChange={changeSpecialsSearch}
              id='search'
              name='search'
              placeholder='Pizza... Whistle Stop... Bingo...'
              value={searchTerm}
            />
          </div>

          <div className='flex shrink-0 items-center gap-3'>
            <div className='relative'>
              <label htmlFor='dayselector' className='sr-only'>
                Filter by day
              </label>
              <select
                name='daysoftheweek'
                id='dayselector'
                className={cn(
                  'h-11 shrink-0 appearance-none rounded-sm border border-input bg-background-secondary py-2 pl-3 pr-9 text-sm font-semibold tracking-wide text-foreground',
                  animateSelector && 'animate-bounce'
                )}
                onChange={(e) => {
                  handleOptionChange(e);
                }}
              >
                <option value='today'>Today</option>
                <option value='blank'>Show All</option>
                <option value='monday'>Monday</option>
                <option value='tuesday'>Tuesday</option>
                <option value='wednesday'>Wednesday</option>
                <option value='thursday'>Thursday</option>
                <option value='friday'>Friday</option>
                <option value='saturday'>Saturday</option>
                <option value='sunday'>Sunday</option>
              </select>
              <ChevronDown
                aria-hidden='true'
                className='pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground'
              />
            </div>

            {/* Segmented control, not two unrelated buttons: one rounded
                container, the active segment filled with primary.
                The container has no fixed height — it sizes to its
                children's own h-11 (44px) plus its p-1 padding. It used to
                be h-11 itself with the buttons unsized, which left the
                buttons only as tall as their text line-height (~36px),
                under the 44px tap-target minimum (chunk 9 audit). */}
            <div
              role='tablist'
              aria-label='View'
              className='flex shrink-0 gap-1 rounded-sm bg-muted p-1'
            >
              <button
                role='tab'
                aria-selected={showList}
                onClick={() => setShowList(true)}
                className={cn(
                  'h-11 min-w-[4.5rem] rounded-sm px-3 text-sm font-semibold tracking-wide transition-colors',
                  showList
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                List
              </button>
              <button
                role='tab'
                aria-selected={!showList}
                onClick={() => setShowList(false)}
                className={cn(
                  'h-11 min-w-[4.5rem] rounded-sm px-3 text-sm font-semibold tracking-wide transition-colors',
                  !showList
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Map
              </button>
            </div>
          </div>
        </div>
      </div>

      {filteredSearchedEvents?.length === 0 && (
        <div className='flex flex-col items-center gap-1 py-10 text-center'>
          <p className='text-card-title text-foreground'>
            No specials match that search
          </p>
          <p className='text-meta max-w-sm text-muted-foreground'>
            Try a different day or search term — or if you know a special
            we&apos;re missing, let us know below.
          </p>
        </div>
      )}

      <div className='pt-4'>
        <div className={showList ? 'block' : 'hidden'}>
          <EventsCards
            events={filteredSearchedEvents || []}
            user={user}
            refreshFavourites={refreshFavourites}
          />
        </div>
        <div className='py-4'>
          <div className={showList ? 'hidden' : 'block pb-6'}>
            <VenueMap
              venues={venues}
              filteredEvents={filteredSearchedEvents}
              user={user}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsDisplay;
