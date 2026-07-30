import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { parseVenueSelection } from '@/lib/venue-selection';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  try {
    const formData = await request.formData();
    const supabase = await createClient();

    const desc = formData.get('desc');
    const special_price = formData.get('special_price');
    const event_time = formData.get('event_time');

    // Either an existing venue's id, or a name the submitter typed for a venue
    // we don't have yet. Only admins may create venues, so an unknown name is
    // carried on the pending row until someone approves it.
    const selection = parseVenueSelection(formData);

    if (!selection.ok) {
      return NextResponse.redirect(
        `${requestUrl.origin}?message=${encodeURIComponent(selection.error)}`,
        {
          // a 301 status is required to redirect from a POST to a GET route
          status: 301,
        }
      );
    }

    const { venue_id, venue_name } = selection;

    // Use getAll to retrieve all selected days
    const selectedDays = formData.getAll('days');
    const when = selectedDays.join(' ');

    // Get the authenticated user. getUser() (not getSession()) revalidates
    // the token against the Auth server — this decision (publish directly
    // vs. queue for review) is a real authorization decision, so it must not
    // trust an unverified cookie.
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // If logged in user add direct to the database else add to the pending table
    if (!user) {
      const { data, error } = await supabase
        .from('events_pending')
        .insert([
          { desc, venue_id, venue_name, when, special_price, event_time },
        ]);

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
      // `events` has no venue_name column — an admin naming a new venue gets a
      // real venues row, which RLS permits for authenticated users.
      let resolved_venue_id = venue_id;

      if (resolved_venue_id === null && venue_name !== null) {
        const normalizedVenueName = venue_name.trim();

        // Reuse an existing venue if one already matches case- and
        // whitespace-insensitively (venues_name_normalized_key), the same
        // normalisation the planned approve_pending_event RPC uses
        // (docs/admin-moderation-plan.md), so this path and that one agree
        // on what counts as "the same venue" and "The Local" / "the local "
        // cannot become two separate rows.
        const { data: existingVenueId, error: lookupError } =
          await supabase.rpc('find_venue_id_by_name', {
            p_name: normalizedVenueName,
          });

        if (lookupError) {
          console.error(lookupError);

          return NextResponse.redirect(
            `${requestUrl.origin}?message=Could not save venue`,
            {
              // a 301 status is required to redirect from a POST to a GET route
              status: 301,
            }
          );
        }

        if (existingVenueId) {
          resolved_venue_id = existingVenueId;
        } else {
          const { data: venue, error: venueError } = await supabase
            .from('venues')
            .insert([{ name: normalizedVenueName }])
            .select('id')
            .single();

          if (venueError) {
            console.error(venueError);

            return NextResponse.redirect(
              `${requestUrl.origin}?message=Could not save venue`,
              {
                // a 301 status is required to redirect from a POST to a GET route
                status: 301,
              }
            );
          }

          resolved_venue_id = venue.id;
        }
      }

      const { data, error } = await supabase
        .from('events')
        .insert([
          {
            desc,
            venue_id: resolved_venue_id,
            when,
            special_price,
            event_time,
          },
        ]);

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
  const supabase = await createClient();
  const { data, error } = await supabase.from('events').select('*');

  if (error) {
    // Log the real Postgres error server-side only — the client gets a
    // generic message, same contract as the POST handler above, so this
    // route no longer disagrees with itself about how much detail leaks.
    console.error(error);

    return NextResponse.json(
      { error: 'Could not load events' },
      { status: 500 }
    );
  }

  return NextResponse.json(data, { status: 200 });
}

// D8 (docs/tech-debt-backlog.md): DELETE was removed rather than fixed.
// Nothing in the app called it — DeleteItemButton talks to Supabase
// directly and AddSpecialModal only POSTs — and it had two problems anyway:
// it returned a 301 whether or not a row was actually affected, and it had
// no application-level auth check, relying entirely on RLS to no-op for an
// anonymous caller. Dead, silently-lying code is worse than no code.
