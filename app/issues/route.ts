import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  try {
    const formData = await request.formData();
    const supabase = createRouteHandlerClient({ cookies });

    const event_id = formData.get('eventid');
    const issue = formData.get('issueselector');
    let info = formData.get('missinginfotext');

    // No info needed for a event reported as not vaild
    if (issue === 'notvaild') {
      info = '';
    }
    // const special_price = formData.get('special_price');
    // const event_time = formData.get('event_time');

    // // Use getAll to retrieve all selected days
    // const selectedDays = formData.getAll('days');
    // const when = selectedDays.join(' ');

    const { data, error } = await supabase
      .from('issues')
      .insert([{ event_id, issue, info }]);

    if (error) {
      console.error(error);

      return NextResponse.json({ error }, { status: 500 });
    }

    //return NextResponse.json({ message: 'Event Added!' }, { status: 200 });

    return NextResponse.json(
      { message: 'Thanks for your feedback!' },
      { status: 200 }
    );

    // // Redirect to the home page after a successful POST.
    return NextResponse.redirect(`${requestUrl.origin}/`, {
      // a 301 status is required to redirect from a POST to a GET route
      // TODO this should just call the refresh function, and do something fun like flying burgers on the screen.
      status: 301,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.redirect(
      `${requestUrl.origin}?message=Could not report issue`,
      {
        // a 301 status is required to redirect from a POST to a GET route
        status: 301,
      }
    );
  }
}
