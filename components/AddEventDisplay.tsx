'use client';
import { FC, useState } from 'react';
import AddSpecialModal from './AddSpecialModal';

interface AddEventDisplayProps {
  userStatus: string | null | undefined;
}

const AddEventDisplay: FC<AddEventDisplayProps> = ({
  userStatus: userStatus,
}) => {
  const [showForm, setShowForm] = useState<boolean>(false);

  return (
    <div>
      <AddSpecialModal
        event={null}
        open={showForm}
        setOpen={setShowForm}
        userLoggedIn={userStatus ? true : false}
      />
      <button
        onClick={() => setShowForm(true)}
        className='bg-btn-background hover:bg-btn-background-hover font-semibold tracking-wide text-foreground border-foreground border-2 rounded-full px-4 py-2 mb-2 w-full'
      >
        {userStatus ? 'Add New' : 'Something Missing?'}
      </button>
    </div>
  );
};

export default AddEventDisplay;
