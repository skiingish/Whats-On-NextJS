import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

export default function DeleteItemButton(id: any) {
  
    function handleDelete(formData: FormData) {
      // Delete the item
      
    // const id = formData.get('id')
    // if (id) {
    //   const supabase = createClientComponentClient()
    //   const res = supabase.from('events').delete().match({ id })
    //   //revalidatePath('/')
    // }
  }
  
  return (
    <form action={handleDelete}>
        <input type="hidden" name="id" value={id} />
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Delete</button>
    </form>
  )
}
