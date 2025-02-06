import { InsightsConstants } from '../insights-constants';

export function getAuthKey(): string {
  return localStorage.getItem(InsightsConstants.AUTHENTICATION_KEY) ?? '';
}

export function setAuthKey(key: string) {
  localStorage.setItem(InsightsConstants.AUTHENTICATION_KEY, key);
}
