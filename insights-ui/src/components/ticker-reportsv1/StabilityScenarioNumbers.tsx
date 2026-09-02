import { formatCurrency } from '@/components/reportsv1/financialFormatters';
import Text from '@/components/ui/Text';
import MetricGrid from '@/components/ui/containers/MetricGrid';
import Stack from '@/components/ui/containers/Stack';
import MetricCell from '@/components/ui/MetricCell';
import { MarketDropScenario } from '@/types/public-equity/analysis-factors-types';
import { formatDrop, formatPriceAsOf } from '@/utils/stability-report-utils';
import React from 'react';

export interface StabilityScenarioNumbersProps {
  scenarios: MarketDropScenario[];
  /** Price every expected price was derived from. */
  referencePrice: number | null;
  referencePriceAsOf: string | Date | null;
  currency: string | null;
}

/**
 * The stability report's headline numbers: one cell per market-drop scenario
 * (`-5%` / `-15%` / `-30%`) with the expected price and the expected drop for
 * this stock, plus the price + date they are all measured from.
 *
 * Shared by the summary card on the main stock page and the stability detail
 * page so both quote the same numbers against the same reference price.
 */
export default function StabilityScenarioNumbers({
  scenarios,
  referencePrice,
  referencePriceAsOf,
  currency,
}: StabilityScenarioNumbersProps): React.JSX.Element | null {
  if (scenarios.length === 0) return null;

  return (
    <Stack gap="sm">
      <MetricGrid columns="3" gap="sm">
        {scenarios.map((scenario) => (
          <MetricCell
            key={scenario.marketDropPercent}
            size="xs"
            label={`Market ${formatDrop(scenario.marketDropPercent)}`}
            value={`${formatCurrency(scenario.expectedPrice, currency)} · ${formatDrop(scenario.expectedStockDropPercent)}`}
            sentiment="negative"
          />
        ))}
      </MetricGrid>
      {referencePrice !== null && (
        <Text size="xs" tone="muted">
          Expected prices are measured from {formatCurrency(referencePrice, currency)}
          {formatPriceAsOf(referencePriceAsOf) ? `, the price as of ${formatPriceAsOf(referencePriceAsOf)}` : ''}.
        </Text>
      )}
    </Stack>
  );
}
