import { z } from 'zod';
import { FC, Fragment, useRef, useState, FormEvent, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { VenueComboBox } from './ui/VenueComboBox';
import { isNewVenue, newVenueName } from '@/lib/venue-selection';
import { Button } from './ui/button';

// Fields match what's actually collected from this form (see handleFormSubmit
// below) — venue selection is a combobox validated separately, since it's
// controlled state rather than a plain form field, and "when" is built
// server-side by joining the selected `days`.
const eventsSchema = z.object({
  desc: z.string().trim().min(1, 'Please describe the special'),
  special_price: z.string().trim().nullable().optional(),
  event_time: z.string().trim().min(1, 'Please add a time'),
  days: z.array(z.string()).min(1, 'Please select at least one day'),
});

interface AddSpecialModalProps {
  event: Events | null;
  open: boolean;
  setOpen: any;
  userLoggedIn?: boolean | null;
}

// Was seven copy-pasted <label>/<input>/<div> blocks, one per day, each
// carrying an identical ~400-character class string (tech debt D9). Mapping
// over this array is the single source of truth for both the day list and
// its markup.
const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

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

    const formData = new FormData(e.currentTarget);

    const result = eventsSchema.safeParse({
      desc: formData.get('desc'),
      special_price: formData.get('special_price'),
      event_time: formData.get('event_time'),
      days: formData.getAll('days'),
    });

    if (!result.success) {
      toast.error(z.prettifyError(result.error));
      return;
    }

    setLoading(true);

    try {
      // A venue the visitor named themselves doesn't exist yet, so send the
      // name rather than an id and let an admin create it on approval.
      if (isNewVenue(selectedVenue)) {
        formData.delete('venue_id');
        formData.set('venue_name', newVenueName(selectedVenue));
      } else {
        formData.set('venue_id', selectedVenue);
      }

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
          <div className='fixed inset-0 bg-black/75 transition-opacity' />
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
                  className='flex flex-col gap-1 max-w-4xl px-4 py-3 lg:py-8 text-foreground bg-background'
                >
                  <Dialog.Title
                    as='h2'
                    className='text-lg font-semibold leading-6 text-foreground mb-2'
                  >
                    {userLoggedIn ? 'Add Event' : 'Add New Event For Review'}
                  </Dialog.Title>
                  <label className='text-md font-semibold' htmlFor='venue'>
                    Where
                  </label>
                  <VenueComboBox
                    id='venue'
                    value={selectedVenue}
                    onChange={setSelectedVenue}
                    canCreateVenue={!!userLoggedIn}
                    className='rounded-2xl px-4 py-5 border-2 border-foreground bg-background-secondary mb-6'
                  />
                  <label className='text-md font-semibold' htmlFor='desc'>
                    What
                  </label>
                  <input
                    className='rounded-2xl px-4 py-2 border-2 border-foreground bg-background-secondary mb-6'
                    id='desc'
                    name='desc'
                    required
                    placeholder='Cheap Tuesdays...'
                  />
                  <label
                    className='text-md font-semibold'
                    htmlFor='special_price'
                  >
                    Special $ Details (Optional)
                  </label>
                  <input
                    className='rounded-2xl px-4 py-2 border-2 border-foreground bg-background-secondary mb-6'
                    id='special_price'
                    name='special_price'
                    placeholder='$5 Cheese Pizzas...'
                  />
                  <label className='text-md font-semibold' htmlFor='event_time'>
                    Time
                  </label>
                  <input
                    className='rounded-2xl px-4 py-2 border-2 border-foreground bg-background-secondary mb-6'
                    id='event_time'
                    name='event_time'
                    required
                    placeholder='All day...'
                  />

                  <label className='text-md font-semibold'>
                    When (Select All That Apply)
                  </label>
                  <div className='flex-1 flex max-w-lg flex-row flex-wrap justify-center gap-6 py-4 text-foreground'>
                    {DAYS.map((day) => (
                      <label
                        key={day}
                        className='relative inline-flex items-center cursor-pointer'
                      >
                        <input
                          type='checkbox'
                          name='days'
                          value={day}
                          className='sr-only peer'
                        />
                        <div className="w-11 h-6 bg-muted peer-focus:outline-hidden peer-focus:ring-4 peer-focus:ring-primary/40 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background-secondary after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent" />
                        <span className='ml-3 text-sm font-medium'>{day}</span>
                      </label>
                    ))}
                  </div>
                  <div className='bg-inherit px-0 py-3 sm:flex sm:flex-row-reverse sm:px-6'>
                    {loading ? (
                      <Loader2 className='animate-spin h-8 w-8 text-foreground' />
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
