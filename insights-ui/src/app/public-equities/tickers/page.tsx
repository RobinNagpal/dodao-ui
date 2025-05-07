import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import Link from 'next/link';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PrivateWrapper from '@/components/auth/PrivateWrapper';
import TickerActionsDropdown from './[tickerKey]/TickerActionsDropdown';
import { Metadata } from 'next';
import { PartialNestedTickerReport, SpiderGraphForTicker } from '@/types/public-equity/ticker-report-types';
import { IndustryGroupCriteriaDefinition } from '@/types/public-equity/criteria-types';
import { getGraphColor, getSpiderGraphScorePercentage } from '@/util/radar-chart-utils';

export const metadata: Metadata = {
  title: 'REIT Tickers | KoalaGains',
  description:
    'Explore all available REIT tickers. Dive into detailed AI-driven financial reports, analyze key metrics, and streamline your public equities research on KoalaGains.',
  alternates: {
    canonical: 'https://koalagains.com/public-equities/tickers',
  },
  keywords: ['REIT', 'Tickers', 'Public Equities', 'REIT Financial Reports', 'KoalaGains', 'REIT Analysis'],
};

async function getTickersResponse(): Promise<PartialNestedTickerReport[]> {
  try {
    const response = await fetch(`${getBaseUrl()}/api/tickers`, { cache: 'no-cache' });
    return await response.json();
  } catch (error) {
    console.error('Error fetching tickers:', error);
    return [];
  }
}

const breadcrumbs: BreadcrumbsOjbect[] = [
  {
    name: 'Custom Reports',
    href: `/custom-reports`,
    current: false,
  },
  {
    name: 'Tickers',
    href: `/public-equities/tickers`,
    current: true,
  },
];

export default async function AllTickersPage() {
  const tickers: PartialNestedTickerReport[] = await getTickersResponse();

  const criteriaResponse = await fetch(
    'https://dodao-ai-insights-agent.s3.us-east-1.amazonaws.com/public-equities/US/gics/real-estate/equity-real-estate-investment-trusts-reits/custom-criteria.json',
    { cache: 'no-cache' }
  );
  const industryGroupCriteria = (await criteriaResponse.json()) as IndustryGroupCriteriaDefinition;

  const tickersWithScores = tickers.map((t) => {
    const reportMap = new Map(t.evaluationsOfLatest10Q.map((r) => [r.criterionKey, r]));

    const spiderGraph = Object.fromEntries(
      industryGroupCriteria.criteria.map((c) => {
        const report = reportMap.get(c.key);
        return [
          c.key,
          {
            key: c.key,
            name: c.name,
            summary: c.shortDescription,
            scores:
              report?.performanceChecklistEvaluation?.performanceChecklistItems.map((pc) => ({
                score: pc.score,
                comment: `${pc.checklistItem}: ${pc.oneLinerExplanation}`,
              })) || [],
          },
        ];
      })
    ) as SpiderGraphForTicker;

    const scorePercent = getSpiderGraphScorePercentage(spiderGraph);
    const colors = getGraphColor(scorePercent);

    return { ...t, scorePercent, colors };
  });

  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <PrivateWrapper>
        <div className="flex justify-end mb-4">
          <Link
            href={'/public-equities/industry-group-criteria/real-estate/equity-real-estate-investment-trusts-reits/create'}
            className="link-color border border-color rounded-xl p-2"
          >
            View Criteria
          </Link>
          <Link href={'/public-equities/tickers/create'} className="link-color border border-color ml-4 rounded-xl p-2">
            Create Ticker
          </Link>
        </div>
      </PrivateWrapper>
      <div className="flex justify-end mb-4">
        <Link href={'/public-equities/tickers/compare-metrics-and-checklist'} className="link-color border border-color rounded-xl p-2">
          Metrics Comparison
        </Link>
      </div>
      <ul role="list" className="divide-y">
        {tickers.length === 0 ? (
          <li className="py-5 text-center italic">No tickers found.</li>
        ) : (
          tickersWithScores.map((ticker) => (
            <li key={ticker.tickerKey} className="flex items-center justify-between gap-x-6 py-5">
              <div className="min-w-0">
                <div className="flex items-center gap-x-3">
                  <p className="text-sm font-semibold heading-color">{ticker.companyName || 'Unknown Company'}</p>
                  <p className="whitespace-nowrap rounded-md px-1.5 py-1 text-xs font-medium ring-1 ring-inset ring-border primary-text-color">
                    {ticker.tickerKey}
                  </p>
                </div>
                <div className="mt-2 flex items-center gap-x-2 text-xs text-color">
                  <p>{ticker.shortDescription || 'No description provided'}</p>
                </div>
              </div>
              <div className="flex flex-none items-center gap-x-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: ticker.colors.lighterBackground, color: ticker.colors.border }}
                >
                  <span className="text-lg font-semibold">{ticker.scorePercent.toFixed(0)}</span>
                </div>
                <Link
                  href={`/public-equities/tickers/${ticker.tickerKey}`}
                  className="rounded-md bg-block-bg-color px-2.5 py-1.5 text-sm font-semibold link-color shadow-sm ring-1 ring-inset ring-border hover:bg-block-bg-color"
                >
                  View Reports
                </Link>
                <PrivateWrapper>
                  <TickerActionsDropdown tickerKey={ticker.tickerKey} />
                </PrivateWrapper>
              </div>
            </li>
          ))
        )}
      </ul>
    </PageWrapper>
  );
}
