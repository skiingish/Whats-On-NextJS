import DeleteItemButton from './DeleteItemButton';
import { FC } from 'react';
export const dynamic = 'force-dynamic';

interface EventsDisplayProps {
  events: Events[] | null;
  user: any;
}

const dayformatter = (dayString: string) => {
  // If this string contains more chars than just a single day of the week, then we need to format it.
  if (dayString.length > 10) {
    if (
      dayString.includes(
        'Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday'
      )
    ) {
      return 'Everyday';
    } else if (
      dayString.includes(
        'Monday Tuesday Wednesday Thursday Friday Saturday Sunday'
      )
    ) {
      return 'Everyday';
    } else if (
      dayString.includes('Monday, Tuesday, Wednesday, Thursday, Friday')
    ) {
      return 'Weekdays';
    } else if (dayString.includes('Saturday, Sunday')) {
      return 'Weekends';
    } else {
      return dayString;
    }
  } else {
    return dayString;
  }
};

const EventsCards: FC<EventsDisplayProps> = ({ events, user }) => {
  return (
    // Specials Table
    <div className=''>
      {events && events?.length > 0 ? (
        events?.map((event) => {
          return (
            <div
              className='flex flex-wrap py-2 my-6 border border-foreground/50 rounded-lg bg-slate-900  shadow-slate-600/10 shadow-inner'
              key={event.id}
            >
              <p className=' text-xl tracking-wider font-bold px-6 py-4 whitespace-no-wrap'>
                {event.venue}
              </p>
              <p className='px-6 py-2 whitespace-no-wrap min-w-full'>
                {event.desc}
              </p>
              <p className='px-6 py-2 whitespace-no-wrap'>
                {event.special_price}
              </p>
              <p className='px-6 py-2 whitespace-no-wrap'>
                {dayformatter(event.when)}
              </p>
              <p className='px-6 py-2 whitespace-no-wrap'>{event.event_time}</p>
              {user ? (
                <div className='flex' style={{ minWidth: '100%' }}>
                  <div className='px-6 py-2 whitespace-no-wrap'>
                    <button className=' bg-yellow-600 hover:bg-yellow-400 rounded px-4 py-2 text-white mb-2'>
                      Edit
                    </button>
                  </div>
                  <div className='px-6 py-2 whitespace-no-wrap'>
                    <DeleteItemButton id={event.id} />
                  </div>
                </div>
              ) : null}
            </div>
          );
        })
      ) : (
        <></>
      )}
    </div>
  );
};

export default EventsCards;
