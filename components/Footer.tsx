'use client';
import { useState } from 'react';
import FeedBackFormModal from './FeedbackFormModal';
import BuyMeACoffee from './BuyMeACoffee';
import { Button } from './ui/button';

const Footer = () => {
  const [showForm, setShowForm] = useState<boolean>(false);

  return (
    // Full-bleed like the navbar (see components/Navbar.tsx and the comment
    // in app/layout.tsx): `w-full` is already the true viewport width since
    // there is no max-width wrapper around page content, so the surface and
    // hairline border span the whole viewport while the inner content aligns
    // to the 72rem shell.
    <footer className='w-full border-t border-border bg-background-secondary'>
      <FeedBackFormModal open={showForm} setOpen={setShowForm} />

      <div className='mx-auto flex w-full max-w-[72rem] flex-col gap-6 px-4 py-10 text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8'>
        <div className='flex flex-col gap-2'>
          <p>Thanks for visiting!</p>
          <p>
            Copyright © {new Date().getFullYear()}{' '}
            <a
              className='font-semibold italic text-foreground hover:text-primary hover:underline'
              href='https://www.seanbuildsthings.com/'
            >
              Sean Builds Things 👋
            </a>
          </p>
        </div>

        <div className='flex flex-col items-start gap-4 sm:items-end'>
          <Button variant='outline' onClick={() => setShowForm(true)}>
            Give Feedback
          </Button>
          <BuyMeACoffee />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
