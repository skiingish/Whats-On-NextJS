'use client'
import DeleteItemButton from './DeleteItemButton'
import { FC } from 'react'
export const dynamic = 'force-dynamic'

interface EventsDisplayProps {
  events: Events[] | null
}

const EventsList: FC<EventsDisplayProps>  = ({events}) => {
  return (
    // Specials Table
        <div className='overflow-x-auto bg-fuchsia-400'>
          <table className="min-w-full bg-red-500">
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
                <th className="px-6 py-3 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                  
                </th>
                <th className="px-6 py-3 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                  
                </th>
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
                      <td className="px-6 py-4 whitespace-no-wrap">
                        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Edit</button>
                      </td>
                      <td className="px-6 py-4 whitespace-no-wrap">
                        <DeleteItemButton id={event.id}/>
                      </td>
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