const WEEKDAYS = new Set(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
const WEEKEND = new Set(['Saturday', 'Sunday']);
const EVERYDAY = new Set([...WEEKDAYS, ...WEEKEND]);

const isSetEqual = (a: Set<string>, b: Set<string>) =>
  a.size === b.size && [...a].every((day) => b.has(day));

export const dayformatter = (dayString: string | undefined | null) => {
  if (!dayString) return null;

  // D27 (docs/tech-debt-backlog.md): the submit form builds "when" with
  // `selectedDays.join(' ')` (app/events/route.ts), not a comma — so every
  // real event is space-separated. Splitting on either comma or whitespace,
  // and comparing the resulting set of day names rather than doing a
  // substring match against a hardcoded phrase, means both forms collapse
  // the same way instead of only the comma form (which no real event has
  // ever used) working.
  //
  // This also fixes a second, previously-pinned bug: the old code matched
  // "Weekdays" as a *substring* of the joined string, so a weekday run with
  // an extra trailing day (e.g. "...Thursday, Friday, Sunday") still read as
  // "Weekdays" and silently dropped the Sunday from what was displayed. Set
  // equality requires an exact match, so a run that isn't exactly one of the
  // three known combinations is left as-is instead of being mis-collapsed.
  //
  // The previous "only bother matching if longer than 10 characters" guard
  // is dropped rather than ported: every individual day name is 10
  // characters or shorter, and the shortest possible two-day combination
  // ("Friday Sunday", 13 chars) is always longer than that, so the guard
  // never actually changed which strings got collapsed — it was dead
  // weight, not a real behavioural quirk worth preserving.
  const days = new Set(
    dayString
      .split(/[\s,]+/)
      .map((day) => day.trim())
      .filter(Boolean)
  );

  if (days.size === 0) return dayString;

  if (isSetEqual(days, EVERYDAY)) return 'Everyday';
  if (isSetEqual(days, WEEKDAYS)) return 'Weekdays';
  if (isSetEqual(days, WEEKEND)) return 'Weekends';

  return dayString;
};
