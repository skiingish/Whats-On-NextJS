import DeleteItemButton from './DeleteItemButton';
import ReportEventModal from './ReportEventModal';
import { dayformatter } from '@/utils/dataformatter';
import { FC, use, useState, useEffect } from 'react';
export const dynamic = 'force-dynamic';
import { CalendarDays, Clock, Flag, AlertCircle } from 'lucide-react';

interface EventsDisplayProps {
  events: Events[] | null;
  user: any;
}

const EventsCards: FC<EventsDisplayProps> = ({ events, user }) => {
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [reportedEvent, reportEvent] = useState<Events | null>(null);

  useEffect(() => {
    if (reportedEvent && !showReportModal) {
      setShowReportModal(true);
    }
  }, [reportedEvent]);

  return (
    <>
      <ReportEventModal
        open={showReportModal}
        setOpen={setShowReportModal}
        event={reportedEvent}
      />
      <div className=''>
        {events && events?.length > 0 ? (
          events?.map((event) => {
            return (
              <div
                className='flex flex-wrap py-2 my-8 rounded-lg bg-gray-800'
                key={event.id}
              >
                <button
                  className='group absolute right-10 bg-slate-900 content-center rounded-lg hover:bg-slate-500'
                  onClick={() => {
                    reportEvent(event);
                  }}
                >
                  <AlertCircle className='p-1' />
                  <span className='invisible w-20 bg-black text-white content-center absolute rounded-lg z-10 bottom-full left-1/2 -ml-8 group-hover:visible'>
                    Report
                  </span>
                </button>
                <p className=' text-xl tracking-wider font-bold px-6 py-4 whitespace-no-wrap'>
                  {event.venue}
                </p>
                <p className='px-6 py-2 whitespace-no-wrap min-w-full'>
                  {event.desc}
                </p>
                <div>
                  {event.special_price !== null ? (
                    <p className='px-6 py-2 text-md font-bold whitespace-no-wrap'>
                      {event.special_price}
                    </p>
                  ) : null}
                </div>
                <p className='flex px-6 py-2 whitespace-no-wrap'>
                  <CalendarDays className=' pr-1.5' />
                  {dayformatter(event.when)}
                </p>
                <p className='flex px-6 py-2 whitespace-no-wrap'>
                  <Clock className='pr-1.5' /> {event.event_time}
                </p>
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
    </>
  );
};

export default EventsCards;
