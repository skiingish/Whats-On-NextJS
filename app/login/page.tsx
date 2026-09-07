import Link from 'next/link';
import Messages from './messages';

// Sorry to make you sign up, just gotta protect from those pesky spam bots. :robot

export default function Login() {
  return (
    <div className="flex-1 w-full flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md flex flex-col gap-4">
        <Link
          href="/"
          className="self-start text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Back
        </Link>

        <div className="rounded-lg border border-border bg-background-secondary shadow-md p-6 sm:p-8 flex flex-col gap-5">
          <h1 className="text-section text-foreground">Log in</h1>

          <form
            className="flex flex-col gap-4"
            action="/auth/sign-in"
            method="post"
          >
            <div className="flex flex-col gap-1.5">
              <label
                className="text-sm font-semibold text-foreground"
                htmlFor="email"
              >
                Email
              </label>
              <input
                className="h-11 w-full rounded-sm border border-input bg-background-secondary px-3 text-foreground placeholder:text-muted-foreground"
                id="email"
                name="email"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                className="text-sm font-semibold text-foreground"
                htmlFor="password"
              >
                Password
              </label>
              <input
                className="h-11 w-full rounded-sm border border-input bg-background-secondary px-3 text-foreground placeholder:text-muted-foreground"
                id="password"
                type="password"
                name="password"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              className="h-11 mt-1 rounded-md bg-primary text-primary-foreground font-semibold tracking-wide hover:bg-primary-hover transition-colors"
              type="submit"
            >
              Sign In
            </button>

            <Messages />
          </form>
        </div>
      </div>
    </div>
  );
}
