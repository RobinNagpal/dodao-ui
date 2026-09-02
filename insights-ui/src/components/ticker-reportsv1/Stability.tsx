import StabilityScenarioCard from '@/components/ticker-reportsv1/StabilityScenarioCard';
import TickerRelatedSections, { getAvailableSiblingSlugs } from '@/components/ticker-reportsv1/TickerRelatedSections';
import StatusBadge from '@/components/ui/StatusBadge';
import Text from '@/components/ui/Text';
import Stack from '@/components/ui/containers/Stack';
import MarkdownContent from '@/components/ui/sections/MarkdownContent';
import Prose from '@/components/ui/sections/Prose';
import ReportArticleShell from '@/components/ui/sections/ReportArticleShell';
import ReportFooter from '@/components/ui/sections/ReportFooter';
import ReportSection from '@/components/ui/sections/ReportSection';
import ReportSectionHeader from '@/components/ui/sections/ReportSectionHeader';
import SectionHeading from '@/components/ui/sections/SectionHeading';
import { MarketDropScenario } from '@/types/public-equity/analysis-factors-types';
import { STABILITY_RESILIENCE_VERDICT_DESCRIPTIONS, STABILITY_RESILIENCE_VERDICT_LABELS, StabilityResilienceVerdict } from '@/types/ticker-typesv1';
import { formatCurrency } from '@/components/reportsv1/financialFormatters';
import { parseMarkdown } from '@/util/parse-markdown';
import React, { Suspense } from 'react';

const VERDICT_BADGE_VARIANT: Record<StabilityResilienceVerdict, 'success' | 'info' | 'warning' | 'danger'> = {
  [StabilityResilienceVerdict.HIGHLY_RESILIENT]: 'success',
  [StabilityResilienceVerdict.RESILIENT]: 'success',
  [StabilityResilienceVerdict.MARKET_LIKE]: 'info',
  [StabilityResilienceVerdict.VULNERABLE]: 'warning',
  [StabilityResilienceVerdict.HIGHLY_VULNERABLE]: 'danger',
};

type TickerDataLike = {
  id: string;
  name: string;
  symbol: string;
  exchange: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export type StabilityReportLike = {
  summary: string;
  detailedAnalysis: string;
  resilienceVerdict: string;
  referencePrice?: number | null;
  currency?: string | null;
  dropScenarios?: MarketDropScenario[] | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export interface StabilityProps {
  tickerData: TickerDataLike;
  report: StabilityReportLike;
  /** Sub-industry (or industry) name used in the per-scenario sector headings. */
  sectorName: string;
}

/**
 * Stability report body: the overall resilience verdict, the three
 * market-drop scenarios (-5% / -10% / -20%) with their expected prices and
 * sector/company reasoning, and the long-form analysis behind them.
 */
export default function Stability({ tickerData, report, sectorName }: StabilityProps): React.JSX.Element {
  const publishedDate = new Date(report.createdAt || tickerData.createdAt || new Date());
  const modifiedDate = new Date(report.updatedAt || tickerData.updatedAt || new Date());
  const formattedModifiedDate = modifiedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const verdict = report.resilienceVerdict as StabilityResilienceVerdict;
  const verdictLabel = STABILITY_RESILIENCE_VERDICT_LABELS[verdict] || report.resilienceVerdict;
  const verdictDescription = STABILITY_RESILIENCE_VERDICT_DESCRIPTIONS[verdict];
  const referencePrice = report.referencePrice ?? null;
  const currency = report.currency ?? null;
  const scenarios: MarketDropScenario[] = report.dropScenarios ?? [];

  // Kick off the sibling-presence query in parallel with the rest of render.
  // The Promise is unwrapped via `use()` inside <TickerRelatedSections>, suspended by the boundary below.
  const availableSlugsPromise = getAvailableSiblingSlugs(tickerData.id);

  return (
    <ReportArticleShell datePublished={publishedDate}>
      <ReportSectionHeader
        title={`${tickerData.name} (${tickerData.symbol}) Stability & Market Drawdown Analysis`}
        exchange={tickerData.exchange}
        modifiedDate={modifiedDate}
        formattedModifiedDate={formattedModifiedDate}
        actionHref={`/stocks/${tickerData.exchange}/${tickerData.symbol}`}
      >
        <Stack direction="row" align="center" gap="sm" wrap mt="sm">
          <StatusBadge variant={VERDICT_BADGE_VARIANT[verdict] ?? 'neutral'} label={verdictLabel} />
          {referencePrice !== null && (
            <Text size="xs" tone="muted" as="span">
              Current price {formatCurrency(referencePrice, currency)}
            </Text>
          )}
        </Stack>
      </ReportSectionHeader>

      <Prose>
        <ReportSection>
          <SectionHeading>Summary</SectionHeading>
          {verdictDescription && (
            <Text size="sm" tone="muted">
              {verdictDescription}
            </Text>
          )}
          <MarkdownContent variant="summary" itemProp="abstract" html={parseMarkdown(report.summary)} />
        </ReportSection>

        {scenarios.length > 0 && (
          <ReportSection>
            <SectionHeading>If the Market Drops</SectionHeading>
            <Text size="sm" tone="muted">
              Expected price for {tickerData.name} in a 5%, 10% and 20% broad-market sell-off, with what each drop does to the sector and to the company.
            </Text>
            <Stack as="ul" gap="lg" mt="md">
              {scenarios.map((scenario) => (
                <StabilityScenarioCard
                  key={scenario.marketDropPercent}
                  scenario={scenario}
                  companyName={tickerData.name}
                  sectorName={sectorName}
                  referencePrice={referencePrice}
                  currency={currency}
                />
              ))}
            </Stack>
          </ReportSection>
        )}

        <ReportSection itemProp="articleBody">
          <SectionHeading>Detailed Analysis</SectionHeading>
          <MarkdownContent variant="body" html={parseMarkdown(report.detailedAnalysis)} />
        </ReportSection>
      </Prose>

      <Suspense fallback={null}>
        <TickerRelatedSections
          availableSlugsPromise={availableSlugsPromise}
          exchange={tickerData.exchange}
          symbol={tickerData.symbol}
          companyName={tickerData.name}
          currentSlug="stability"
        />
      </Suspense>

      <ReportFooter
        modifiedDate={modifiedDate}
        formattedModifiedDate={formattedModifiedDate}
        tags={[
          { label: 'Stock Analysis', tone: 'family' },
          { label: 'Stability', tone: 'category' },
        ]}
      />
    </ReportArticleShell>
  );
}
