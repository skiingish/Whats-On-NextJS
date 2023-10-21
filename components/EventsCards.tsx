'use client'
import DeleteItemButton from './DeleteItemButton'
import { FC } from 'react'
export const dynamic = 'force-dynamic'

interface EventsDisplayProps {
  events: Events[] | null
}

const dayformatter = (dayString: string) => { 
  // If this string contains more chars than just a single day of the week, then we need to format it.
  if (dayString.length > 10) {
    if (dayString.includes('Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday')) {
      return 'Everyday'
    } else if (dayString.includes('Monday, Tuesday, Wednesday, Thursday, Friday')) {
      return 'Weekdays'
    } else if (dayString.includes('Saturday, Sunday')) {
      return 'Weekends'
    } else {
      return dayString
    }
  } else {
    return dayString
  }
}

const EventsCards: FC<EventsDisplayProps>  = ({events}) => {
  return (
    // Specials Table
        <div className='overflow-x-auto'>
          {
            events && events?.length > 0 ?
            events?.map((event) => {
              return (
                <div className="flex flex-wrap py-2 border border-foreground rounded-lg" style={{marginBottom: '1.5rem'}} key={event.id}>
                  <p className="flex-none px-6 py-4 whitespace-no-wrap" style={{minWidth: '100%'}}>
                    {event.venue}
                  </p>
                  <p className="flex-none px-6 py-4 whitespace-no-wrap" style={{minWidth: '100%'}}>
                      {event.desc}
                  </p>
                  <p className="px-6 py-4 whitespace-no-wrap">
                    {event.special_price}
                  </p>
                  <p className="px-6 py-4 whitespace-no-wrap">
                    {dayformatter(event.when)}
                  </p>
                  <p className="px-6 py-4 whitespace-no-wrap">
                    {event.event_time}
                  </p>
                  <div className='flex' style={{minWidth: '100%'}}>
                    <div className="px-6 py-4 whitespace-no-wrap">
                      <button className="bg-green-700 hover:bg-green-300 rounded px-4 py-2 text-white mb-2">Edit</button>
                    </div>
                    <div className="px-6 py-4 whitespace-no-wrap">
                      <DeleteItemButton id={event.id}/>
                    </div>
                  </div>
                </div>
              )
            }) : <></>
          }
        </div>
  )
}

export default EventsCards