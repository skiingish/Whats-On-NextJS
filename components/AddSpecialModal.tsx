import { set, z } from 'zod';
import { FC, Fragment, useRef, useState, FormEvent, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { VenueComboBox } from './ui/VenueComboBox';
import { Button } from './ui/button';

const eventsSchema = z.object({
  venue: z.string(),
  desc: z.string(),
  special_price: z.string().nullable().optional(),
  when: z.string(),
  event_time: z.string(),
});

interface AddSpecialModalProps {
  event: Events | null;
  open: boolean;
  setOpen: any;
  userLoggedIn?: boolean | null;
}

const AddSpecialModal: FC<AddSpecialModalProps> = ({
  event,
  open,
  setOpen,
  userLoggedIn,
}) => {
  const cancelButtonRef = useRef(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedVenue, setSelectedVenue] = useState('');

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedVenue) {
      toast.error('Please select or add a venue');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      formData.set('venue_id', selectedVenue);

      const response = await fetch('/events', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to submit event');
      }

      setLoading(false);
      setSelectedVenue('');
      setOpen(false);

      if (userLoggedIn) {
        toast.success('Event added!');
      } else {
        toast.success('Event submitted for approval!');
      }
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
              <Dialog.Panel className='relative transform overflow-hidden rounded-2xl border-4 border-foreground bg-background text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg'>
                <form
                  onSubmit={handleFormSubmit}
                  className='flex flex-col gap-1 max-w-4xl px-4 py-3 lg:py-8 text-foreground bg-background dark:bg-dark-foreground dark:text-dark-text-foreground'
                >
                  <Dialog.Title
                    as='h2'
                    className='text-lg font-semibold leading-6 text-foreground dark:text-dark-text-foreground mb-2'
                  >
                    {userLoggedIn ? 'Add Event' : 'Add New Event For Review'}
                  </Dialog.Title>
                  <label className='text-md font-semibold'>Where</label>
                  <VenueComboBox
                    value={selectedVenue}
                    onChange={setSelectedVenue}
                    className='rounded-2xl px-4 py-5 bg-inherit border-2 border-foreground bg-white dark:bg-dark-background mb-6'
                  />
                  <label className='text-md font-semibold'>What</label>
                  <input
                    className='rounded-2xl px-4 py-2 bg-inherit border-2 border-foreground bg-white dark:bg-dark-background mb-6'
                    name='desc'
                    required
                    placeholder='Cheap Tuesdays...'
                  />
                  <label className='text-md font-semibold'>
                    Special $ Details (Optional)
                  </label>
                  <input
                    className='rounded-2xl px-4 py-2 bg-inherit border-2 border-foreground bg-white dark:bg-dark-background mb-6'
                    name='special_price'
                    placeholder='$5 Cheese Pizzas...'
                  />
                  <label className='text-md font-semibold'>Time</label>
                  <input
                    className='rounded-2xl px-4 py-2 bg-inherit border-2 border-foreground bg-white dark:bg-dark-background mb-6'
                    name='event_time'
                    required
                    placeholder='All day...'
                  />

                  <label className='text-md font-semibold'>
                    When (Select All That Apply)
                  </label>
                  <div className='flex-1 flex max-w-lg flex-row flex-wrap justify-center gap-6 py-4 text-foreground dark:text-dark-text-foreground'>
                    <label className='relative inline-flex items-center cursor-pointer'>
                      <input
                        type='checkbox'
                        name='days'
                        value='Monday'
                        className='sr-only peer'
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
                      <span className='ml-3 text-sm font-medium'>Monday</span>
                    </label>
                    <label className='relative inline-flex items-center cursor-pointer'>
                      <input
                        type='checkbox'
                        name='days'
                        value='Tuesday'
                        className='sr-only peer'
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
                      <span className='ml-3 text-sm font-medium'>Tuesday</span>
                    </label>
                    <label className='relative inline-flex items-center cursor-pointer'>
                      <input
                        type='checkbox'
                        name='days'
                        value='Wednesday'
                        className='sr-only peer'
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
                      <span className='ml-3 text-sm font-medium'>
                        Wednesday
                      </span>
                    </label>
                    <label className='relative inline-flex items-center cursor-pointer'>
                      <input
                        type='checkbox'
                        name='days'
                        value='Thursday'
                        className='sr-only peer'
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
                      <span className='ml-3 text-sm font-medium'>Thursday</span>
                    </label>
                    <label className='relative inline-flex items-center cursor-pointer'>
                      <input
                        type='checkbox'
                        name='days'
                        value='Friday'
                        className='sr-only peer'
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
                      <span className='ml-3 text-sm font-medium'>Friday</span>
                    </label>
                    <label className='relative inline-flex items-center cursor-pointer'>
                      <input
                        type='checkbox'
                        name='days'
                        value='Saturday'
                        className='sr-only peer'
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
                      <span className='ml-3 text-sm font-medium'>Saturday</span>
                    </label>
                    <label className='relative inline-flex items-center cursor-pointer'>
                      <input
                        type='checkbox'
                        name='days'
                        value='Sunday'
                        className='sr-only peer'
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
                      <span className='ml-3 text-sm font-medium'>Sunday</span>
                    </label>
                  </div>
                  <div className='bg-inherit px-0 py-3 sm:flex sm:flex-row-reverse sm:px-6'>
                    {loading ? (
                      <Loader2 className='animate-spin h-8 w-8 text-black' />
                    ) : (
                      <>
                        <Button
                          type='submit'
                          className='inline-flex w-full justify-center px-3 py-2 text-sm sm:ml-3 sm:w-auto'
                        >
                          Submit
                        </Button>
                        <Button
                          type='button'
                          variant={'secondary'}
                          className='mt-3 inline-flex w-full justify-center text-sm font-semibold border-foreground sm:mt-0 sm:w-auto'
                          onClick={() => setOpen(false)}
                          ref={cancelButtonRef}
                        >
                          Cancel
                        </Button>
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

export default AddSpecialModal;
