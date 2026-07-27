import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  try {
    // Make sure the user is logged in before continuing. This gates invite
    // creation, so it's an authorization decision — getUser() revalidates
    // the token against the Auth server rather than trusting the cookie.
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=You must be logged in to invite users`,
        {
          // a 301 status is required to redirect from a POST to a GET route
          status: 301,
        }
      );
    }

    if (process.env.JWT_SECRET === undefined) {
      throw new Error('JWT_SECRET not set');
    }

    // Create JWT invite token with 7 day expiry
    const token = jwt.sign({ data: user.id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    return NextResponse.redirect(`${requestUrl.origin}/invite?token=${token}`, {
      // a 301 status is required to redirect from a POST to a GET route
      status: 301,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.redirect(
      `${requestUrl.origin}/invite?error=Could not create invite`,
      {
        // a 301 status is required to redirect from a POST to a GET route
        status: 301,
      }
    );
  }
}
