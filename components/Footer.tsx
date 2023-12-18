'use client';
import { useState } from 'react';
import FeedBackFormModal from './FeedbackFormModal';

const Footer = ({}) => {
  const [showForm, setShowForm] = useState<boolean>(false);

  return (
    <div className='w-full py-8 bg-orange-500 px-8 lg:py-8 border-t-2 border-foreground gap-4'>
      <FeedBackFormModal open={showForm} setOpen={setShowForm} />
      <p className=' mb-4'>Thanks For Visiting</p>
      <button
        onClick={() => setShowForm(true)}
        className='bg-background dark:bg-dark-foreground dark:text-dark-text-foreground hover:bg-btn-background-hover font-semibold tracking-wide text-foreground border-foreground border-2 rounded-full px-4 py-2 mb-2 w-full lg:w-1/6'
      >
        Give Feedback
      </button>

      <p className='mt-2'>Copyright © {new Date().getFullYear()}</p>
      <p className='italic'>Sean Makes Things</p>
    </div>
  );
};

export default Footer;
