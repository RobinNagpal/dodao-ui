import { InsightsConstants } from '../insights-constants';

export function isAdmin(): boolean {
  if (typeof window === 'undefined') return false; // Avoid SSR issues
  return !!localStorage.getItem(InsightsConstants.AUTHENTICATION_KEY);
}
