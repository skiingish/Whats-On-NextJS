'use client';
import { FC, useEffect, useState } from 'react';
import EventsCards from './EventsCards';
export const dynamic = 'force-dynamic';

interface EventsDisplayProps {
  events: Events[] | null;
  user: any;
}

const EventsDisplay: FC<EventsDisplayProps> = ({ events, user }) => {
  let today = new Date().toLocaleString('en-us', { weekday: 'long' });

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchDay, setSearchDay] = useState<string>(today);
  const [animateSelector, setAnimateSelector] = useState<boolean>(true);

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
      today = new Date().toLocaleString('en-us', { weekday: 'long' });
      setSearchDay(today);
    } else {
      // Otherwise, we want to show all events that are on that day.
      setSearchDay(e.target.value);
    }
  };

  // Order events by least number of days the special is on and then by newest first.
  events?.sort((a, b) => {
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

  let filteredEventsByDay = events?.filter((event) => {
    let result = event.when
      .toLowerCase()
      .includes(searchDay.toLocaleLowerCase());
    return result;
  });

  // Search for different items, including day of the week, title, and the place.
  let filteredSearchedEvents = filteredEventsByDay?.filter((event) => {
    let result =
      event.desc.toLowerCase().includes(searchTerm.toLocaleLowerCase()) ||
      event.when.toLowerCase().includes(searchTerm.toLocaleLowerCase()) ||
      event.venue.toLowerCase().includes(searchTerm.toLocaleLowerCase());

    return result;
  });

  return (
    <>
      <div className='w-full'>
        <div className='flex-1 flex flex-col w-full justify-center gap-2 text-foreground dark:text-dark-text-foreground px-8 -mb-3'>
          <label className='text-lg font-bold tracking-wider'>Whats On</label>
          <select
            name='daysoftheweek'
            id='dayselector'
            className={
              animateSelector
                ? 'animate-bounce rounded-full px-4 py-2.5 tracking-wider font-bold text-foreground dark:text-dark-text-foreground border-foreground border-2 mb-6 bg-background-secondary dark:bg-dark-foreground'
                : 'rounded-full px-4 py-2.5 tracking-wider font-bold text-foreground dark:text-dark-text-foreground border-foreground border-2 mb-6 bg-background-secondary dark:bg-dark-foreground'
            }
            style={{
              appearance: 'none',
              backgroundImage:
                'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
              backgroundPosition: 'right 0.8rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.2em',
            }}
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
        </div>
        <div className='... sticky top-0 pt-4 flex-1 flex flex-col w-full justify-center gap-2 dark:bg-dark-background text-foreground dark:text-dark-text-foreground z-10 border-b-2 border-foreground px-8'>
          <label className='flex text-lg font-bold tracking-wider'>
            Search
          </label>

          <input
            className='rounded-full px-4 py-2 tracking-wider font-bold text-foreground dark:text-dark-text-foreground border-2 border-foreground mb-6 bg-background-secondary dark:bg-dark-foreground'
            type='text'
            onChange={changeSpecialsSearch}
            id='search'
            name='search'
            placeholder='Pizza... Whistle Stop... Bingo...'
            value={searchTerm}
          />
        </div>
        {filteredSearchedEvents?.length === 0 ? (
          <div className='px-8'>
            <p className='text-foreground text-center text-2xl mb-4 dark:text-dark-text-foreground'>
              No Events Found
            </p>
          </div>
        ) : (
          <div className='px-8'>
            <EventsCards events={filteredSearchedEvents || []} user={user} />
          </div>
        )}
      </div>
    </>
  );
};

export default EventsDisplay;
