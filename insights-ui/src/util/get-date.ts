export function getTodayDateAsMonthDDYYYYFormat(): string {
  return new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function getDateAsMonthDDYYYYFormat(dateInput: Date | string | number): string {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${dateInput}`);
  }
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getDateAsDDMonthYYYYFormat(dateString: string): string {
  const [year, month, day] = dateString.split('-');

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthIndex = parseInt(month, 10) - 1;
  const dd = day.padStart(2, '0'); // ensure two digits

  return `${dd} ${monthNames[monthIndex]}, ${year}`;
}

export function getTimeAgo(input: string | Date): string {
  const date = typeof input === 'string' ? new Date(input) : input;
  const now = new Date();

  // difference in seconds: positive if date is in future
  const diffSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);

  // absolute value for interval calculations
  const seconds = Math.abs(diffSeconds);

  // threshold for “just now” / “in a few seconds”
  if (seconds < 5) {
    return diffSeconds >= 0 ? 'in a few seconds' : 'just now';
  }

  const intervals: Array<[number, string]> = [
    [31536000, 'year'], // 60 * 60 * 24 * 365
    [2592000, 'month'], // 60 * 60 * 24 * 30
    [604800, 'week'], // 60 * 60 * 24 * 7
    [86400, 'day'], // 60 * 60 * 24
    [3600, 'hour'], // 60 * 60
    [60, 'minute'],
    [1, 'second'],
  ];

  for (const [intervalSeconds, intervalName] of intervals) {
    const count = Math.floor(seconds / intervalSeconds);
    if (count >= 1) {
      const plural = count > 1 ? 's' : '';
      if (diffSeconds > 0) {
        return `in ${count} ${intervalName}${plural}`;
      } else {
        return `${count} ${intervalName}${plural} ago`;
      }
    }
  }

  return diffSeconds > 0 ? 'in a few seconds' : 'just now';
}
