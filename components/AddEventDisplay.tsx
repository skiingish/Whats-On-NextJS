'use client'
import { FC, useState } from 'react'
import AddEventForm from './AddEventForm'

const AddEventDisplay: FC  = () => {

    const [showForm , setShowForm] = useState<boolean>(false)

  return (
        <div>
            {showForm ? (
            <>
                <button 
                    onClick={() => setShowForm(false)}
                    className='bg-btn-background hover:bg-btn-background-hover rounded px-4 py-2 text-white mb-2 w-full'
                    >
                        Cancel
                </button>
                <br></br>
                <br></br>
                <AddEventForm />
            </>) : (
            <button onClick={() => setShowForm(true)}
                className='bg-green-700 hover:bg-green-300 rounded px-4 py-2 text-white mb-2 w-full'
                >
                    Add New
                </button>
            )}
        </div>
  )
}

export default AddEventDisplay