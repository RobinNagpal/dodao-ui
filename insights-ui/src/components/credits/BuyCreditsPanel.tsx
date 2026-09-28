'use client';

import MetricGrid from '@/components/ui/containers/MetricGrid';
import Stack from '@/components/ui/containers/Stack';
import CheckoutBar from '@/components/ui/credits/CheckoutBar';
import CreditPackOption from '@/components/ui/credits/CreditPackOption';
import { CREDIT_PACKS, CreateCheckoutSessionRequest, CreateCheckoutSessionResponse } from '@/types/credits';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { formatPackDetail, formatUsd } from '@/utils/credits/credit-format';
import { getCurrentReturnPath } from '@/utils/credits/credit-return-path';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useState } from 'react';

export interface BuyCreditsPanelProps {
  /** `grid` on the roomy credits page, `list` inside the narrow modal. */
  layout?: 'grid' | 'list';
}

const DEFAULT_PACK_KEY = CREDIT_PACKS.find((pack) => pack.recommended)?.key ?? CREDIT_PACKS[0].key;

/**
 * Credit pack picker. Shared by the credits page and the regenerate modal, so
 * the prices a user sees are identical wherever they decide to buy.
 */
export default function BuyCreditsPanel({ layout = 'grid' }: BuyCreditsPanelProps): JSX.Element {
  const [selectedPackKey, setSelectedPackKey] = useState<string>(DEFAULT_PACK_KEY);
  const [redirecting, setRedirecting] = useState(false);

  const { postData: createCheckoutSession, loading } = usePostData<CreateCheckoutSessionResponse, CreateCheckoutSessionRequest>({
    errorMessage: 'Could not start checkout. Please try again.',
  });

  const selectedPack = CREDIT_PACKS.find((pack) => pack.key === selectedPackKey) ?? CREDIT_PACKS[0];
  const busy = loading || redirecting;

  const handleCheckout = async () => {
    const response = await createCheckoutSession(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/credits/checkout-session`, {
      packKey: selectedPack.key,
      // Resolved at click time so Stripe returns the user to exactly the page
      // and query they were reading when they decided to buy.
      returnPath: getCurrentReturnPath(),
    });

    if (response?.checkoutUrl) {
      // Hold the loading state through the redirect — the page is about to be
      // replaced, and a button springing back to "Pay" mid-navigation reads as
      // a failure.
      setRedirecting(true);
      window.location.href = response.checkoutUrl;
    }
  };

  const options = CREDIT_PACKS.map((pack) => (
    <CreditPackOption
      key={pack.key}
      layout={layout === 'grid' ? 'tile' : 'row'}
      credits={pack.credits}
      price={formatUsd(pack.amountInCents)}
      detail={formatPackDetail(pack.credits)}
      selected={pack.key === selectedPack.key}
      recommended={pack.recommended}
      disabled={busy}
      onSelect={() => setSelectedPackKey(pack.key)}
    />
  ));

  return (
    <Stack gap="lg">
      {layout === 'grid' ? (
        <MetricGrid columns="2-4" gap="md">
          {options}
        </MetricGrid>
      ) : (
        <Stack gap="sm">{options}</Stack>
      )}

      <CheckoutBar
        layout={layout === 'grid' ? 'inline' : 'stacked'}
        note="Payments are handled by Stripe, so we never see your card details. If a report fails, you get your credit back."
        action={
          <Button primary variant="contained" loading={busy} disabled={busy} onClick={handleCheckout}>
            {busy ? 'Opening secure checkout…' : `Buy ${selectedPack.credits} credits for ${formatUsd(selectedPack.amountInCents)}`}
          </Button>
        }
      />
    </Stack>
  );
}
