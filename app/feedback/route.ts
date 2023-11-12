import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const supabase = createRouteHandlerClient({ cookies });

    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');

    // No info needed for a event reported as not vaild
    if (message === '' || !message || message === undefined) {
      return NextResponse.json(
        { error: 'Message can not be blank' },
        { status: 500 }
      );
    }

    const { data, error } = await supabase
      .from('feedback')
      .insert([{ name, email, message }]);

    if (error) {
      console.error(error);

      return NextResponse.json({ error }, { status: 500 });
    }

    //return NextResponse.json({ message: 'Event Added!' }, { status: 200 });

    return NextResponse.json(
      { message: 'Thanks for your feedback!' },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Could not submit feedback, server error!' },
      { status: 500 }
    );
  }
}
