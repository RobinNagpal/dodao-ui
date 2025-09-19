import { FullTickerV1CategoryAnalysisResult } from '@/utils/ticker-v1-model-utils';
import TickerComparisonButton from '@/app/stocks/[exchange]/[ticker]/TickerComparisonButton';
import SpiderChartFlyoutMenu from '@/app/public-equities/tickers/[tickerKey]/SpiderChartFlyoutMenu';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Competition from '@/components/ticker-reportsv1/Competition';
import SimilarTickers from '@/components/ticker-reportsv1/SimilarTickers';
import FloatingNavigation, { NavigationSection } from '@/components/ticker-reportsv1/FloatingNavigation';
import RadarChart from '@/components/visualizations/RadarChart';
import { CATEGORY_MAPPINGS, INVESTOR_MAPPINGS, TickerAnalysisCategory } from '@/lib/mappingsV1';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { SpiderGraphForTicker, SpiderGraphPie } from '@/types/public-equity/ticker-report-types';
import { parseMarkdown } from '@/util/parse-markdown';
import { getSpiderGraphScorePercentage } from '@/util/radar-chart-utils';
import { TickerV1ReportResponse } from '@/utils/ticker-v1-model-utils';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { headers } from 'next/headers';
import { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';

function truncateForMeta(text: string, maxLength = 155): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, '') + '…'; // avoid cutting mid-word
}

export async function generateMetadata({ params }: { params: Promise<{ ticker: string; exchange: string }> }): Promise<Metadata> {
  const { ticker, exchange } = await params;

  const referer = (await headers())?.get('referer') ?? ''; // previous URL, if the browser sent it
  const qs = new URLSearchParams({ page: 'tickerDetailsPage' });
  if (referer) qs.set('from', referer);

  const tickerResponse = await fetch(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/${ticker}`, { cache: 'no-cache' });

  let tickerData: TickerV1ReportResponse | undefined;

  if (tickerResponse.ok) {
    tickerData = (await tickerResponse.json()) as TickerV1ReportResponse;
  }

  const companyName = tickerData?.name ?? ticker;
  const rawDescription =
    tickerData?.summary ||
    `Financial analysis and reports for ${companyName} (${ticker}). Explore key metrics, insights, and evaluations to make informed investment decisions.`;

  const shortDescription = truncateForMeta(rawDescription);

  const canonicalUrl = `https://koalagains.com/stocks/${exchange.toUpperCase()}/${ticker.toUpperCase()}`;
  const dynamicKeywords = [
    companyName,
    `Analysis on ${companyName}`,
    `Financial Analysis on ${companyName}`,
    `Reports on ${companyName}`,
    `${companyName} analysis`,
    'investment insights',
    'public equities',
    'KoalaGains',
  ];

  return {
    title: `${companyName} (${ticker}) | KoalaGains`,
    description: shortDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${companyName} (${ticker}) | KoalaGains`,
      description: shortDescription,
      url: canonicalUrl,
      siteName: 'KoalaGains',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${companyName} (${ticker}) | KoalaGains`,
      description: shortDescription,
    },
    keywords: dynamicKeywords,
  };
}

export default async function TickerDetailsPage({ params }: { params: Promise<{ ticker: string; exchange: string }> }) {
  const { ticker, exchange } = await params;
  const tickerResponse = await fetch(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/${ticker}`, { cache: 'no-cache' });

  const tickerData: TickerV1ReportResponse = (await tickerResponse.json()) as TickerV1ReportResponse;

  if (tickerData.exchange !== exchange.toUpperCase()) {
    permanentRedirect(`/stocks/${tickerData.exchange.toUpperCase()}/${tickerData.symbol.toUpperCase()}`);
  }

  const industryKey = tickerData.industryKey;
  const industryName = tickerData.industryName || industryKey;
  const subIndustryName = tickerData.subIndustryName || tickerData.subIndustryKey;

  const breadcrumbs: BreadcrumbsOjbect[] = [
    {
      name: 'US Stocks',
      href: `/stocks`,
      current: false,
    },
    {
      name: industryName,
      href: `/stocks/industries/${tickerData.industryKey}`,
      current: false,
    },
    {
      name: ticker,
      href: `/stocks/${exchange.toUpperCase()}/${ticker.toUpperCase()}`,
      current: true,
    },
  ];

  const spiderGraph: SpiderGraphForTicker = Object.fromEntries(
    Object.entries(CATEGORY_MAPPINGS).map(([categoryKey, categoryTitle]) => {
      const report: FullTickerV1CategoryAnalysisResult | undefined = (tickerData.categoryAnalysisResults || []).find((r) => r.categoryKey === categoryKey);

      const pieData: SpiderGraphPie = {
        key: categoryKey,
        name: categoryTitle,
        summary: report?.summary || 'No summary available.',
        scores: report?.factorResults?.map((factorResult) => ({
          score: factorResult.result === 'Pass' ? 1 : 0,
          comment: `${factorResult.analysisCategoryFactor?.factorAnalysisTitle}: ${factorResult.oneLineExplanation}`,
        })) || [{ score: 0, comment: 'No analysis available' }],
      };
      return [categoryKey, pieData];
    })
  );

  const spiderGraphScorePercentage = getSpiderGraphScorePercentage(spiderGraph);

  // Generate navigation sections based on available content
  const navigationSections: NavigationSection[] = [
    {
      id: 'summary-analysis',
      title: 'Summary Analysis',
      hasContent: true,
    },
    {
      id: 'future-risks',
      title: 'Future Risks',
      hasContent: tickerData.futureRisks.length > 0,
    },
    {
      id: 'competition',
      title: 'Competition',
      hasContent: true,
    },
    {
      id: 'investor-summaries',
      title: 'Investor Reports Summaries',
      hasContent: tickerData.investorAnalysisResults.length > 0,
    },
    {
      id: 'similar-tickers',
      title: 'Similar Tickers',
      hasContent: true,
    },
    {
      id: 'detailed-analysis',
      title: 'Detailed Analysis',
      hasContent: tickerData.categoryAnalysisResults && tickerData.categoryAnalysisResults.length > 0,
      subsections: Object.values(TickerAnalysisCategory)
        .map((categoryKey) => {
          const categoryResult = tickerData.categoryAnalysisResults?.find((r) => r.categoryKey === categoryKey);
          return categoryResult
            ? {
                id: `detailed-${categoryKey}`,
                title: CATEGORY_MAPPINGS[categoryKey],
              }
            : null;
        })
        .filter((item): item is NonNullable<typeof item> => item !== null),
    },
    {
      id: 'detailed-investor-reports',
      title: 'Detailed Investor Reports',
      hasContent: tickerData.investorAnalysisResults.length > 0,
    },
    {
      id: 'detailed-future-risks',
      title: 'Detailed Future Risks',
      hasContent: tickerData.futureRisks.length > 0,
    },
  ];

  return (
    <PageWrapper>
      <Breadcrumbs
        breadcrumbs={breadcrumbs}
        rightButton={
          <TickerComparisonButton
            tickerSymbol={tickerData.symbol}
            tickerName={tickerData.name}
            tickerIndustryKey={tickerData.industryKey}
            tickerSubIndustryKey={tickerData.subIndustryKey}
            tickerIndustryName={industryName}
            tickerSubIndustryName={subIndustryName}
          />
        }
      />
      <div className="mx-auto max-w-7xl  py-2">
        {/* Header Section */}
        <div className="text-left mb-8">
          <h1 className="text-pretty text-2xl font-semibold tracking-tight sm:text-4xl mb-6">
            {tickerData.name} ({tickerData.symbol}){' '}
            {tickerData.websiteUrl && (
              <a href={tickerData.websiteUrl} target="_blank" rel="noopener noreferrer">
                <ArrowTopRightOnSquareIcon className="size-8 cursor-pointer inline link-color" />
              </a>
            )}
          </h1>

          <div className="flex flex-col gap-x-5 gap-y-2 lg:flex-row">
            {/* Ticker Info on the left */}
            <div className="lg:w-full lg:max-w-2xl lg:flex-auto">
              <div
                className="mt-6 markdown-body"
                dangerouslySetInnerHTML={{
                  __html: parseMarkdown(tickerData.summary ?? 'Not yet populated'),
                }}
              />
            </div>

            {/* Spider chart on the right */}
            <div className="lg:flex lg:flex-auto lg:justify-center relative lg:mb-16">
              <div className="lg:absolute lg:top-8 lg:left-0 lg:flex lg:items-center lg:w-full lg:h-full">
                <div className="w-full max-w-lg mx-auto relative">
                  <div className="absolute top-16 right-0 flex space-x-2">
                    <div className="text-2xl font-bold -z-10" style={{ color: 'var(--primary-color, blue)' }}>
                      {spiderGraphScorePercentage.toFixed(0)}%
                    </div>
                    <SpiderChartFlyoutMenu />
                  </div>
                  <RadarChart data={spiderGraph} scorePercentage={spiderGraphScorePercentage} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="summary-analysis" className="bg-gray-800 rounded-lg shadow-sm mb-8">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-700">Summary Analysis</h2>

          <div className="space-y-4">
            {/* Iterate over all categories for summary section */}
            {Object.values(TickerAnalysisCategory).map((categoryKey) => {
              const categoryResult = tickerData.categoryAnalysisResults?.find((r) => r.categoryKey === categoryKey);

              return (
                <div key={categoryKey} className="bg-gray-900 p-4 rounded-md shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">{CATEGORY_MAPPINGS[categoryKey]}</h3>
                  <div
                    className="text-gray-300 markdown markdown-body "
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(categoryResult?.summary || 'No summary available.') }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Future Risks Section */}
        {tickerData.futureRisks.length > 0 && (
          <div id="future-risks" className="bg-gray-900 rounded-lg shadow-sm px-3 py-6 sm:p-6 mb-8">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-700">Future Risks</h2>
            <ul className="space-y-3">
              {tickerData.futureRisks.map((futureRisk) => (
                <li key={futureRisk.id} className="bg-gray-800 px-2 py-4 sm:p-4 rounded-md">
                  <div className="flex flex-col gap-y-2">{futureRisk.summary}</div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Competition Section */}
        <div id="competition">
          <Competition vsCompetition={tickerData.vsCompetition || undefined} competitorTickers={tickerData.competitorTickers} />
        </div>

        {/* Investor Summary Section */}
        {tickerData.investorAnalysisResults.length > 0 && (
          <div id="investor-summaries" className="bg-gray-900 rounded-lg shadow-sm px-3 py-6 sm:p-6 mb-8">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-700">Investor Reports Summaries (Created using AI)</h2>
            <div className="space-y-4">
              {tickerData.investorAnalysisResults.map((result) => (
                <div key={result.id} className="bg-gray-800 px-2 py-4 sm:p-4 rounded-md">
                  <h3 className="font-semibold mb-2">{INVESTOR_MAPPINGS[result.investorKey as keyof typeof INVESTOR_MAPPINGS] || result.investorKey}</h3>
                  <div className="markdown markdown-body " dangerouslySetInnerHTML={{ __html: parseMarkdown(result.summary) }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Similar Tickers Section */}
        <div id="similar-tickers">
          <SimilarTickers similarTickers={tickerData.similarTickers} />
        </div>

        {/* Detailed Category Analysis Sections */}
        <div id="detailed-analysis">
          <h2 className="text-2xl font-bold mb-6 mt-10">Detailed Analysis</h2>

          {/* Iterate over all categories for detailed sections */}
          {Object.values(TickerAnalysisCategory).map((categoryKey) => {
            const categoryResult = tickerData.categoryAnalysisResults?.find((r) => r.categoryKey === categoryKey);
            if (!categoryResult) return null;

            return (
              <div key={`detail-${categoryKey}`} id={`detailed-${categoryKey}`} className="bg-gray-900 rounded-lg shadow-sm px-3 py-6 sm:p-6 mb-8">
                <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-700">{CATEGORY_MAPPINGS[categoryKey]}</h2>

                {categoryResult.overallAnalysisDetails && (
                  <div className="mb-4">
                    <div className="markdown markdown-body " dangerouslySetInnerHTML={{ __html: parseMarkdown(categoryResult.overallAnalysisDetails) }} />
                  </div>
                )}

                {categoryResult.factorResults?.length > 0 && (
                  <ul className="space-y-3">
                    {categoryResult.factorResults.map((factor) => (
                      <li key={factor.id} className="bg-gray-800 px-2 py-4 sm:p-4 rounded-md">
                        <div className="flex flex-col gap-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {factor.result === 'Pass' ? (
                                <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
                              ) : (
                                <XCircleIcon className="h-6 w-6 text-red-500 flex-shrink-0" />
                              )}
                              <h3 className="font-semibold">{factor.analysisCategoryFactor?.factorAnalysisTitle}</h3>
                            </div>
                            <span
                              className={`px-2 py-1 rounded-full text-sm font-medium ${
                                factor.result === 'Pass' ? ' bg-green-900 text-green-200' : '  bg-red-900 text-red-200'
                              }`}
                            >
                              {factor.result}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400">{factor.oneLineExplanation}</p>
                          <div className="markdown markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(factor.detailedExplanation) }} />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        {/* Detailed Investor Reports Section */}
        {tickerData.investorAnalysisResults.length > 0 && (
          <div id="detailed-investor-reports" className="bg-gray-900 rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-700">Detailed Investor Reports (Created using AI)</h2>
            <div className="space-y-4">
              {tickerData.investorAnalysisResults.map((result) => (
                <div key={result.id} className="bg-gray-800 p-4 rounded-md">
                  <h3 className="font-semibold mb-2">{INVESTOR_MAPPINGS[result.investorKey as keyof typeof INVESTOR_MAPPINGS] || result.investorKey}</h3>
                  <div className="markdown markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(result.detailedAnalysis) }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Future Risks Section */}
        {tickerData.futureRisks.length > 0 && (
          <div id="detailed-future-risks" className="bg-gray-900 rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-700">Detailed Future Risks</h2>
            <div className="space-y-3">
              {tickerData.futureRisks.map((futureRisk) => (
                <div key={futureRisk.id} className="bg-gray-800 p-4 rounded-md">
                  <div className="markdown markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(futureRisk.detailedAnalysis) }} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Navigation */}
      <FloatingNavigation sections={navigationSections} />
    </PageWrapper>
  );
}
