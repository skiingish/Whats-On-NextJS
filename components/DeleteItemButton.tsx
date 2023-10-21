import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function DeleteItemButton(idObj: any) {
  const router = useRouter()

  async function handleDelete(formData: FormData) {
    // Delete the item
    const id = formData.get('id')

    toast('Deleting event...')
    
    if (id) {
      const supabase = createClientComponentClient()
      const {data, error} = await supabase.from('events').delete().match({ id })
      
      if (error) {
        console.error(error)
      } else {
        router.refresh()
        toast('Event Deleted!')
      }
    }
}
  
  return (
    <form action={handleDelete}>
        <input type="hidden" name="id" value={idObj.id} />
        <button className=" bg-red-700 hover:bg-red-500 rounded px-4 py-2 text-white mb-2">Delete</button>
    </form>
  )
}
