'use client';

import BuyCreditsPanel from '@/components/credits/BuyCreditsPanel';
import Stack from '@/components/ui/containers/Stack';
import InlineCard from '@/components/ui/sections/InlineCard';
import Text from '@/components/ui/Text';
import { CREDITS_PER_REPORT, ReportGenerationStatusResponse } from '@/types/credits';
import { formatCredits } from '@/utils/credits/credit-format';
import Button from '@dodao/web-core/components/core/buttons/Button';
import SingleSectionModal from '@dodao/web-core/components/core/modals/SingleSectionModal';
import LoadingSpinner from '@dodao/web-core/components/core/loaders/LoadingSpinner';

export interface RegenerateReportModalProps {
  open: boolean;
  onClose: () => void;
  /** "AAPL" / "SPY" — what the user is about to spend a credit on. */
  reportLabel: string;
  /** "September 2, 2026", or null when never generated. */
  generatedAt: string | null;
  status: ReportGenerationStatusResponse | undefined;
  statusLoading: boolean;
  generating: boolean;
  /** True while a just-finished Stripe checkout is being confirmed. */
  addingCredits?: boolean;
  /** The admin buying switch; `null` while unknown (the pack picker then checks it itself). */
  purchasesEnabled?: boolean | null;
  /** One-line notice above the body, e.g. after the balance changed under a spend. */
  notice?: string | null;
  onConfirm: () => void;
}

/**
 * The one decision point of the credit flow: confirm the spend, or top up
 * without leaving the report. Buying happens inline rather than on a separate
 * page so a user who runs out of credits mid-thought is two clicks from a
 * regenerated report instead of navigating away and back.
 */
export default function RegenerateReportModal({
  open,
  onClose,
  reportLabel,
  generatedAt,
  status,
  statusLoading,
  generating,
  addingCredits = false,
  purchasesEnabled = null,
  notice = null,
  onConfirm,
}: RegenerateReportModalProps): JSX.Element {
  const credits = status?.credits ?? 0;
  const canAfford = credits >= CREDITS_PER_REPORT;

  const closeOnly = (message: string): JSX.Element => (
    <Stack gap="md">
      <Text size="sm">{message}</Text>
      <Button variant="contained" onClick={onClose}>
        Close
      </Button>
    </Stack>
  );

  const body = (): JSX.Element => {
    // Back from Stripe: the purchase is still being confirmed, so any balance
    // shown now could be the old one.
    if (addingCredits) {
      return (
        <Stack gap="md" align="center">
          <LoadingSpinner />
          <Text size="sm">Adding your credits…</Text>
        </Stack>
      );
    }

    // Never render a spend/buy decision off a balance we do not have yet — a
    // half-loaded modal would flash "you have 0 credits" at someone who has ten.
    if (!status) {
      return statusLoading ? <LoadingSpinner /> : closeOnly('We could not load your credit balance. Please close this and try again.');
    }

    // Stripe holds the balance; when it can't be reached the 0 we got is a
    // placeholder, and offering packs off it would be wrong.
    if (status.stripeUnavailable) {
      return closeOnly("We couldn't load your balance right now. Please try again in a few minutes.");
    }

    if (status.generationInProgress) {
      return (
        <Stack gap="md">
          <InlineCard padding="cozy">
            <Text size="sm">Your new {reportLabel} report is already being made. It can take up to an hour. Refresh the page later to see it.</Text>
          </InlineCard>
          <Text size="xs" tone="muted">
            You won&apos;t be charged again.
          </Text>
          <Button variant="contained" onClick={onClose}>
            Got it
          </Button>
        </Stack>
      );
    }

    if (!canAfford) {
      return (
        <Stack gap="lg">
          <Stack gap="xs">
            <Text size="sm">
              Regenerating the {reportLabel} report costs {formatCredits(CREDITS_PER_REPORT)}. You have {formatCredits(credits)}.
            </Text>
            <Text size="xs" tone="muted">
              {purchasesEnabled === false ? "Buying credits isn't available right now." : 'Pick a pack below. After you pay, you will come right back here.'}
            </Text>
          </Stack>
          {purchasesEnabled === false ? (
            <Button variant="contained" onClick={onClose}>
              Close
            </Button>
          ) : (
            <BuyCreditsPanel layout="list" />
          )}
        </Stack>
      );
    }

    return (
      <Stack gap="lg">
        <Stack gap="xs">
          <Text size="sm">A fresh analysis of {reportLabel} will replace the current report. It can take up to an hour.</Text>
          <Text size="xs" tone="muted">
            Refreshes all sections of the report.
          </Text>
        </Stack>

        <InlineCard padding="cozy">
          <Stack gap="xs">
            {[
              ['Current report', generatedAt ?? 'Not generated yet'],
              ['Your balance', formatCredits(credits)],
              ['Cost', formatCredits(CREDITS_PER_REPORT)],
              ['Balance after', formatCredits(credits - CREDITS_PER_REPORT)],
            ].map(([label, value]) => (
              <Stack key={label} direction="row" justify="between" align="center" gap="md">
                <Text size="sm" tone="muted">
                  {label}
                </Text>
                <Text size="sm" weight="semibold">
                  {value}
                </Text>
              </Stack>
            ))}
          </Stack>
        </InlineCard>

        <Stack gap="sm">
          <Button primary variant="contained" loading={generating} disabled={generating} onClick={onConfirm}>
            {generating ? 'Starting…' : `Regenerate for ${formatCredits(CREDITS_PER_REPORT)}`}
          </Button>
          <Button variant="text" disabled={generating} onClick={onClose}>
            Cancel
          </Button>
          <Text size="xs" tone="muted">
            If the report fails, you won&apos;t be charged.
          </Text>
        </Stack>
      </Stack>
    );
  };

  return (
    <SingleSectionModal open={open} onClose={onClose} title={`Regenerate ${reportLabel} report`}>
      <Stack gap="md">
        {notice && !addingCredits && (
          <InlineCard padding="cozy">
            <Text size="sm">{notice}</Text>
          </InlineCard>
        )}
        {body()}
      </Stack>
    </SingleSectionModal>
  );
}
