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
   * BUG — pinned, not endorsed.
   *
   * The two branches above only match comma-separated strings, but the submit
   * form builds `when` with `selectedDays.join(' ')` (app/events/route.ts), so
   * every real value is space-separated. Confirmed against the 2025 backup:
   * of 76 events, every multi-day value used spaces and none used commas.
   *
   * So 'Weekdays' and 'Weekends' have never actually rendered in production —
   * only 'Everyday' works, because it is the one case with both a comma and a
   * space branch.
   *
   * Fix is to normalise separators before matching. These tests should flip to
   * the collapsed form when that happens.
   */
  describe('space-separated input (what the form actually submits)', () => {
    it('does NOT collapse the weekdays — falls through unchanged', () => {
      expect(dayformatter('Monday Tuesday Wednesday Thursday Friday')).toBe(
        'Monday Tuesday Wednesday Thursday Friday'
      );
    });

    it('does NOT collapse the weekend — falls through unchanged', () => {
      expect(dayformatter('Saturday Sunday')).toBe('Saturday Sunday');
    });
  });

  it('passes a combination it has no name for straight through', () => {
    expect(dayformatter('Monday, Wednesday, Friday')).toBe(
      'Monday, Wednesday, Friday'
    );
  });

  describe('the 10-character shortcut', () => {
    // Anything <= 10 chars skips the matching entirely.
    it.each(['Monday', 'Tuesday', 'Saturday', 'Wednesday'])(
      'returns the single day %s unchanged',
      (day) => {
        expect(dayformatter(day)).toBe(day);
      }
    );

    // 'Wednesday' is exactly 9 characters, so it takes the short path. Any
    // value over 10 characters goes through the matching branches instead.
    it('sends a value longer than 10 characters down the matching path', () => {
      expect(dayformatter('Tuesday Sunday')).toBe('Tuesday Sunday');
    });
  });

  // Known quirk worth pinning: the weekday branch is a substring test, so a
  // full week written with commas is caught by the earlier 'Everyday' branch,
  // but a weekday run with anything appended still reads as 'Weekdays'.
  it('treats a weekday run with a trailing day as Weekdays', () => {
    expect(
      dayformatter('Monday, Tuesday, Wednesday, Thursday, Friday, Sunday')
    ).toBe('Weekdays');
  });
});
