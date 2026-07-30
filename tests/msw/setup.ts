import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './server';

/**
 * Global Vitest setup: every test file runs with Supabase intercepted.
 *
 * `resetHandlers` after each test is what makes per-test overrides safe — a
 * `server.use(scenarios.failure('events'))` inside one test cannot leak into
 * the next.
 */
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
