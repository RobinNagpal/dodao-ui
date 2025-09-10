import { FullTickerV1CategoryAnalysisResult, TickerV1ReportResponse } from '@/app/api/[spaceId]/tickers-v1/[ticker]/route';
import TickerComparisonButton from '@/app/public-equities-v1/[exchange]/[ticker]/TickerComparisonButton';
import SpiderChartFlyoutMenu from '@/app/public-equities/tickers/[tickerKey]/SpiderChartFlyoutMenu';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Competition from '@/components/ticker-reportsv1/Competition';
import SimilarTickers from '@/components/ticker-reportsv1/SimilarTickers';
import RadarChart from '@/components/visualizations/RadarChart';
import { CATEGORY_MAPPINGS, INVESTOR_MAPPINGS, TickerAnalysisCategory } from '@/lib/mappingsV1';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { SpiderGraphForTicker, SpiderGraphPie } from '@/types/public-equity/ticker-report-types';
import { parseMarkdown } from '@/util/parse-markdown';
import { getSpiderGraphScorePercentage } from '@/util/radar-chart-utils';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid';

export default async function TickerDetailsPage({ params }: { params: Promise<{ ticker: string; exchange: string }> }) {
  const { ticker, exchange } = await params;
  const tickerResponse = await fetch(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/${ticker}`, { cache: 'no-cache' });

  const tickerData: TickerV1ReportResponse = (await tickerResponse.json()) as TickerV1ReportResponse;

  const breadcrumbs: BreadcrumbsOjbect[] = [
    {
      name: 'Public Equities',
      href: `/public-equities-v1`,
      current: false,
    },
    {
      name: ticker,
      href: `/public-equities-v1/${exchange}/${ticker}`,
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

  return (
    <PageWrapper>
      <Breadcrumbs
        breadcrumbs={breadcrumbs}
        rightButton={
          <TickerComparisonButton
            tickerSymbol={tickerData.symbol}
            tickerName={tickerData.name}
            tickerIndustry={tickerData.industryKey}
            tickerSubIndustry={tickerData.subIndustryKey}
          />
        }
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2">
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

        <div className="bg-gray-800 rounded-lg shadow-sm mb-8">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-700">Summary Analysis</h2>

          <div className="space-y-4">
            {/* Iterate over all categories for summary section */}
            {Object.values(TickerAnalysisCategory).map((categoryKey) => {
              const categoryResult = tickerData.categoryAnalysisResults?.find((r) => r.categoryKey === categoryKey);

              return (
                <div key={categoryKey} className="bg-gray-900 p-4 rounded-md shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">{CATEGORY_MAPPINGS[categoryKey]}</h3>
                  <p className="text-gray-300">{categoryResult?.summary || 'No summary available.'}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Similar Tickers Section */}
        <SimilarTickers similarTickers={tickerData.similarTickers} />

        {/* Future Risks Section */}
        {tickerData.futureRisks.length > 0 && (
          <div className="bg-gray-900 rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-700">Future Risks</h2>
            <ul className="space-y-3">
              {tickerData.futureRisks.map((futureRisk) => (
                <li key={futureRisk.id} className="bg-gray-800 p-4 rounded-md">
                  <div className="flex flex-col gap-y-2">{futureRisk.summary}</div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Competition Section */}
        <Competition vsCompetition={tickerData.vsCompetition} competitorTickers={tickerData.competitorTickers} />

        {/* Investor Summary Section */}
        {tickerData.investorAnalysisResults.length > 0 && (
          <div className="bg-gray-900 rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-700">Investor Reports Summaries (Created using AI)</h2>
            <div className="space-y-4">
              {tickerData.investorAnalysisResults.map((result) => (
                <div key={result.id} className="bg-gray-800 p-4 rounded-md">
                  <h3 className="font-semibold mb-2">{INVESTOR_MAPPINGS[result.investorKey as keyof typeof INVESTOR_MAPPINGS] || result.investorKey}</h3>
                  <div className="markdown markdown-body " dangerouslySetInnerHTML={{ __html: parseMarkdown(result.summary) }} />
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Detailed Category Analysis Sections */}
        <h2 className="text-2xl font-bold mb-6 mt-10">Detailed Analysis</h2>

        {/* Iterate over all categories for detailed sections */}
        {Object.values(TickerAnalysisCategory).map((categoryKey) => {
          const categoryResult = tickerData.categoryAnalysisResults?.find((r) => r.categoryKey === categoryKey);
          if (!categoryResult) return null;

          return (
            <div key={`detail-${categoryKey}`} className="bg-gray-900 rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-700">{CATEGORY_MAPPINGS[categoryKey]}</h2>

              {categoryResult.introductionToAnalysis && (
                <div className="mb-4">
                  <div className="markdown markdown-body " dangerouslySetInnerHTML={{ __html: parseMarkdown(categoryResult.introductionToAnalysis) }} />
                </div>
              )}

              {categoryResult.factorResults?.length > 0 && (
                <ul className="space-y-3">
                  {categoryResult.factorResults.map((factor) => (
                    <li key={factor.id} className="bg-gray-800 p-4 rounded-md">
                      <div className="flex flex-col gap-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{factor.analysisCategoryFactor?.factorAnalysisTitle}</h3>
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

        {/* Detailed Investor Reports Section */}
        {tickerData.investorAnalysisResults.length > 0 && (
          <div className="bg-gray-900 rounded-lg shadow-sm p-6 mb-8">
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

        {/* Detailed Investor Reports Section */}
        {tickerData.futureRisks.length > 0 && (
          <div className="bg-gray-900 rounded-lg shadow-sm p-6 mb-8">
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
    </PageWrapper>
  );
}
