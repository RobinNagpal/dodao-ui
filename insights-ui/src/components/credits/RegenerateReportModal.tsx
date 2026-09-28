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
  status: ReportGenerationStatusResponse | undefined;
  statusLoading: boolean;
  generating: boolean;
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
  status,
  statusLoading,
  generating,
  onConfirm,
}: RegenerateReportModalProps): JSX.Element {
  const credits = status?.credits ?? 0;
  const canAfford = credits >= CREDITS_PER_REPORT;

  const body = (): JSX.Element => {
    // Never render a spend/buy decision off a balance we do not have yet — a
    // half-loaded modal would flash "you have 0 credits" at someone who has ten.
    if (!status) {
      return statusLoading ? (
        <LoadingSpinner />
      ) : (
        <Stack gap="md">
          <Text size="sm">We could not load your credit balance. Please close this and try again.</Text>
          <Button variant="contained" onClick={onClose}>
            Close
          </Button>
        </Stack>
      );
    }

    if (status.generationInProgress) {
      return (
        <Stack gap="md">
          <InlineCard padding="cozy">
            <Text size="sm">A new {reportLabel} report is already being made. It can take up to an hour. Refresh the page later to see it.</Text>
          </InlineCard>
          <Text size="xs" tone="muted">
            You have not been charged for this.
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
              Pick a pack below. After you pay, you will come right back here.
            </Text>
          </Stack>
          <BuyCreditsPanel layout="list" />
        </Stack>
      );
    }

    return (
      <Stack gap="lg">
        <Text size="sm">A fresh analysis of {reportLabel} will replace the current report. It can take up to an hour.</Text>

        <InlineCard padding="cozy">
          <Stack gap="xs">
            {[
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
            If the report fails, you get your credit back.
          </Text>
        </Stack>
      </Stack>
    );
  };

  return (
    <SingleSectionModal open={open} onClose={onClose} title={`Regenerate ${reportLabel} report`}>
      {body()}
    </SingleSectionModal>
  );
}
