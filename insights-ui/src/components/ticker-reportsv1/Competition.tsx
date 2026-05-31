import { computeQuadrantScores, classifyStock, QuadrantDataPoint } from '@/util/quadrant-chart-utils';
import CompetitionQuadrantChart from '@/components/ticker-reportsv1/CompetitionQuadrantChart';
import CompetitorCard from '@/components/competition/CompetitorCard';
import TickerRelatedSections, { getAvailableSiblingSlugs } from '@/components/ticker-reportsv1/TickerRelatedSections';
import MarkdownContent from '@/components/ui/sections/MarkdownContent';
import Prose from '@/components/ui/sections/Prose';
import ReportArticleShell from '@/components/ui/sections/ReportArticleShell';
import ReportFooter from '@/components/ui/sections/ReportFooter';
import ReportSection from '@/components/ui/sections/ReportSection';
import ReportSectionHeader from '@/components/ui/sections/ReportSectionHeader';
import SectionHeading from '@/components/ui/sections/SectionHeading';
import SplitColumns from '@/components/ui/containers/SplitColumns';
import { parseMarkdown } from '@/util/parse-markdown';
import { getCountryByExchange } from '@/utils/countryExchangeUtils';
import type { CompetitionResponse } from '@/types/ticker-typesv1';
import Link from 'next/link';
import React, { Suspense } from 'react';
import AddTickerAdminButton from './AddTickerAdminButton';

export interface CompetitionProps {
  tickerData: CompetitionResponse['ticker'];
  data: CompetitionResponse;
}

export default function Competition({ tickerData, data }: CompetitionProps): JSX.Element | null {
  const { vsCompetition, competitorTickers } = data;

  if (!tickerData || (!vsCompetition && (!competitorTickers || competitorTickers.length === 0))) {
    return null;
  }

  // Kick off the sibling-presence query in parallel with the rest of render.
  // The Promise is unwrapped via `use()` inside <TickerRelatedSections>, suspended by the boundary below.
  const availableSlugsPromise = getAvailableSiblingSlugs(tickerData.id);

  // Derive dates from competition/ticker data
  const createdAtRaw = vsCompetition?.createdAt || data.ticker?.createdAt || new Date();
  const updatedAtRaw = vsCompetition?.updatedAt || data.ticker?.updatedAt || new Date();

  const publishedDate = new Date(createdAtRaw);
  const modifiedDate = new Date(updatedAtRaw);

  const formattedModifiedDate = modifiedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const ticker = tickerData.symbol;
  const exchange = tickerData.exchange;

  const industryName = tickerData.industry?.name || tickerData.industryKey;
  const subIndustryName = tickerData.subIndustry?.name;

  const country = getCountryByExchange(exchange as any);
  const locationContext = country ? `${country} stock market` : `${exchange.toUpperCase()} stock market`;
  const industryContext = subIndustryName ? `${subIndustryName} (${industryName})` : industryName;

  const competitorList =
    competitorTickers.length > 0
      ? competitorTickers.length === 1
        ? competitorTickers[0].companyName
        : `${competitorTickers
            .slice(0, -1)
            .map((c) => c.companyName)
            .join(', ')} and ${competitorTickers[competitorTickers.length - 1].companyName}`
      : 'its key industry peers';

  const analysisTitle = `${tickerData.name} (${ticker}) Competitive Analysis`;
  const executiveSummary = `A comprehensive competitive analysis of ${tickerData.name} (${ticker}) in the ${industryContext} within the ${locationContext}, comparing it against ${competitorList} and evaluating market position, financial strengths, and competitive advantages.`;

  // Build quadrant data points from tickers that exist in system with cached scores
  const quadrantDataPoints: QuadrantDataPoint[] = [];

  const mainCached = tickerData.cachedScoreEntry;
  if (mainCached) {
    const { qualityScore, valueScore } = computeQuadrantScores(mainCached);
    quadrantDataPoints.push({
      ticker: tickerData.symbol,
      companyName: tickerData.name,
      qualityScore,
      valueScore,
      classification: classifyStock(qualityScore, valueScore),
      isMainTicker: true,
      exchange: tickerData.exchange,
    });
  }

  for (const competitor of competitorTickers) {
    const cached = competitor.tickerData?.cachedScoreEntry;
    if (!cached || !competitor.existsInSystem) continue;
    const { qualityScore, valueScore } = computeQuadrantScores(cached);
    quadrantDataPoints.push({
      ticker: competitor.tickerData!.symbol,
      companyName: competitor.companyName,
      qualityScore,
      valueScore,
      classification: classifyStock(qualityScore, valueScore),
      isMainTicker: false,
      exchange: competitor.tickerData!.exchange,
    });
  }

  const executiveSummaryLeft = (
    <>
      <SectionHeading as="h2">Executive Summary</SectionHeading>
      <p className="text-body leading-relaxed mb-5" itemProp="abstract">
        {executiveSummary}
      </p>

      <div className="space-y-2.5">
        {quadrantDataPoints.map((dp) => {
          const tickerLink = !dp.isMainTicker && dp.exchange ? `/stocks/${dp.exchange.toUpperCase()}/${dp.ticker.toUpperCase()}` : null;

          const content = (
            <>
              <span
                className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5"
                style={{
                  backgroundColor: dp.isMainTicker
                    ? '#f59e0b'
                    : dp.classification === 'High Quality'
                    ? '#34d399'
                    : dp.classification === 'Investable'
                    ? '#818cf8'
                    : dp.classification === 'Value Play'
                    ? '#38bdf8'
                    : '#fb7185',
                }}
              />
              <div className="min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className={dp.isMainTicker ? 'font-semibold text-amber-400' : 'text-body group-hover:text-link transition-colors'}>
                    {dp.companyName}
                  </span>
                  <span className={dp.isMainTicker ? 'text-amber-400 text-xs' : 'text-muted text-xs'}>({dp.ticker})</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted mt-0.5">
                  <span>{dp.classification}</span>
                  <span>·</span>
                  <span>Quality {dp.qualityScore.toFixed(0)}%</span>
                  <span>·</span>
                  <span>Value {dp.valueScore.toFixed(0)}%</span>
                </div>
              </div>
            </>
          );

          return tickerLink ? (
            <Link key={dp.ticker} href={tickerLink} prefetch={false} className="flex items-start gap-2.5 text-sm group">
              {content}
            </Link>
          ) : (
            <div key={dp.ticker} className="flex items-start gap-2.5 text-sm">
              {content}
            </div>
          );
        })}
      </div>
    </>
  );

  return (
    <ReportArticleShell padding="lg" datePublished={publishedDate}>
      <ReportSectionHeader
        title={analysisTitle}
        exchange={tickerData.exchange}
        modifiedDate={modifiedDate}
        formattedModifiedDate={formattedModifiedDate}
        actionHref={`/stocks/${tickerData.exchange}/${tickerData.symbol}`}
      />

      {/* Article Body */}
      <Prose>
        {quadrantDataPoints.length >= 2 ? (
          <ReportSection>
            <SplitColumns gap="md" left={executiveSummaryLeft} right={<CompetitionQuadrantChart dataPoints={quadrantDataPoints} mainTickerSymbol={ticker} />} />

            {/* Server-rendered table for SEO — search engines can't read Canvas charts */}
            <div className="sr-only" aria-hidden="false">
              <table>
                <caption>
                  Quality vs Value comparison of {tickerData.name} ({ticker}) and competitors
                </caption>
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Ticker</th>
                    <th>Quality Score</th>
                    <th>Value Score</th>
                    <th>Classification</th>
                  </tr>
                </thead>
                <tbody>
                  {quadrantDataPoints.map((dp) => (
                    <tr key={dp.ticker}>
                      <td>{dp.companyName}</td>
                      <td>{dp.ticker}</td>
                      <td>{dp.qualityScore.toFixed(0)}%</td>
                      <td>{dp.valueScore.toFixed(0)}%</td>
                      <td>{dp.classification}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ReportSection>
        ) : (
          <ReportSection>
            <SectionHeading as="h2">Executive Summary</SectionHeading>
            <p className="text-body leading-relaxed" itemProp="abstract">
              {executiveSummary}
            </p>
          </ReportSection>
        )}

        {vsCompetition?.overallAnalysisDetails && (
          <ReportSection itemProp="articleBody">
            <SectionHeading as="h2">Comprehensive Analysis</SectionHeading>
            <MarkdownContent variant="body" html={parseMarkdown(vsCompetition.overallAnalysisDetails)} />
          </ReportSection>
        )}

        {competitorTickers && competitorTickers.length > 0 && (
          <ReportSection>
            <SectionHeading as="h2">Competitor Details</SectionHeading>
            <ul className="space-y-3 mt-2">
              {competitorTickers.map((competitor, index) => {
                const href =
                  competitor.existsInSystem && competitor.tickerData
                    ? `/stocks/${competitor.tickerData.exchange.toUpperCase()}/${competitor.tickerData.symbol.toUpperCase()}`
                    : null;
                return (
                  <CompetitorCard
                    key={`${competitor.companyName}-${index}`}
                    competitor={competitor}
                    href={href}
                    actionSlot={<AddTickerAdminButton competitor={competitor} />}
                  />
                );
              })}
            </ul>
          </ReportSection>
        )}
      </Prose>

      <Suspense fallback={null}>
        <TickerRelatedSections
          availableSlugsPromise={availableSlugsPromise}
          exchange={tickerData.exchange}
          symbol={tickerData.symbol}
          companyName={tickerData.name}
          currentSlug="competition"
        />
      </Suspense>

      <ReportFooter
        modifiedDate={modifiedDate}
        formattedModifiedDate={formattedModifiedDate}
        tags={[
          { label: 'Stock Analysis', tone: 'family' },
          { label: 'Competitive Analysis', tone: 'competitive' },
        ]}
      />
    </ReportArticleShell>
  );
}
