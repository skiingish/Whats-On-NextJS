/**
 * The canonical dataset the visual-regression suite renders against.
 *
 * This is the whole point of the fixture server: these rows live in the repo,
 * so a baseline only changes when someone deliberately edits this file. Adding
 * a venue to the production database no longer moves a single pixel.
 *
 * Three properties here are load-bearing. Changing them will make the suite
 * flaky in ways that are annoying to diagnose:
 *
 * 1. **`when` lists all seven days.** `EventsDisplay.tsx` defaults its day
 *    filter to *today's* weekday. An event scoped to a single day would drop
 *    out of the homepage list on every other day of the week, so "a real
 *    regression" and "it's Tuesday" would be indistinguishable causes of a
 *    failed diff. Seven days renders as "Everyday" via `utils/dataformatter.ts`.
 *
 * 2. **Every event has an explicit, distinct `created_at`.** The homepage
 *    sorts by `created_at` descending with `id` as the tiebreaker. Rows
 *    sharing a timestamp previously let the list order flip between two
 *    otherwise-identical runs — a real flake that cost a debugging session.
 *
 * 3. **Coordinates are spread but not extreme.** `VenueMap.tsx` fits the
 *    viewport to the bounding box of the venues, so the pin layout — and
 *    therefore the screenshot — depends on the spread. These sit across
 *    Melbourne's east, far enough apart to exercise the bounds fitting,
 *    close enough that all pins stay comfortably inside the frame.
 */

export const venues = [
  {
    id: 901,
    created_at: '2026-01-01T00:00:00+00:00',
    name: 'Fixture Arms',
    address: '1 Test Street, Belgrave VIC 3160',
    website: 'https://example.invalid/fixture-arms',
    latitude: '-37.909505',
    longitude: '145.353740',
  },
  {
    id: 902,
    created_at: '2026-01-01T00:00:00+00:00',
    name: 'Fixture Tavern',
    address: '2 Sample Road, Boronia VIC 3155',
    website: 'https://example.invalid/fixture-tavern',
    latitude: '-37.863064',
    longitude: '145.286393',
  },
  {
    id: 903,
    created_at: '2026-01-01T00:00:00+00:00',
    name: 'Fixture Hotel',
    address: '3 Example Avenue, Wantirna VIC 3152',
    website: null,
    latitude: '-37.847054',
    longitude: '145.225043',
  },
];

const EVERY_DAY =
  'Monday Tuesday Wednesday Thursday Friday Saturday Sunday';

export const events = [
  {
    id: 9001,
    created_at: '2026-01-03T00:00:00+00:00',
    desc: 'Fixture Parma Night',
    when: EVERY_DAY,
    special_price: '$20',
    event_time: '5pm - 9pm',
    link: 'https://example.invalid/fixture-arms/whats-on',
    venue_id: 901,
  },
  {
    id: 9002,
    created_at: '2026-01-02T00:00:00+00:00',
    desc: 'Fixture Steak Night',
    when: EVERY_DAY,
    special_price: '$30',
    event_time: '6pm - 9pm',
    link: 'https://example.invalid/fixture-tavern/specials',
    venue_id: 902,
  },
  {
    id: 9003,
    created_at: '2026-01-01T00:00:00+00:00',
    desc: 'Fixture Happy Hour',
    when: EVERY_DAY,
    special_price: '$8 pints',
    event_time: '4pm - 6pm',
    // Deliberately null: exercises the "venue with no link" branch, which is
    // the case the `link` column was made nullable for.
    link: null,
    venue_id: 903,
  },
];

/** A name that appears on screen, used to assert the fixtures are actually live. */
export const SENTINEL_VENUE_NAME = 'Fixture Arms';

const venueById = new Map(venues.map((venue) => [venue.id, venue]));

/**
 * `events` shaped as `select('*, venue:venues(*)')` returns it, pre-sorted the
 * way `EventsSection.tsx` asks for (`created_at` desc, then `id` desc). The
 * mock server does not implement PostgREST's sorting — it just serves this in
 * the order the app expects, which is equivalent for a fixed dataset.
 */
export function eventsWithVenue() {
  return [...events]
    .sort(
      (a, b) =>
        b.created_at.localeCompare(a.created_at) || b.id - a.id
    )
    .map((event) => ({ ...event, venue: venueById.get(event.venue_id) ?? null }));
}

/** `venues` shaped as `select('*, events(*)')`, sorted by name as the app asks. */
export function venuesWithEvents() {
  return [...venues]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((venue) => ({
      ...venue,
      events: events.filter((event) => event.venue_id === venue.id),
    }));
}
