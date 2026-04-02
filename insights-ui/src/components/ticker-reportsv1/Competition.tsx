import { computeQuadrantScores, classifyStock, QuadrantDataPoint } from '@/util/quadrant-chart-utils';
import CompetitionQuadrantChart from '@/components/ticker-reportsv1/CompetitionQuadrantChart';
import { parseMarkdown } from '@/util/parse-markdown';
import { getCountryByExchange } from '@/utils/countryExchangeUtils';
import type { CompetitionResponse } from '@/types/ticker-typesv1';
import { slugify } from '@dodao/web-core/utils/auth/slugify';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';
import React from 'react';
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <article className="bg-gray-900 rounded-lg shadow-sm border border-color p-6 md:p-8" itemScope itemType="https://schema.org/Article">
        {/* Hidden datePublished for schema - machine readable only */}
        <meta itemProp="datePublished" content={publishedDate.toISOString()} />

        {/* Article Header */}
        <header className="mb-6 pb-4 border-b border-color">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-color mb-2" itemProp="headline">
                {tickerData.name} <span className="text-muted-foreground">({ticker})</span>
              </h1>
              <div className="flex flex-wrap items-center gap-2 md:gap-3 text-sm">
                <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-300">
                  {tickerData.exchange}
                </span>
                <span className="text-muted-foreground">•</span>
                <time dateTime={modifiedDate.toISOString()} className="text-muted-foreground text-sm" itemProp="dateModified">
                  {formattedModifiedDate}
                </time>
              </div>
            </div>

            <Link
              href={`/stocks/${tickerData.exchange}/${tickerData.symbol}`}
              className="link-color hover:underline text-sm font-medium whitespace-nowrap flex items-center gap-1"
            >
              View Full Report →
            </Link>
          </div>
        </header>

        {/* Article Body */}
        <div className="prose prose-invert max-w-none">
          <section className="mb-6">
            <h2 className="text-xl font-semibold text-color mb-3">Analysis Title</h2>
            <p className="text-color" itemProp="description">
              {analysisTitle}
            </p>
          </section>

          {quadrantDataPoints.length >= 2 ? (
            <section className="mb-6">
              <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                {/* Left: Executive Summary + classification breakdown */}
                <div className="lg:w-1/2">
                  <h2 className="text-xl font-semibold text-color mb-3">Executive Summary</h2>
                  <p className="text-color leading-relaxed mb-5" itemProp="abstract">
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
                              <span className={dp.isMainTicker ? 'font-semibold text-amber-400' : 'text-gray-200 group-hover:text-[#F59E0B] transition-colors'}>
                                {dp.companyName}
                              </span>
                              <span className={dp.isMainTicker ? 'text-amber-400 text-xs' : 'text-gray-500 text-xs'}>({dp.ticker})</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
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
                        <Link key={dp.ticker} href={tickerLink} className="flex items-start gap-2.5 text-sm group">
                          {content}
                        </Link>
                      ) : (
                        <div key={dp.ticker} className="flex items-start gap-2.5 text-sm">
                          {content}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Quadrant chart */}
                <div className="lg:w-1/2">
                  <CompetitionQuadrantChart dataPoints={quadrantDataPoints} mainTickerSymbol={ticker} />
                </div>
              </div>

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
            </section>
          ) : (
            <section className="mb-6">
              <h2 className="text-xl font-semibold text-color mb-3">Executive Summary</h2>
              <p className="text-color leading-relaxed" itemProp="abstract">
                {executiveSummary}
              </p>
            </section>
          )}

          {vsCompetition?.overallAnalysisDetails && (
            <section className="mb-6" itemProp="articleBody">
              <h2 className="text-xl font-semibold text-color mb-3">Comprehensive Analysis</h2>
              <div
                className="markdown markdown-body prose-headings:text-color prose-p:text-color prose-strong:text-color prose-code:text-color prose-a:text-primary hover:prose-a:text-primary/80"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(vsCompetition.overallAnalysisDetails) }}
              />
            </section>
          )}

          {competitorTickers && competitorTickers.length > 0 && (
            <section className="mb-6">
              <h2 className="text-xl font-semibold text-color mb-3">Competitor Details</h2>
              <ul className="space-y-3 mt-2">
                {competitorTickers.map((competitor, index) => {
                  const tickerLink =
                    competitor.existsInSystem && competitor.tickerData
                      ? `/stocks/${competitor.tickerData.exchange.toUpperCase()}/${competitor.tickerData.symbol.toUpperCase()}`
                      : null;
                  return (
                    <li key={`${competitor.companyName}-${index}`} className="bg-gray-800 p-4 rounded-md">
                      <div className="flex flex-col gap-y-2">
                        <div className="flex items-center justify-between">
                          {tickerLink ? (
                            <Link
                              href={tickerLink}
                              title="View detailed report"
                              className="flex gap-x-2 items-center text-[#F59E0B] hover:text-[#F97316] transition-colors"
                            >
                              <h3 className="font-semibold">{competitor.companyName}</h3>
                              <ArrowTopRightOnSquareIcon className="size-4 text-primary-text" />
                            </Link>
                          ) : (
                            <h3 className="font-semibold">{competitor.companyName}</h3>
                          )}
                          <div className="flex">
                            <div className="flex items-center gap-x-2">
                              {competitor.companySymbol && (
                                <span className="text-sm text-gray-400">
                                  {competitor.companySymbol} • {competitor.exchangeName?.toUpperCase()}
                                </span>
                              )}
                            </div>
                            <AddTickerAdminButton competitor={competitor} />
                          </div>
                        </div>
                        {competitor.detailedComparison && (
                          <div
                            id={slugify(competitor.companyName)}
                            className="markdown markdown-body"
                            dangerouslySetInnerHTML={{ __html: parseMarkdown(competitor.detailedComparison) }}
                          />
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>

        {/* Article Footer */}
        <footer className="mt-8 pt-6 border-t border-color">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              <span>Last updated by </span>
              <span itemProp="author" itemScope itemType="https://schema.org/Organization">
                <span itemProp="name">KoalaGains</span>
              </span>
              <span> on </span>
              <time dateTime={modifiedDate.toISOString()} itemProp="dateModified">
                {formattedModifiedDate}
              </time>
            </div>
            <div className="flex gap-2">
              <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-300">
                Stock Analysis
              </span>
              <span className="inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-900 px-2.5 py-0.5 text-xs font-medium text-purple-800 dark:text-purple-300">
                Competitive Analysis
              </span>
            </div>
          </div>
        </footer>
      </article>
    </div>
  );
}
