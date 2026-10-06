import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { DODAO_ACCESS_TOKEN_KEY } from '@dodao/web-core/types/deprecated/models/enums';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

export type CreditApiResult<T> = { ok: true; data: T } | { ok: false; status: number; message: string | null };

/**
 * Plain authenticated call to a credits endpoint (`path` is relative to
 * `/api/{spaceId}/`), for the places where `useFetchData` / `usePostData` don't
 * fit: they show their own generic error toast, which is wrong for silent
 * retries (confirming a checkout) and hides the server's message (the
 * buying-is-switched-off error). Never throws; a failure comes back as
 * `{ ok: false }` with the server's `error` text when it sent one.
 */
export async function callCreditApi<T>(path: string, init: { method?: 'GET' | 'POST'; body?: unknown } = {}): Promise<CreditApiResult<T>> {
  try {
    const accessToken = localStorage.getItem(DODAO_ACCESS_TOKEN_KEY);
    const response = await fetch(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/${path}`, {
      method: init.method ?? 'GET',
      headers: { 'Content-Type': 'application/json', ...(accessToken ? { 'dodao-auth-token': accessToken } : {}) },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
    if (!response.ok) {
      let message: string | null = null;
      try {
        const body = (await response.json()) as { error?: unknown };
        message = typeof body.error === 'string' && body.error.trim() ? body.error : null;
      } catch {
        // No JSON body: keep the message null.
      }
      return { ok: false, status: response.status, message };
    }
    return { ok: true, data: (await response.json()) as T };
  } catch {
    return { ok: false, status: 0, message: null };
  }
}
