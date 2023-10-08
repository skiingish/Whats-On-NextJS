'use client'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { revalidatePath } from 'next/cache'

export default function DeleteItemButton(id: any) {
  
  // Create a Supabase client configured to use cookies
  const supabase = createClientComponentClient()

  const handleDelete = async (id: number) => {
    const res = await supabase.from('events').delete().match({ id })
    console.log(res);
    
    //revalidatePath('/')
  }

  return (
    <button onClick={() => handleDelete(id)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Delete</button>
  )
}
