import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function DeleteItemButton({ id }: { id: number }) {
  const router = useRouter();

  async function handleDelete(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Native confirm() over a full dialog component: this button renders once
    // per card in a list, and a Radix dialog would need its own open state
    // (and portal) threaded through every row just to ask one yes/no
    // question. confirm() blocks synchronously, needs no extra state, and is
    // the same pattern the browser already uses for "leave this page?".
    const confirmed = window.confirm(
      'Delete this event? This cannot be undone.'
    );
    if (!confirmed) {
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.from('events').delete().match({ id });

    if (error) {
      console.error(error);
      toast.error('Could not delete event. Please try again.');
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
