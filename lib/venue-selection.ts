/**
 * Shared vocabulary for the venue picker.
 *
 * Only admins can create venues, so when a visitor names a venue we don't have
 * yet the name travels on the submission instead of becoming a live `venues`
 * row. The combobox therefore holds either a real venue id or a proposed name
 * behind a prefix, and the events route has to tell the two apart.
 */

export const NEW_VENUE_PREFIX = 'new:';

export const makeNewVenueValue = (name: string) => NEW_VENUE_PREFIX + name;

export const isNewVenue = (value: string) => value.startsWith(NEW_VENUE_PREFIX);

export const newVenueName = (value: string) =>
  value.slice(NEW_VENUE_PREFIX.length);

export type VenueSelection =
  | { ok: true; venue_id: number | null; venue_name: string | null }
  | { ok: false; error: string };

/**
 * Normalise the venue half of a submitted event form.
 *
 * Mirrors the `events_pending_venue_present` check constraint: a submission
 * must carry either a venue id or a non-blank name. An id always wins over a
 * name so we never store a stale name alongside a real venue.
 */
export function parseVenueSelection(formData: FormData): VenueSelection {
  const rawId = String(formData.get('venue_id') ?? '').trim();
  const rawName = String(formData.get('venue_name') ?? '').trim();

  const venue_name = rawName === '' ? null : rawName;

  if (rawId === '') {
    if (venue_name === null) {
      return { ok: false, error: 'Please choose or name a venue' };
    }
    return { ok: true, venue_id: null, venue_name };
  }

  const venue_id = Number(rawId);

  if (!Number.isInteger(venue_id) || venue_id <= 0) {
    return { ok: false, error: 'That venue selection was not valid' };
  }

  return { ok: true, venue_id, venue_name: null };
}
