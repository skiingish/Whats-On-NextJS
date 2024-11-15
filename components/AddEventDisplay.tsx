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
      <Button onClick={() => setShowForm(true)} className='w-full'>
        {userStatus ? 'Add New' : 'Something Missing?'}
      </Button>
    </div>
  );
};

export default AddEventDisplay;
