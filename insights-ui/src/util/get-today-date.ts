export function getTodayDateAsMonthDDYYYYFormat(): string {
  return new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}
