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
        className='bg-green-700 hover:bg-green-400 rounded px-4 py-2 text-white mb-2 w-full'
      >
        {userStatus ? 'Add New' : 'Something Missing?'}
      </button>
    </div>
  );
};

export default AddEventDisplay;
