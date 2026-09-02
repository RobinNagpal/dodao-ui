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
import { formatDrop, formatPriceAsOf } from '@/utils/stability-report-utils';
import { parseMarkdown } from '@/util/parse-markdown';
import React from 'react';

export interface StabilityScenarioCardProps {
  scenario: MarketDropScenario;
  /** Company name, used in the "impact on the company" heading. */
  companyName: string;
  /** Industry name, used in the "impact on the industry" heading. */
  industryName: string;
  /** Sub-industry name, shown alongside the industry when the two differ. */
  subIndustryName?: string | null;
  /** Price the expected price was derived from, and when it was captured. */
  referencePrice: number | null;
  referencePriceAsOf: string | Date | null;
  currency: string | null;
}

/**
 * Relative-to-the-market tone: a stock that gives up materially LESS than the
 * market in this scenario reads as a positive; materially more as a negative.
 * The bands scale with the scenario so a `-30%` market drop isn't flagged red
 * for the same absolute gap that is meaningful at `-5%`.
 */
function toneForDrop(dropPercent: number, marketDropPercent: number): 'success' | 'warning' | 'danger' | 'info' {
  const delta = dropPercent - marketDropPercent;
  const band = Math.max(2, marketDropPercent * 0.2);
  if (delta <= -band) return 'success';
  if (delta >= band * 2) return 'danger';
  if (delta >= band) return 'warning';
  return 'info';
}

/**
 * One market-drop scenario of the long report: the headline numbers (expected
 * price, expected stock drop, expected industry drop) followed by the two
 * paragraphs the report is built around — the first on the industry and
 * sub-industry, the second on this company.
 */
export default function StabilityScenarioCard({
  scenario,
  companyName,
  industryName,
  subIndustryName,
  referencePrice,
  referencePriceAsOf,
  currency,
}: StabilityScenarioCardProps): React.JSX.Element {
  const stockTone = toneForDrop(scenario.expectedStockDropPercent, scenario.marketDropPercent);
  const sectorTone = toneForDrop(scenario.expectedSectorDropPercent, scenario.marketDropPercent);
  const sectorHeading = subIndustryName && subIndustryName !== industryName ? `${industryName} · ${subIndustryName}` : industryName;
  const priceAsOfLabel = formatPriceAsOf(referencePriceAsOf);

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
          <MetricCell label="Expected industry drop" value={formatDrop(scenario.expectedSectorDropPercent)} />
        </MetricGrid>

        {referencePrice !== null && (
          <Text size="xs" tone="muted">
            From {formatCurrency(referencePrice, currency)}
            {priceAsOfLabel ? `, the price as of ${priceAsOfLabel}` : ''}.
          </Text>
        )}

        <Stack gap="sm">
          <Stack direction="row" align="center" gap="sm" wrap>
            <Heading as="h4" size="sm" weight="semibold" tone="muted">
              Impact on {sectorHeading}
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
