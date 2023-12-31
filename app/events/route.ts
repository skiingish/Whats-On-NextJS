import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  try {
    const formData = await request.formData();
    const supabase = createRouteHandlerClient({ cookies });

    const desc = formData.get('desc');
    const venue = formData.get('venue');
    const special_price = formData.get('special_price');
    const event_time = formData.get('event_time');

    // Use getAll to retrieve all selected days
    const selectedDays = formData.getAll('days');
    const when = selectedDays.join(' ');

    // Get the session
    let session = await supabase.auth.getSession();

    // If logged in user add direct to the database else add to the pending table
    if (!session.data.session) {
      const { data, error } = await supabase
        .from('events_pending')
        .insert([{ desc, venue, when, special_price, event_time }]);

      if (error) {
        console.error(error);

        //return NextResponse.json({ error }, { status: 500 });

        return NextResponse.redirect(
          `${requestUrl.origin}?message=Could not save item`,
          {
            // a 301 status is required to redirect from a POST to a GET route
            status: 301,
          }
        );
      }
    } else {
      const { data, error } = await supabase
        .from('events')
        .insert([{ desc, venue, when, special_price, event_time }]);

      if (error) {
        console.error(error);

        //return NextResponse.json({ error }, { status: 500 });

        return NextResponse.redirect(
          `${requestUrl.origin}?message=Could not save item`,
          {
            // a 301 status is required to redirect from a POST to a GET route
            status: 301,
          }
        );
      }
    }

    //return NextResponse.json({ message: 'Event Added!' }, { status: 200 });

    // Redirect to the home page after a successful POST.
    return NextResponse.redirect(`${requestUrl.origin}/`, {
      // a 301 status is required to redirect from a POST to a GET route
      // TODO this should just call the refresh function, and do something fun like flying burgers on the screen.
      status: 301,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.redirect(
      `${requestUrl.origin}?message=Could not save item`,
      {
        // a 301 status is required to redirect from a POST to a GET route
        status: 301,
      }
    );
  }
}

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data, error } = await supabase.from('events').select('*');

  if (error) {
    console.error(error);

    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
}

export async function DELETE(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const formData = await request.formData();
  const requestUrl = new URL(request.url);
  const id = formData.get('id');
  const { data, error } = await supabase.from('events').delete().match({ id });

  if (error) {
    console.error(error);
    return new Response('Error', { status: 500 });
  }

  return NextResponse.redirect(`${requestUrl.origin}`, {
    // a 301 status is required to redirect from a POST to a GET route
    status: 301,
  });
}
