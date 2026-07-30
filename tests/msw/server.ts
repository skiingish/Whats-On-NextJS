import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * In-process MSW server, wired into Vitest's lifecycle by tests/msw/setup.ts.
 *
 * `onUnhandledRequest: 'error'` is deliberate: a request this suite did not
 * anticipate should fail the test rather than silently escape to the real
 * network. Supabase credentials are not present in the test environment, so an
 * escaped request would otherwise surface as a confusing timeout or auth error
 * far from its cause.
 */
export const server = setupServer(...handlers);
