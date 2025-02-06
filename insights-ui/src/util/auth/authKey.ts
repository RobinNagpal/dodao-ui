import { InsightsConstants } from '../insights-constants';

export function getAuthKey(): string {
  if (typeof window === 'undefined') return ''; // Prevent errors during SSR
  return localStorage.getItem(InsightsConstants.AUTHENTICATION_KEY) ?? '';
}

export function setAuthKey(key: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(InsightsConstants.AUTHENTICATION_KEY, key);
  }
}

