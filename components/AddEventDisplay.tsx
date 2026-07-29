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
    <div className='px-8'>
      <AddSpecialModal
        event={null}
        open={showForm}
        setOpen={setShowForm}
        userLoggedIn={userLoggedIn}
      />
      <div className='flex justify-center'>
        <Button onClick={() => setShowForm(true)} className='w-1/2 lg:w-1/3'>
          {userLoggedIn ? 'Add New Event' : 'Something Missing?'}
        </Button>
      </div>
    </div>
  );
};

export default AddEventDisplay;
