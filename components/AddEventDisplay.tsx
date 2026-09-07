'use client';
import { FC, useState } from 'react';
import AddSpecialModal from './AddSpecialModal';
import { Button } from './ui/button';

interface AddEventDisplayProps {
  userLoggedIn: boolean;
}

const AddEventDisplay: FC<AddEventDisplayProps> = ({ userLoggedIn }) => {
  const [showForm, setShowForm] = useState<boolean>(false);

  return (
    <div className='flex flex-col items-center gap-2 py-4 text-center'>
      <AddSpecialModal
        event={null}
        open={showForm}
        setOpen={setShowForm}
        userLoggedIn={userLoggedIn}
      />
      {!userLoggedIn && (
        <p className='text-note text-muted-foreground'>
          Know a special that isn&apos;t listed yet?
        </p>
      )}
      <Button
        size='lg'
        onClick={() => setShowForm(true)}
        className='w-full sm:w-auto sm:min-w-64'
      >
        {userLoggedIn ? 'Add New Event' : 'Something Missing?'}
      </Button>
    </div>
  );
};

export default AddEventDisplay;
