import { format, formatDistanceToNow, isBefore, subHours } from "date-fns";

export function formatDateIntoRelativeTime(date: Date) {
  const oneDayAgo = subHours(new Date(), 24);

  if (isBefore(date, oneDayAgo)) {
    // If the date is more than 24 hours ago, show the formatted date
    return format(date, "MMM dd");
  }

  // Otherwise, show the relative time (e.g., "1h ago", "2h ago")
  return `${formatDistanceToNow(date)} ago`;
}

export function formatDate(date: Date) {
  return format(new Date(date), "hh:mm a - MMM d, yyyy");
}
