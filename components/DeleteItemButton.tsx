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
        <button className="bg-btn-background hover:bg-btn-background-hover rounded px-4 py-2 text-white mb-2">Delete</button>
    </form>
  )
}
