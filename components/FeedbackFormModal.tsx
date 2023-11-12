import { z } from 'zod';
import { FC, Fragment, useRef, useState, FormEvent } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { verifyCaptcha } from '@/utils/serverActions';
import { Dialog, Transition } from '@headlessui/react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';

const feedbackSchema = z.object({
  name: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  message: z.string(),
});

interface FeedbackFormProps {
  open: boolean;
  setOpen: any;
}

const FeedBackFormModal: FC<FeedbackFormProps> = ({ open, setOpen }) => {
  const cancelButtonRef = useRef(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [isVerified, setIsverified] = useState<boolean>(false);

  async function handleCaptchaSubmission(token: string | null) {
    // Server function to verify captcha
    await verifyCaptcha(token)
      .then(() => setIsverified(true))
      .catch(() => setIsverified(false));
  }

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    setLoading(true);
    e.preventDefault();

    try {
      const formData = new FormData(e.currentTarget);

      // Validate the form data.
      const result = await feedbackSchema.safeParseAsync({
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('message'),
      });

      if (!result.success) {
        toast.error(result.error.message);
        throw new Error(result.error.message);
      }

      const response = await fetch('/feedback', {
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
                          Hi There 👋
                        </Dialog.Title>
                        <div className='mt-6'>
                          <div className='flex flex-col w-full justify-center'>
                            <label className='text-sm font-semibold tracking-wide text-foreground'>
                              What shall I call you? (Optional)
                            </label>
                            <input
                              name='name'
                              id='name'
                              className='w-full my-3 px-2 py-3.5 font-semibold border-foreground rounded-xl text-foreground border-2 bg-white '
                              placeholder='Frankie Loves Pizzas...'
                            ></input>
                            <label className='text-sm font-semibold tracking-wide text-foreground'>
                              Where Sure I Email A Reply? (Optional)
                            </label>
                            <input
                              name='email'
                              id='email'
                              className='w-full my-3 px-2 py-3.5 font-semibold border-foreground rounded-xl text-foreground border-2 bg-white '
                              type='email'
                              placeholder='frankie@pizzalovers.com'
                            ></input>
                            <p className='text-sm font-semibold tracking-wide text-foreground'>
                              Whats Your Message?
                            </p>
                            <textarea
                              name='message'
                              id='message'
                              placeholder='I love pizza! Please create me an account (P.S. I own a venue)'
                              className='w-full h-32 mt-2 bg-inherit px-4 py-2 border-2 border-foreground rounded-xl text-foreground bg-white mb-1 '
                            />
                            {/* <ReCAPTCHA
                              sitekey={siteKey}
                              ref={recaptchaRef}
                              onChange={handleCaptchaSubmission}
                            /> */}
                          </div>
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
                          className={`invisible inline-flex w-full justify-center px-3 py-2 text-sm font-semibold tracking-wide text-foreground shadow-sm bg-btn-background hover:bg-btn-background-hover border-foreground border-2 rounded-full sm:ml-3 sm:w-auto`}
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

export default FeedBackFormModal;
