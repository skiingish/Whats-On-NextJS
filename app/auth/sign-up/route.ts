import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const formData = await request.formData();
  const email = String(formData.get('email'));
  const password = String(formData.get('password'));
  const token = String(formData.get('token'));
  const supabase = createRouteHandlerClient({ cookies });

  try {
    // Check the JWT token is valid
    if (process.env.JWT_SECRET === undefined) {
      throw new Error('JWT_SECRET not set');
    }

    // If signup token is invalid, redirect to sign up page with error
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decoded);
    } catch (error) {
      console.log(error);
      return NextResponse.redirect(
        `${requestUrl.origin}/sign-up?error=Invalid sign up link or link has expired`,
        {
          // a 301 status is required to redirect from a POST to a GET route
          status: 301,
        }
      );
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${requestUrl.origin}/auth/callback`,
      },
    });

    console.log(error);

    if (error) {
      return NextResponse.redirect(
        `${requestUrl.origin}/sign-up?error=Could not authenticate user`,
        {
          // a 301 status is required to redirect from a POST to a GET route
          status: 301,
        }
      );
    }

    return NextResponse.redirect(
      `${requestUrl.origin}/sign-up?message=Check email to continue sign in process`,
      {
        // a 301 status is required to redirect from a POST to a GET route
        status: 301,
      }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.redirect(
      `${requestUrl.origin}/sign-up?error=Could not create user`,
      {
        // a 301 status is required to redirect from a POST to a GET route
        status: 301,
      }
    );
  }
}
