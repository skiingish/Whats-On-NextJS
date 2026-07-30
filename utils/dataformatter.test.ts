import { describe, expect, it } from 'vitest';
import { dayformatter } from './dataformatter';

/**
 * Characterisation tests: these lock in what dayformatter does today, quirks
 * included, so the 2026 refresh can't change how existing events read.
 */
describe('dayformatter', () => {
  it.each([null, undefined, ''])('returns null for %p', (input) => {
    expect(dayformatter(input)).toBeNull();
  });

  describe('collapsing a full week', () => {
    it('collapses the comma-separated form', () => {
      expect(
        dayformatter(
          'Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday'
        )
      ).toBe('Everyday');
    });

    // This is the form the app actually produces — app/events/route.ts joins
    // the checked days with a space, not a comma.
    it('collapses the space-separated form the submit form produces', () => {
      expect(
        dayformatter(
          'Monday Tuesday Wednesday Thursday Friday Saturday Sunday'
        )
      ).toBe('Everyday');
    });
  });

  it('collapses the five weekdays', () => {
    expect(
      dayformatter('Monday, Tuesday, Wednesday, Thursday, Friday')
    ).toBe('Weekdays');
  });

  it('collapses the weekend', () => {
    expect(dayformatter('Saturday, Sunday')).toBe('Weekends');
  });

  /**
   * D27, fixed: dayformatter now splits on comma OR whitespace and compares
   * the resulting set of day names, instead of substring-matching a
   * hardcoded comma-joined phrase. The submit form has only ever produced
   * space-separated values (`selectedDays.join(' ')` in
   * app/events/route.ts) — confirmed against the 2025 backup, where all 76
   * events used spaces and none used commas — so these two branches used to
   * never fire in production. They now collapse the same as the
   * comma-separated form above.
   */
  describe('space-separated input (what the form actually submits)', () => {
    it('collapses the weekdays', () => {
      expect(dayformatter('Monday Tuesday Wednesday Thursday Friday')).toBe(
        'Weekdays'
      );
    });

    it('collapses the weekend', () => {
      expect(dayformatter('Saturday Sunday')).toBe('Weekends');
    });
  });

  it('passes a combination it has no name for straight through', () => {
    expect(dayformatter('Monday, Wednesday, Friday')).toBe(
      'Monday, Wednesday, Friday'
    );
  });

  describe('single-day and short values', () => {
    // Every single day name passes straight through unchanged: a set of one
    // day never equals the weekday, weekend, or every-day sets. (The old
    // implementation short-circuited on string length <= 10 to reach the
    // same result; that check was removed as dead weight — see the comment
    // in dataformatter.ts — but the observable output here is identical.)
    it.each(['Monday', 'Tuesday', 'Saturday', 'Wednesday'])(
      'returns the single day %s unchanged',
      (day) => {
        expect(dayformatter(day)).toBe(day);
      }
    );

    it('passes an unnamed two-day combination through unchanged', () => {
      expect(dayformatter('Tuesday Sunday')).toBe('Tuesday Sunday');
    });
  });

  // D27, fixed: this used to be a pinned quirk — the old "Weekdays" check was
  // a substring match, so a full weekday run with an extra day tacked on
  // (here, a trailing Sunday) still matched and silently dropped that extra
  // day from what was displayed. Set equality requires an exact match, so a
  // six-day combination with no name of its own is now left unchanged
  // instead of being mis-reported as "Weekdays".
  it('leaves a weekday run with a trailing day unchanged (not mis-reported as Weekdays)', () => {
    expect(
      dayformatter('Monday, Tuesday, Wednesday, Thursday, Friday, Sunday')
    ).toBe('Monday, Tuesday, Wednesday, Thursday, Friday, Sunday');
  });
});
