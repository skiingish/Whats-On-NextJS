'use client';
import { FC, useState } from 'react';
import AddSpecialModal from './AddSpecialModal';

interface AddEventDisplayProps {
  user: any;
}

const AddEventDisplay: FC<AddEventDisplayProps> = ({ user }) => {
  const [showForm, setShowForm] = useState<boolean>(false);

  // no user is logged in, so we don't want to show the form.
  if (!user) return null;

  return (
    <div>
      <AddSpecialModal event={null} open={showForm} setOpen={setShowForm} />
      <button
        onClick={() => setShowForm(true)}
        className='bg-green-700 hover:bg-green-400 rounded px-4 py-2 text-white mb-2 w-full'
      >
        Add New
      </button>
    </div>
  );
};

export default AddEventDisplay;
