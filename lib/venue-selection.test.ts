import { describe, expect, it } from 'vitest';
import {
  isNewVenue,
  makeNewVenueValue,
  newVenueName,
  parseVenueSelection,
} from './venue-selection';

const form = (fields: Record<string, string>) => {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
};

describe('the new-venue value round trip', () => {
  it('survives a name being wrapped and unwrapped', () => {
    const value = makeNewVenueValue('The Unknown Arms');
    expect(isNewVenue(value)).toBe(true);
    expect(newVenueName(value)).toBe('The Unknown Arms');
  });

  it('does not mistake a plain venue id for a proposed name', () => {
    expect(isNewVenue('42')).toBe(false);
  });

  it('keeps a name that itself contains a colon intact', () => {
    const value = makeNewVenueValue("Nick's: The Bar");
    expect(newVenueName(value)).toBe("Nick's: The Bar");
  });
});

describe('parseVenueSelection', () => {
  it('accepts an existing venue id', () => {
    expect(parseVenueSelection(form({ venue_id: '42' }))).toEqual({
      ok: true,
      venue_id: 42,
      venue_name: null,
    });
  });

  it('accepts a proposed venue name with no id', () => {
    expect(
      parseVenueSelection(form({ venue_name: 'The Unknown Arms' }))
    ).toEqual({ ok: true, venue_id: null, venue_name: 'The Unknown Arms' });
  });

  it('trims a proposed name', () => {
    const result = parseVenueSelection(form({ venue_name: '  Tony’s Bar  ' }));
    expect(result).toEqual({
      ok: true,
      venue_id: null,
      venue_name: 'Tony’s Bar',
    });
  });

  // The DB check constraint allows only one to be meaningful; the id is the
  // one we trust, so a stale name must not be written alongside it.
  it('drops the name when a real id is also present', () => {
    expect(
      parseVenueSelection(form({ venue_id: '7', venue_name: 'Ignored' }))
    ).toEqual({ ok: true, venue_id: 7, venue_name: null });
  });

  it('rejects a submission naming no venue at all', () => {
    expect(parseVenueSelection(form({}))).toEqual({
      ok: false,
      error: 'Please choose or name a venue',
    });
  });

  // Mirrors `nullif(btrim(venue_name), '')` in the check constraint — a
  // whitespace-only name would otherwise pass the app and fail at the DB.
  it('rejects a whitespace-only name', () => {
    expect(parseVenueSelection(form({ venue_name: '   ' }))).toEqual({
      ok: false,
      error: 'Please choose or name a venue',
    });
  });

  it('treats a whitespace-only id as absent', () => {
    expect(
      parseVenueSelection(form({ venue_id: '  ', venue_name: 'The Pint' }))
    ).toEqual({ ok: true, venue_id: null, venue_name: 'The Pint' });
  });

  // If the `new:` value ever leaked into venue_id, Number() yields NaN. Better
  // a clear error than inserting null and tripping the constraint.
  it('rejects a non-numeric id', () => {
    expect(parseVenueSelection(form({ venue_id: 'new:The Unknown Arms' }))).toEqual(
      { ok: false, error: 'That venue selection was not valid' }
    );
  });

  it('rejects a non-integer id', () => {
    expect(parseVenueSelection(form({ venue_id: '1.5' }))).toEqual({
      ok: false,
      error: 'That venue selection was not valid',
    });
  });

  it.each(['0', '-3'])('rejects the out-of-range id %s', (id) => {
    expect(parseVenueSelection(form({ venue_id: id }))).toEqual({
      ok: false,
      error: 'That venue selection was not valid',
    });
  });
});
