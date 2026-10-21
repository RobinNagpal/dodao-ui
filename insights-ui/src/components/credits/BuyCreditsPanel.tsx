'use client';

import MetricGrid from '@/components/ui/containers/MetricGrid';
import Stack from '@/components/ui/containers/Stack';
import CheckoutBar from '@/components/ui/credits/CheckoutBar';
import CreditPackOption from '@/components/ui/credits/CreditPackOption';
import NoticeCallout from '@/components/ui/NoticeCallout';
import Text from '@/components/ui/Text';
import {
  CREDIT_PACKS,
  CreateCheckoutSessionRequest,
  CreateCheckoutSessionResponse,
  CreditPack,
  CreditPurchaseInterestSource,
  RecordCreditPurchaseInterestRequest,
  RecordCreditPurchaseInterestResponse,
} from '@/types/credits';
import { loadPurchasesEnabled, usePurchasesEnabled } from '@/hooks/usePurchasesEnabled';
import { callCreditApi } from '@/utils/credits/credit-api-client';
import { formatPackDetail, formatUsd } from '@/utils/credits/credit-format';
import { getCurrentReturnPath } from '@/utils/credits/credit-return-path';
import Button from '@dodao/web-core/components/core/buttons/Button';
import SingleSectionModal from '@dodao/web-core/components/core/modals/SingleSectionModal';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { useState } from 'react';

export interface BuyCreditsPanelProps {
  /** `grid` on the roomy credits page, `list` inside the narrow modal. */
  layout?: 'grid' | 'list';
  /** Where the panel is shown; recorded with a click made while buying is switched off. */
  source?: CreditPurchaseInterestSource;
}

const DEFAULT_PACK_KEY = CREDIT_PACKS.find((pack) => pack.recommended)?.key ?? CREDIT_PACKS[0].key;

/**
 * Credit pack picker. Shared by the credits page and the regenerate modal, so
 * the prices a user sees are identical wherever they decide to buy.
 *
 * While an admin has buying switched off, the picker and button stay usable: a
 * click records which pack the user wanted (admin → Credit Purchase Interest)
 * and explains in a modal that buying is paused.
 */
export default function BuyCreditsPanel({ layout = 'grid', source = 'credits-page' }: BuyCreditsPanelProps): JSX.Element {
  const [selectedPackKey, setSelectedPackKey] = useState<string>(DEFAULT_PACK_KEY);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  // The pack a user tried to buy while buying was off; drives the "paused" modal.
  const [pausedPack, setPausedPack] = useState<CreditPack | null>(null);
  const { showNotification } = useNotificationContext();
  // null while loading. Admins can switch buying off (e.g. during a Stripe
  // issue); the checkout API enforces the same switch server-side.
  const loadedPurchasesEnabled = usePurchasesEnabled();
  // Set when checkout was refused because the switch flipped after the page loaded.
  const [switchedOff, setSwitchedOff] = useState(false);
  const purchasesEnabled = switchedOff ? false : loadedPurchasesEnabled;

  const selectedPack = CREDIT_PACKS.find((pack) => pack.key === selectedPackKey) ?? CREDIT_PACKS[0];
  const busy = loading || redirecting;

  const recordInterest = async (pack: CreditPack): Promise<RecordCreditPurchaseInterestResponse | null> => {
    const result = await callCreditApi<RecordCreditPurchaseInterestResponse>('users/credits/purchase-interest', {
      method: 'POST',
      body: { packKey: pack.key, source, pagePath: getCurrentReturnPath() } satisfies RecordCreditPurchaseInterestRequest,
    });
    return result.ok ? result.data : null;
  };

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

    // Most likely cause of a refusal: an admin switched buying off since the
    // page loaded. Treat it like any click while buying is off.
    if (!(await loadPurchasesEnabled(true))) {
      setSwitchedOff(true);
      await recordInterest(selectedPack);
      setLoading(false);
      setPausedPack(selectedPack);
      return;
    }
    setLoading(false);
    showNotification({ type: 'error', message: 'Could not start checkout. Please try again.' });
  };

  const handlePausedClick = async () => {
    setLoading(true);
    const recorded = await recordInterest(selectedPack);
    // The server checks the switch itself. If it says buying is on (our cached
    // "off" was stale or a failed read), go straight to checkout instead.
    if (recorded && !recorded.recorded) {
      await handleCheckout();
      return;
    }
    setLoading(false);
    setPausedPack(selectedPack);
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

  const paused = purchasesEnabled === false;

  return (
    <Stack gap="lg">
      {paused && (
        <NoticeCallout tone="warning">Buying credits is temporarily paused. Pick the pack you&apos;d like and we&apos;ll note your interest.</NoticeCallout>
      )}

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
          <Button primary variant="contained" loading={busy} disabled={busy || purchasesEnabled === null} onClick={paused ? handlePausedClick : handleCheckout}>
            {busy && !paused ? 'Opening secure checkout…' : `Buy ${selectedPack.credits} credits for ${formatUsd(selectedPack.amountInCents)}`}
          </Button>
        }
      />

      <SingleSectionModal open={pausedPack !== null} onClose={() => setPausedPack(null)} title="Buying credits is paused">
        <Stack gap="md">
          <Text size="sm">We&apos;ve paused credit purchases for now, so you haven&apos;t been charged.</Text>
          {pausedPack && (
            <Text size="sm" tone="muted">
              Thanks for your interest. We&apos;ve noted that you wanted the {pausedPack.credits}-credit pack ({formatUsd(pausedPack.amountInCents)}). It helps
              us decide when to turn buying back on.
            </Text>
          )}
          <Button variant="contained" onClick={() => setPausedPack(null)}>
            Got it
          </Button>
        </Stack>
      </SingleSectionModal>
    </Stack>
  );
}
