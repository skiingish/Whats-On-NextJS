'use client';
import { useState } from 'react';
import FeedBackFormModal from './FeedbackFormModal';
import BuyMeACoffee from './BuyMeACoffee';
import { Button } from './ui/button';

const Footer = ({}) => {
  const [showForm, setShowForm] = useState<boolean>(false);

  return (
    <div className='w-full py-8 bg-orange-500 px-8 lg:py-8 border-t-2 border-foreground gap-4'>
      <FeedBackFormModal open={showForm} setOpen={setShowForm} />
      <p className=' mb-4'>Thanks For Visiting!</p>

      <Button
        variant={'outline'}
        className='w-[8rem]'
        onClick={() => setShowForm(true)}
      >
        Give Feedback
      </Button>

      <p className='mt-2'>Copyright © {new Date().getFullYear()}</p>
      <a
        className='italic text-blue-700 font-semibold hover:underline'
        href='https://www.seanbuildsthings.com/'
      >
        Sean Builds Things 👋
      </a>
      {/* <div className='mt-5'>
        <BuyMeACoffee />
      </div> */}
    </div>
  );
};

export default Footer;
