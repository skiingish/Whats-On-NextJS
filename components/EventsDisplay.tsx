'use client'
import {FC, useState, useEffect} from 'react'
import EventsList from './EventsList'
export const dynamic = 'force-dynamic'

interface EventsDisplayProps {
  events: Events[] | null
  user: object | null
}

const EventsDisplay: FC<EventsDisplayProps>  = ({events, user}) => {

  const [searchTerm, setSearchTerm] = useState<string>('')
  const [userSession, setUserSession] = useState<any>(null)

  // If the search has changed.
  const changeSpecialsSearch = (e: any) => {
    setSearchTerm(e.target.value);
  };

  // Search for different items, including day of the week, title, and the place.
  let filteredSearchedEvents = events?.filter((event) => {
    let result =
      event.desc
        .toLowerCase()
        .includes(searchTerm.toLocaleLowerCase()) ||
      event.when
        .toLowerCase()
        .includes(searchTerm.toLocaleLowerCase()) ||
      event.venue.toLowerCase().includes(searchTerm.toLocaleLowerCase());

    return result;
  });


  return (
        <div className="w-full">
        <div className="flex-1 flex flex-col w-full justify-center gap-2 text-foreground">
            <label className='text-md'>Search</label>
                <input
                className="rounded-md px-4 py-2 bg-inherit border mb-6"
                type='text'
                onChange={changeSpecialsSearch}
                id='search'
                name='search'
                value={searchTerm}
            />
        </div>
          <EventsList events={filteredSearchedEvents || []} user={user}/>
        </div>
  )
}

export default EventsDisplay