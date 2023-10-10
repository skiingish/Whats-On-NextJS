'use client'
import DeleteItemButton from './DeleteItemButton'
import { FC } from 'react'
export const dynamic = 'force-dynamic'

interface EventsDisplayProps {
  events: Events[] | null
  user: object | null
}

const EventsList: FC<EventsDisplayProps>  = ({events, user}) => {
  return (
    // Specials Table
        <div>
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-6 py-4 whitespace-no-wrap font-medium text-gray-500 uppercase tracking-wider">
                  Where
                </th>
                <th className="px-6 py-4 whitespace-no-wrap leading-4 font-medium text-gray-500 uppercase tracking-wider">
                  What
                </th>
                <th className="px-6 py-4 whitespace-no-wrap leading-4 font-medium text-gray-500 uppercase tracking-wider">
                  Special
                </th>
                <th className="px-6 py-3 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                  When
                </th>
                <th className="px-6 py-3 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                {user ? (<><th className="px-6 py-3 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                  
                </th>
                <th className="px-6 py-3 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                  
                </th></>) : null}
              </tr>
            </thead>
            <tbody>
              {
                events && events?.length > 0 ?
                events?.map((event) => {
                  return (
                    <tr className="" key={event.id}>
                      <td className="px-6 py-4 whitespace-no-wrap">
                       {event.venue}
                      </td>
                      <td className="px-6 py-4 whitespace-no-wrap">
                         {event.desc}
                      </td>
                      <td className="px-6 py-4 whitespace-no-wrap">
                        {event.special_price}
                      </td>
                      <td className="px-6 py-4 whitespace-no-wrap">
                        {event.when}
                      </td>
                      <td className="px-6 py-4 whitespace-no-wrap">
                        {event.event_time}
                      </td>
                      {user ? (<><td className="px-6 py-4 whitespace-no-wrap">
                        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Edit</button>
                      </td>
                      <td className="px-6 py-4 whitespace-no-wrap">
                        <DeleteItemButton id={event.id}/>
                      </td></>) : null}
                    </tr>
                  )
                }) : <></>
              }
            </tbody>
          </table>
        </div>
  )
}

export default EventsList