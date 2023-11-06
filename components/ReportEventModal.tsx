import { z } from 'zod';
import { FC, Fragment, useRef, useState, FormEvent } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { dayformatter } from '@/utils/dataformatter';
import { CalendarDays, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const issueSchema = z.object({
  eventid: z.number(),
  issueselector: z.string(),
  missinginfotext: z.string().nullable().optional(),
});

interface ReportEventModalProps {
  event: Events | null;
  open: boolean;
  setOpen: any;
}

const ReportEventModal: FC<ReportEventModalProps> = ({
  event,
  open,
  setOpen,
}) => {
  const cancelButtonRef = useRef(null);
  const [issue, setIssue] = useState<string>('notvaild');
  const [loading, setLoading] = useState<boolean>(false);

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    setLoading(true);
    e.preventDefault();
    let eventId = event?.id;
    // If no event id is found, then we don't want to submit the form.
    if (!eventId) {
      throw new Error('No event id found');
    }

    try {
      const formData = new FormData(e.currentTarget);
      formData.append('eventid', eventId.toString());

      // Validate the form data.
      const result = await issueSchema.safeParseAsync({
        eventid: eventId,
        issueselector: formData.get('issueselector'),
        missinginfotext: formData.get('missinginfotext'),
      });

      if (!result.success) {
        toast.error(result.error.message);
        throw new Error(result.error.message);
      }

      const response = await fetch('/issues', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      toast.success(data.message);
      setLoading(false);
      setOpen(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
      toast.error('Could not submit form');
    }
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as='div'
        className='relative z-10'
        initialFocus={cancelButtonRef}
        onClose={setOpen}
      >
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity' />
        </Transition.Child>

        <div className='fixed inset-0 z-10 w-screen overflow-y-auto'>
          <div className='flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
              enterTo='opacity-100 translate-y-0 sm:scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 translate-y-0 sm:scale-100'
              leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
            >
              <Dialog.Panel className='relative transform overflow-hidden rounded-xl border-4 border-foreground bg-background text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg'>
                <form onSubmit={handleFormSubmit}>
                  <div className='bg-background px-4 pb-4 pt-5 sm:p-6 sm:pb-4'>
                    <div className='sm:flex sm:items-start'>
                      {/* <div className='mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10'></div> */}
                      <div className='mt-2 text-center sm:ml-4 sm:mt-0 sm:text-left'>
                        <Dialog.Title
                          as='h3'
                          className='text-base font-semibold leading-6 text-foreground'
                        >
                          Report Event - {event?.venue}
                        </Dialog.Title>
                        <div
                          className='flex flex-wrap py-2 my-3 border-2 border-foreground rounded-xl text-foreground bg-white'
                          key={event?.id}
                        >
                          <p className=' text-md tracking-wider font-bold px-6 py-2 whitespace-no-wrap'>
                            {event?.venue}
                          </p>
                          <p className='flex px-6 py-2 min-w-full'>
                            {event?.desc}
                          </p>
                          <div>
                            {event?.special_price !== null ? (
                              <p className='px-6 py-2 text-md font-bold whitespace-no-wrap'>
                                {event?.special_price}
                              </p>
                            ) : null}
                          </div>
                          <p className='flex px-6 py-2 whitespace-no-wrap'>
                            <CalendarDays className=' pr-1.5' />
                            {dayformatter(event?.when)}
                          </p>
                          <p className='flex px-6 py-2 whitespace-no-wrap'>
                            <Clock className='pr-1.5' /> {event?.event_time}
                          </p>
                        </div>
                        <div className='mt-6'>
                          <div className='flex flex-col w-full justify-center'>
                            <label className='text-sm font-semibold tracking-wide text-foreground'>
                              What would you like to report?
                            </label>
                            <select
                              name='issueselector'
                              id='issueselector'
                              className='w-full my-3 px-2 py-3.5 font-semibold border-foreground rounded-xl text-foreground border-2 bg-white '
                              value={issue}
                              onChange={(e) => {
                                setIssue(e.target.value);
                              }}
                            >
                              <option value='notvaild'>Doesn't Exist</option>
                              <option value='missinginfo'>
                                Incorrect Info
                              </option>
                            </select>
                          </div>
                          {issue === 'missinginfo' ? (
                            <>
                              <p className='text-sm font-semibold tracking-wide text-foreground'>
                                Whats Missing?
                              </p>
                              <textarea
                                name='missinginfotext'
                                id='missinginfotext'
                                className='w-full h-32 mt-2 bg-inherit px-4 py-2 border-2 border-foreground rounded-xl text-foreground bg-white mb-1 '
                              />
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='bg-background px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6'>
                    {loading ? (
                      <Loader2 className='animate-spin h-8 w-8 text-foreground' />
                    ) : (
                      <>
                        <button
                          type='submit'
                          className='inline-flex w-full justify-center px-3 py-2 text-sm font-semibold tracking-wide text-foreground shadow-sm bg-btn-background hover:bg-btn-background-hover border-foreground border-2 rounded-full sm:ml-3 sm:w-auto'
                        >
                          Submit
                        </button>
                        <button
                          type='button'
                          className='mt-3 inline-flex w-full justify-center rounded-full text-foreground px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset border-foreground border-2 ring-gray-300 hover:bg-gray-50 hover:text-black sm:mt-0 sm:w-auto'
                          onClick={() => setOpen(false)}
                          ref={cancelButtonRef}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default ReportEventModal;
