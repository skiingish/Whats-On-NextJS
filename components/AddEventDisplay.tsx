'use client';
import { FC, useState } from 'react';
import AddSpecialModal from './AddSpecialModal';
import { Button } from './ui/button';

interface AddEventDisplayProps {
  userStatus: string | null | undefined;
}

const AddEventDisplay: FC<AddEventDisplayProps> = ({
  userStatus: userStatus,
}) => {
  const [showForm, setShowForm] = useState<boolean>(false);

  return (
    <div className='px-8'>
      <AddSpecialModal
        event={null}
        open={showForm}
        setOpen={setShowForm}
        userLoggedIn={userStatus ? true : false}
      />
      <div className='flex justify-center'>
        <Button onClick={() => setShowForm(true)} className='w-1/2 lg:w-1/3'>
          {userStatus ? 'Add New Event' : 'Something Missing?'}
        </Button>
      </div>
    </div>
  );
};

export default AddEventDisplay;
