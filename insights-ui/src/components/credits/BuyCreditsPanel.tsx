'use client';

import MetricGrid from '@/components/ui/containers/MetricGrid';
import Stack from '@/components/ui/containers/Stack';
import CheckoutBar from '@/components/ui/credits/CheckoutBar';
import CreditPackOption from '@/components/ui/credits/CreditPackOption';
import { CREDIT_PACKS, CreateCheckoutSessionRequest, CreateCheckoutSessionResponse } from '@/types/credits';
import { loadPurchasesEnabled, usePurchasesEnabled } from '@/hooks/usePurchasesEnabled';
import { callCreditApi } from '@/utils/credits/credit-api-client';
import { formatPackDetail, formatUsd } from '@/utils/credits/credit-format';
import { getCurrentReturnPath } from '@/utils/credits/credit-return-path';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { useState } from 'react';

export interface BuyCreditsPanelProps {
  /** `grid` on the roomy credits page, `list` inside the narrow modal. */
  layout?: 'grid' | 'list';
}

const KILL_SWITCH_MESSAGE = 'Buying credits is temporarily unavailable. Please try again later.';

const DEFAULT_PACK_KEY = CREDIT_PACKS.find((pack) => pack.recommended)?.key ?? CREDIT_PACKS[0].key;

/**
 * Credit pack picker. Shared by the credits page and the regenerate modal, so
 * the prices a user sees are identical wherever they decide to buy.
 */
export default function BuyCreditsPanel({ layout = 'grid' }: BuyCreditsPanelProps): JSX.Element {
  const [selectedPackKey, setSelectedPackKey] = useState<string>(DEFAULT_PACK_KEY);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const { showNotification } = useNotificationContext();
  // null while loading. Admins can switch buying off (e.g. during a Stripe
  // issue); the checkout API enforces the same switch server-side.
  const loadedPurchasesEnabled = usePurchasesEnabled();
  // Set when checkout was refused because the switch flipped after the page loaded.
  const [switchedOff, setSwitchedOff] = useState(false);
  const purchasesEnabled = switchedOff ? false : loadedPurchasesEnabled;

  const selectedPack = CREDIT_PACKS.find((pack) => pack.key === selectedPackKey) ?? CREDIT_PACKS[0];
  const busy = loading || redirecting;

  const handleCheckout = async () => {
    setLoading(true);
    const result = await callCreditApi<CreateCheckoutSessionResponse>('users/credits/checkout-session', {
      method: 'POST',
      body: {
        packKey: selectedPack.key,
        // Resolved at click time so Stripe returns the user to exactly the page
        // and query they were reading when they decided to buy.
        returnPath: getCurrentReturnPath(),
      } satisfies CreateCheckoutSessionRequest,
    });

    if (result.ok && result.data.checkoutUrl) {
      // Hold the loading state through the redirect — the page is about to be
      // replaced, and a button springing back to "Pay" mid-navigation reads as
      // a failure.
      setRedirecting(true);
      window.location.href = result.data.checkoutUrl;
      return;
    }
    setLoading(false);

    // Most likely cause of a refusal: an admin switched buying off since the
    // page loaded. Say exactly that (the server's own wording) instead of a
    // generic error, and disable the button.
    if (!(await loadPurchasesEnabled(true))) {
      setSwitchedOff(true);
      showNotification({ type: 'error', message: !result.ok && result.message ? result.message : KILL_SWITCH_MESSAGE });
      return;
    }
    showNotification({ type: 'error', message: 'Could not start checkout. Please try again.' });
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
        note="Payments are handled by Stripe, so we never see your card details. If a report fails, you aren't charged."
        action={
          <Button primary variant="contained" loading={busy} disabled={busy || !purchasesEnabled} onClick={handleCheckout}>
            {busy
              ? 'Opening secure checkout…'
              : purchasesEnabled === false
              ? 'Buying credits is temporarily disabled'
              : `Buy ${selectedPack.credits} credits for ${formatUsd(selectedPack.amountInCents)}`}
          </Button>
        }
      />
    </Stack>
  );
}
