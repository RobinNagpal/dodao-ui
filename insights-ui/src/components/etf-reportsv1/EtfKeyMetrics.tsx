import type { EtfKeyMetricsResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/full-render/route';
import Heading from '@/components/ui/Heading';
import InlineCard from '@/components/ui/InlineCard';
import MetricCell from '@/components/ui/MetricCell';
import MetricGrid from '@/components/ui/MetricGrid';
import Stack from '@/components/ui/Stack';
import Text from '@/components/ui/Text';

interface EtfKeyMetricsProps {
  metrics: EtfKeyMetricsResponse;
}

type MetricSentiment = 'positive' | 'negative' | 'neutral';

function formatRatio(value: number | null): string | undefined {
  return value === null ? undefined : value.toFixed(2);
}

function formatPercent(value: number | null): string | undefined {
  return value === null ? undefined : `${value.toFixed(1)}%`;
}

/** Green for positive returns, red for negative; neutral when absent. */
function returnSentiment(value: number | null): MetricSentiment {
  if (value === null) return 'neutral';
  return value >= 0 ? 'positive' : 'negative';
}

/**
 * Risk/return figures + expected-return rationale, shown inside the Future
 * Performance Outlook card. Renders nothing when no figure exists. The expected
 * returns (and their reasons) come from the future report's EtfFutureReturns row.
 */
export default function EtfKeyMetrics({ metrics }: EtfKeyMetricsProps): JSX.Element | null {
  const figures: Array<{ label: string; value: string | undefined; sentiment: MetricSentiment }> = [
    { label: 'Sharpe Ratio', value: formatRatio(metrics.sharpe), sentiment: 'neutral' },
    { label: 'Sortino Ratio', value: formatRatio(metrics.sortino), sentiment: 'neutral' },
    { label: 'Beta (5Y)', value: formatRatio(metrics.beta5y), sentiment: 'neutral' },
    { label: 'Max Drawdown', value: formatPercent(metrics.maxDrawdown), sentiment: returnSentiment(metrics.maxDrawdown) },
    { label: 'Exp. Return (1Y)', value: formatPercent(metrics.expectedNext1YrReturns), sentiment: returnSentiment(metrics.expectedNext1YrReturns) },
    { label: 'Exp. Return (3Y)', value: formatPercent(metrics.expectedNext3YrReturns), sentiment: returnSentiment(metrics.expectedNext3YrReturns) },
    { label: 'Exp. Return (5Y)', value: formatPercent(metrics.expectedNext5YrReturns), sentiment: returnSentiment(metrics.expectedNext5YrReturns) },
  ];

  const reasons: Array<{ label: string; reason: string }> = [
    { label: '1-Year', reason: metrics.expectedNext1YrReturnsReason ?? '' },
    { label: '3-Year', reason: metrics.expectedNext3YrReturnsReason ?? '' },
    { label: '5-Year', reason: metrics.expectedNext5YrReturnsReason ?? '' },
  ].filter((r) => r.reason.trim().length > 0);

  if (figures.every((f) => f.value === undefined) && reasons.length === 0) return null;

  return (
    <Stack gap="md" mb="md">
      <MetricGrid columns="2-4-7" gap="sm">
        {figures.map((f) => (
          <MetricCell key={f.label} label={f.label} value={f.value} sentiment={f.sentiment} size="sm" />
        ))}
      </MetricGrid>

      {reasons.length > 0 && (
        <Stack gap="sm">
          <Heading as="h4" size="sm" weight="semibold" tone="bright">
            Why these expected returns
          </Heading>
          {reasons.map((r) => (
            <InlineCard key={r.label}>
              <Text as="p" size="xs" tone="muted" leading="snug">
                <Text as="span" size="inherit" weight="semibold" tone="body">
                  {r.label}
                </Text>{' '}
                - {r.reason}
              </Text>
            </InlineCard>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
