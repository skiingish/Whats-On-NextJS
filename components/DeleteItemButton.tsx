import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function DeleteItemButton({ id }: { id: number }) {
  const router = useRouter();

  async function handleDelete(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const supabase = createClient();
    const { data, error } = await supabase
      .from('events')
      .delete()
      .match({ id });

    if (error) {
      console.error(error);
    } else {
      router.refresh();
      toast('Event Deleted!');
    }
  }

  return (
    <form onSubmit={handleDelete}>
      <input type='hidden' name='id' value={id} />
      <button className='bg-red-700 hover:bg-red-500 rounded px-4 py-2 text-white mb-2'>
        Delete
      </button>
    </form>
  );
}
