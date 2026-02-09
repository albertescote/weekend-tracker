import { nextFriday, isFriday, startOfDay } from 'date-fns';

export function getUpcomingFriday() {
  const now = new Date();
  if (isFriday(now)) {
    return startOfDay(now);
  }
  return nextFriday(now);
}

export function formatDbDate(date: Date) {
  return date.toISOString().split('T')[0];
}
