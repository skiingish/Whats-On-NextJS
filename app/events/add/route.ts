import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const formData = await request.formData();
  const desc = String(formData.get('desc'));
  const venue = String(formData.get('venue'));
  const days = String(formData.get('days'));
  const supabase = createRouteHandlerClient({ cookies });

  const { data, error } = await supabase
    .from('events')
    .insert([{ desc, venue, days }]);

  if (error) {
    console.error(error);
    return NextResponse.redirect(
      `${requestUrl.origin}?message=Could not save item`,
      {
        // a 301 status is required to redirect from a POST to a GET route
        status: 301,
      }
    );
  }

  return NextResponse.redirect(
    `${requestUrl.origin}?message=Item saved successfully`,
    {
      // a 301 status is required to redirect from a POST to a GET route
      status: 301,
    }
  );
}
