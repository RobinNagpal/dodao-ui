import { InsightsConstants } from '../insights-constants';

export function isAdmin(): boolean {
  return !!localStorage.getItem(InsightsConstants.AUTHENTICATION_KEY);
}
