export const dayformatter = (dayString: string | undefined | null) => {
  if (!dayString || dayString === undefined) return null;

  // If this string contains more chars than just a single day of the week, then we need to format it.
  if (dayString.length > 10) {
    if (
      dayString.includes(
        'Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday'
      )
    ) {
      return 'Everyday';
    } else if (
      dayString.includes(
        'Monday Tuesday Wednesday Thursday Friday Saturday Sunday'
      )
    ) {
      return 'Everyday';
    } else if (
      dayString.includes('Monday, Tuesday, Wednesday, Thursday, Friday')
    ) {
      return 'Weekdays';
    } else if (dayString.includes('Saturday, Sunday')) {
      return 'Weekends';
    } else {
      return dayString;
    }
  } else {
    return dayString;
  }
};
