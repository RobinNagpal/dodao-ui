import { FullTickerV1CategoryAnalysisResult, TickerV1ReportResponse } from '@/app/api/[spaceId]/tickers-v1/[ticker]/route';
import SpiderChartFlyoutMenu from '@/app/public-equities/tickers/[tickerKey]/SpiderChartFlyoutMenu';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import RadarChart from '@/components/visualizations/RadarChart';
import { CATEGORY_MAPPINGS, INVESTOR_MAPPINGS, TickerAnalysisCategory } from '@/lib/mappingsV1';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { CompetitionAnalysis } from '@/types/public-equity/analysis-factors-types';
import { PerformanceChecklistItem, SpiderGraphForTicker, SpiderGraphPie } from '@/types/public-equity/ticker-report-types';
import { parseMarkdown } from '@/util/parse-markdown';
import { getSpiderGraphScorePercentage } from '@/util/radar-chart-utils';
import { getReportName } from '@/util/report-utils';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid';
import { TickerV1AnalysisCategoryFactorResult, TickerV1CategoryAnalysisResult } from '.prisma/client';

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
        scores:
          report?.factorResults.map((factorResult) => ({
            score: factorResult.result === 'Pass' ? 1 : 0,
            comment: factorResult.oneLineExplanation,
          })) || [],
      };
      return [categoryKey, pieData];
    })
  );

  const spiderGraphScorePercentage = getSpiderGraphScorePercentage(spiderGraph);

  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Section */}
        <div className="text-left mb-8">
          <h1 className="text-pretty text-2xl font-semibold tracking-tight sm:text-4xl mb-6">
            {tickerData.name} ({tickerData.symbol}){' '}
            <a href={tickerData.websiteUrl} target="_blank" rel="noopener noreferrer">
              <ArrowTopRightOnSquareIcon className="size-8 cursor-pointer inline link-color" />
            </a>
          </h1>

          {/* Radar Chart - centered, max 60% width on large screens, full width on small */}
          <div className="w-full mx-auto relative lg:w-3/5 flex justify-center">
            <div className="w-full relative">
              <div className="absolute top-4 right-4 flex space-x-2 z-10">
                <div className="text-2xl font-bold" style={{ color: 'var(--primary-color, blue)' }}>
                  {spiderGraphScorePercentage.toFixed(0)}%
                </div>
                <SpiderChartFlyoutMenu />
              </div>
              <RadarChart data={spiderGraph} scorePercentage={spiderGraphScorePercentage} />
            </div>
          </div>

          {/* Summary Analysis Section */}
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm mb-8">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">Summary Analysis</h2>

          <div className="space-y-4">
            {/* Iterate over all categories for summary section */}
            {Object.values(TickerAnalysisCategory).map((categoryKey) => {
              const categoryResult = tickerData.categoryAnalysisResults?.find((r) => r.categoryKey === categoryKey);
              return (
                <div key={categoryKey} className="bg-white dark:bg-gray-900 p-4 rounded-md shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">{CATEGORY_MAPPINGS[categoryKey]}</h3>
                  <p className="text-gray-700 dark:text-gray-300">{categoryResult?.summary || 'No summary available.'}</p>
                </div>
              );
            })}
          </div>
        </div>
        {/* Future Risks Section */}
        {tickerData.futureRisks.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">Future Risks</h2>
            <ul className="space-y-3">
              {tickerData.futureRisks.map((futureRisk) => (
                <li key={futureRisk.id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                  <div className="flex flex-col gap-y-2">{futureRisk.summary}</div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Competition Section */}
        {tickerData.vsCompetition && (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">Competition</h2>
            <p className="mb-4">{tickerData.vsCompetition.introductionToAnalysis}</p>
            {tickerData.vsCompetition.competitionAnalysisArray?.length > 0 && (
              <ul className="space-y-3">
                {tickerData.vsCompetition.competitionAnalysisArray.map((competition: CompetitionAnalysis) => (
                  <li key={competition.companyName} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                    <div className="flex flex-col gap-y-2">
                      <h3 className="font-semibold">{competition.companyName}</h3>
                      <p>{competition.detailedComparison}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Detailed Investor Reports Section */}
        {tickerData.investorAnalysisResults.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">Investor Reports Summaries</h2>
            <div className="space-y-4">
              {tickerData.investorAnalysisResults.map((result) => (
                <div key={result.id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                  <h3 className="font-semibold mb-2">{INVESTOR_MAPPINGS[result.investorKey as keyof typeof INVESTOR_MAPPINGS] || result.investorKey}</h3>
                  <p>{result.summary}</p>
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
            <div key={`detail-${categoryKey}`} className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">{CATEGORY_MAPPINGS[categoryKey]}</h2>

              {categoryResult.introductionToAnalysis && <p className="mb-4">{categoryResult.introductionToAnalysis}</p>}

              {categoryResult.factorResults?.length > 0 && (
                <ul className="space-y-3">
                  {categoryResult.factorResults.map((factor) => (
                    <li key={factor.id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                      <div className="flex flex-col gap-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{factor.analysisCategoryFactor?.factorAnalysisTitle}</h3>
                          <span
                            className={`px-2 py-1 rounded-full text-sm font-medium ${
                              factor.result === 'Pass'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}
                          >
                            {factor.result}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{factor.oneLineExplanation}</p>
                        <p>{factor.detailedExplanation}</p>
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
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">Detailed Investor Reports</h2>
            <div className="space-y-4">
              {tickerData.investorAnalysisResults.map((result) => (
                <div key={result.id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                  <h3 className="font-semibold mb-2">{INVESTOR_MAPPINGS[result.investorKey as keyof typeof INVESTOR_MAPPINGS] || result.investorKey}</h3>
                  <p>{result.detailedAnalysis}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
