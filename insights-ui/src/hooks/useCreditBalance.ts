import { CreditBalanceSummaryResponse } from '@/types/credits';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { CREDITS_CHANGED_EVENT } from '@/utils/credits/credit-return-path';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useEffect } from 'react';

/**
 * The signed-in user's credit balance, or `undefined` until it has loaded (or
 * when `enabled` is false). Fetched once, then re-read only when this tab
 * reports a change via `notifyCreditsChanged()`, so client-side navigation
 * between report pages does not refetch it.
 */
export function useCreditBalance(enabled: boolean): number | undefined {
  const { data, reFetchData } = useFetchData<CreditBalanceSummaryResponse>(
    `${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/credits/balance`,
    { skipInitialFetch: !enabled },
    'Failed to load your credits'
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const refresh = () => void reFetchData();
    window.addEventListener(CREDITS_CHANGED_EVENT, refresh);
    return () => window.removeEventListener(CREDITS_CHANGED_EVENT, refresh);
  }, [enabled, reFetchData]);

  return enabled ? data?.credits : undefined;
}
