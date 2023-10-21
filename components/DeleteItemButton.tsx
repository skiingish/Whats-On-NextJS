import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

export default function DeleteItemButton(id: any) {
  
    function handleDelete(formData: FormData) {
    //   // Delete the item
    // console.log('Delete the item')
    // const id = formData.get('id')
    // console.log('id', id);
    
    // if (id) {
    //   const supabase = createClientComponentClient()
    //   const {data, error} = await supabase.from('events').delete().match({ id })
    //   //revalidatePath('/')
    //   console.log(data, error)
    // }
  }
  
  return (
    <form action={handleDelete}>
        <input type="hidden" name="id" value={id} />
        <button className=" bg-red-700 hover:bg-red-500 rounded px-4 py-2 text-white mb-2">Delete</button>
    </form>
  )
}
