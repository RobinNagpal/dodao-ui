import { formatCurrency } from '@/components/reportsv1/financialFormatters';
import Heading from '@/components/ui/Heading';
import StatusBadge from '@/components/ui/StatusBadge';
import Text from '@/components/ui/Text';
import MetricGrid from '@/components/ui/containers/MetricGrid';
import Stack from '@/components/ui/containers/Stack';
import MetricCell from '@/components/ui/MetricCell';
import InlineCard from '@/components/ui/sections/InlineCard';
import MarkdownContent from '@/components/ui/sections/MarkdownContent';
import { MarketDropScenario } from '@/types/public-equity/analysis-factors-types';
import { parseMarkdown } from '@/util/parse-markdown';
import React from 'react';

export interface StabilityScenarioCardProps {
  scenario: MarketDropScenario;
  /** Company name, used in the "impact on the company" heading. */
  companyName: string;
  /** Sub-industry (or industry) name, used in the "impact on the sector" heading. */
  sectorName: string;
  /** Price the expected price was derived from. */
  referencePrice: number | null;
  currency: string | null;
}

/**
 * Relative-to-the-market tone: a stock that gives up materially LESS than the
 * market in this scenario reads as a positive; materially more as a negative.
 * The 2-point band keeps "roughly in line with the market" neutral.
 */
function toneForDrop(dropPercent: number, marketDropPercent: number): 'success' | 'warning' | 'danger' | 'info' {
  const delta = dropPercent - marketDropPercent;
  if (delta <= -2) return 'success';
  if (delta >= 5) return 'danger';
  if (delta >= 2) return 'warning';
  return 'info';
}

function formatDrop(dropPercent: number): string {
  // A negative "drop" means the sector/stock is expected to rise in the sell-off.
  return dropPercent >= 0 ? `-${dropPercent.toFixed(1)}%` : `+${Math.abs(dropPercent).toFixed(1)}%`;
}

/**
 * One market-drop scenario of the stability report: the headline numbers
 * (expected price, expected stock drop, expected sector drop) plus the
 * sector-level and company-level explanation behind them.
 */
export default function StabilityScenarioCard({ scenario, companyName, sectorName, referencePrice, currency }: StabilityScenarioCardProps): React.JSX.Element {
  const stockTone = toneForDrop(scenario.expectedStockDropPercent, scenario.marketDropPercent);
  const sectorTone = toneForDrop(scenario.expectedSectorDropPercent, scenario.marketDropPercent);

  return (
    <InlineCard as="li" padding="roomy">
      <Stack gap="md">
        <Stack direction="row" align="center" justify="between" gap="sm" wrap>
          <Heading as="h3" size="lg" weight="semibold">
            If the market drops {scenario.marketDropPercent}%
          </Heading>
          <StatusBadge variant={stockTone} label={`${companyName}: ${formatDrop(scenario.expectedStockDropPercent)}`} />
        </Stack>

        <MetricGrid columns="3" gap="sm">
          <MetricCell label="Expected price" value={formatCurrency(scenario.expectedPrice, currency)} sentiment="negative" />
          <MetricCell label="Expected stock drop" value={formatDrop(scenario.expectedStockDropPercent)} />
          <MetricCell label="Expected sector drop" value={formatDrop(scenario.expectedSectorDropPercent)} />
        </MetricGrid>

        {referencePrice !== null && (
          <Text size="xs" tone="muted">
            From a current price of {formatCurrency(referencePrice, currency)}.
          </Text>
        )}

        <Stack gap="sm">
          <Stack direction="row" align="center" gap="sm" wrap>
            <Heading as="h4" size="sm" weight="semibold" tone="muted">
              Impact on {sectorName}
            </Heading>
            <StatusBadge variant={sectorTone} size="sm" label={formatDrop(scenario.expectedSectorDropPercent)} />
          </Stack>
          <MarkdownContent variant="plain" html={parseMarkdown(scenario.sectorImpact)} />
        </Stack>

        <Stack gap="sm">
          <Heading as="h4" size="sm" weight="semibold" tone="muted">
            Impact on {companyName}
          </Heading>
          <MarkdownContent variant="plain" html={parseMarkdown(scenario.companyImpact)} />
        </Stack>
      </Stack>
    </InlineCard>
  );
}
