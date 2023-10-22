'use client';
import { FC, useState } from 'react';
import EventsCards from './EventsCards';
export const dynamic = 'force-dynamic';

interface EventsDisplayProps {
  events: Events[] | null;
  user: any;
}

const EventsDisplay: FC<EventsDisplayProps> = ({ events, user }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  // If the search has changed.
  const changeSpecialsSearch = (e: any) => {
    setSearchTerm(e.target.value);
  };

  const handleOptionChange = (e: any) => {
    // If the value is blank, then we want to show all events.
    if (e.target.value === 'blank') {
      setSearchTerm('');
    } else if (e.target.value === 'today') {
      // If the value is today, then we want to show all events that are on today.
      let today = new Date().toLocaleString('en-us', { weekday: 'long' });
      setSearchTerm(today);
    } else {
      // Otherwise, we want to show all events that are on that day.
      setSearchTerm(e.target.value);
    }
  };

  // Search for different items, including day of the week, title, and the place.
  let filteredSearchedEvents = events?.filter((event) => {
    let result =
      event.desc.toLowerCase().includes(searchTerm.toLocaleLowerCase()) ||
      event.when.toLowerCase().includes(searchTerm.toLocaleLowerCase()) ||
      event.venue.toLowerCase().includes(searchTerm.toLocaleLowerCase());

    return result;
  });

  return (
    <div className='w-full'>
      <div className='flex-1 flex flex-col w-full justify-center gap-2 text-foreground'>
        <label className='text-md'>Whats On</label>
        <select
          name='daysoftheweek'
          id='dayselector'
          className='rounded-md px-4 py-2 bg-inherit border mb-6'
          onChange={(e) => {
            handleOptionChange(e);
          }}
        >
          <option value='blank'>Everyday</option>
          <option value='today'>Today</option>
          <option value='monday'>Monday</option>
          <option value='tuesday'>Tuesday</option>
          <option value='wednesday'>Wednesday</option>
          <option value='thursday'>Thursday</option>
          <option value='friday'>Friday</option>
          <option value='saturday'>Saturday</option>
          <option value='sunday'>Sunday</option>
        </select>
      </div>
      <div className='flex-1 flex flex-col w-full justify-center gap-2 text-foreground'>
        <label className='text-md'>Search</label>
        <input
          className='rounded-md px-4 py-2 bg-inherit border mb-6'
          type='text'
          onChange={changeSpecialsSearch}
          id='search'
          name='search'
          value={searchTerm}
        />
      </div>
      <hr className='py-6'></hr>
      <EventsCards events={filteredSearchedEvents || []} user={user} />
      {/* <EventsList events={filteredSearchedEvents || []}/> */}
    </div>
  );
};

export default EventsDisplay;
