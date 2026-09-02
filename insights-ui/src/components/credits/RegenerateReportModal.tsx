'use client';

import BuyCreditsPanel from '@/components/credits/BuyCreditsPanel';
import Stack from '@/components/ui/containers/Stack';
import InlineCard from '@/components/ui/sections/InlineCard';
import Text from '@/components/ui/Text';
import { CREDITS_PER_REPORT, ReportGenerationStatusResponse } from '@/types/credits';
import { formatCredits, formatReportGeneratedDate } from '@/utils/credits/credit-format';
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
  const generatedAt = formatReportGeneratedDate(status?.lastReportGeneratedAt);
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
            <Text size="sm">A new {reportLabel} report is already being generated. It usually takes a few minutes, and this page updates on its own.</Text>
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
              Pick a pack below — you will come straight back here once payment goes through.
            </Text>
          </Stack>
          <BuyCreditsPanel layout="list" />
        </Stack>
      );
    }

    return (
      <Stack gap="lg">
        <Stack gap="xs">
          <Text size="sm">This runs a fresh analysis of {reportLabel} and replaces every section of the report. It usually takes a few minutes.</Text>
          {generatedAt && (
            <Text size="xs" tone="muted">
              Current report was generated on {generatedAt}.
            </Text>
          )}
        </Stack>

        <InlineCard padding="cozy">
          <Stack direction="row" justify="between" align="center" gap="md">
            <Text size="sm">Cost</Text>
            <Text size="sm" weight="semibold">
              {formatCredits(CREDITS_PER_REPORT)}
            </Text>
          </Stack>
          <Stack direction="row" justify="between" align="center" gap="md">
            <Text size="xs" tone="muted">
              Balance after
            </Text>
            <Text size="xs" tone="muted">
              {formatCredits(credits - CREDITS_PER_REPORT)}
            </Text>
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
            If the report fails to generate, the credit is returned automatically.
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
