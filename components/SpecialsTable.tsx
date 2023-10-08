import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import DeleteItemButton from './DeleteItemButton'

export const dynamic = 'force-dynamic'


export default async function SpecialsTable() {
  const supabase = createServerComponentClient({ cookies })
  const { data: events } = await supabase.from('events').select()

  async function handleDelete(formData: FormData) {
    'use server'
    const id = formData.get('id')
    if (id) {
      const supabase = createServerActionClient({ cookies })
      const res = await supabase.from('events').delete().match({ id })
      revalidatePath('/')
    }
  }

  return (
    // Specials Table
        <div className="w-full">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-6 py-4 whitespace-no-wrap font-medium text-gray-500 uppercase tracking-wider">
                  What
                </th>
                <th className="px-6 py-4 whitespace-no-wrap font-medium text-gray-500 uppercase tracking-wider">
                  Where
                </th>
                <th className="px-6 py-4 whitespace-no-wrap font-medium text-gray-500 uppercase tracking-wider">
                  When
                </th>
                <th className="px-6 py-3 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                  
                </th>
                <th className="px-6 py-3 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                  
                </th>
              </tr>
            </thead>
            <tbody>
              {
                events?.map((event) => {
                  return (
                    <tr className="" key={event.id}>
                      <td className="px-6 py-4 whitespace-no-wrap">
                        {event.desc}
                      </td>
                      <td className="px-6 py-4 whitespace-no-wrap">
                        {event.venue}
                      </td>
                      <td className="px-6 py-4 whitespace-no-wrap">
                        {event.when}
                      </td>
                      <td className="px-6 py-4 whitespace-no-wrap">
                        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Edit</button>
                      </td>
                      <td className="px-6 py-4 whitespace-no-wrap">
                        <form action={handleDelete}>
                          <input type="hidden" name="id" value={event.id} />
                          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Delete</button>
                        </form>
                      </td>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        </div>
  )
}
