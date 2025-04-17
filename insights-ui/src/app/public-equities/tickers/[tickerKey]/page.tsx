import PrivateWrapper from '@/components/auth/PrivateWrapper';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import RadarChart from '@/components/visualizations/RadarChart';
import { IndustryGroupCriteriaDefinition } from '@/types/public-equity/criteria-types';
import {
  FullCriterionEvaluation,
  FullNestedTickerReport,
  PerformanceChecklistItem,
  SpiderGraphForTicker,
  SpiderGraphPie,
} from '@/types/public-equity/ticker-report-types';
import { getReportName } from '@/util/report-utils';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import Link from 'next/link';
import TickerActionsDropdown from './TickerActionsDropdown';
import { Metadata } from 'next';
import PopulateLatest10QInfoButton from './PopulateLatest10QInfoButton';

export async function generateMetadata({ params }: { params: Promise<{ tickerKey: string }> }): Promise<Metadata> {
  const { tickerKey } = await params;

  const tickerResponse = await fetch(`${getBaseUrl()}/api/tickers/${tickerKey}`, { cache: 'no-cache' });
  let tickerData: FullNestedTickerReport | null = null;

  if (tickerResponse.ok) {
    tickerData = await tickerResponse.json();
  }

  const companyName = tickerData?.companyName ?? tickerKey;
  const shortDescription = `Financial analysis and reports for ${companyName} (${tickerKey}). Explore key metrics, insights, and AI-driven evaluations to make informed investment decisions.`;
  const canonicalUrl = `https://koalagains.com/public-equities/tickers/${tickerKey}`;
  const dynamicKeywords = [
    companyName,
    `Analysis on ${companyName}`,
    `Financial Analysis on ${companyName}`,
    `Reports on ${companyName}`,
    `${companyName} REIT analysis`,
    'investment insights',
    'public equities',
    'KoalaGains',
  ];

  return {
    title: `${companyName} (${tickerKey}) | KoalaGains`,
    description: shortDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${companyName} (${tickerKey}) | KoalaGains`,
      description: shortDescription,
      url: canonicalUrl,
      siteName: 'KoalaGains',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${companyName} (${tickerKey}) | KoalaGains`,
      description: shortDescription,
    },
    keywords: dynamicKeywords,
  };
}

export default async function TickerDetailsPage({ params }: { params: Promise<{ tickerKey: string }> }) {
  const { tickerKey } = await params;

  const criteriaResponse = await fetch(
    `https://dodao-ai-insights-agent.s3.us-east-1.amazonaws.com/public-equities/US/gics/real-estate/equity-real-estate-investment-trusts-reits/custom-criteria.json`,
    { cache: 'no-cache' }
  );

  const industryGroupCriteria: IndustryGroupCriteriaDefinition = (await criteriaResponse.json()) as IndustryGroupCriteriaDefinition;
  const tickerResponse = await fetch(`${getBaseUrl()}/api/tickers/${tickerKey}`, { cache: 'no-cache' });

  const tickerReport = (await tickerResponse.json()) as FullNestedTickerReport;
  const breadcrumbs: BreadcrumbsOjbect[] = [
    {
      name: 'Public Equities',
      href: `/public-equities/tickers`,
      current: false,
    },
    {
      name: tickerKey,
      href: `/public-equities/tickers/${tickerKey}}`,
      current: true,
    },
  ];
  const reports: FullCriterionEvaluation[] = tickerReport.evaluationsOfLatest10Q || [];
  const reportMap = new Map(reports.map((report) => [report.criterionKey, report]));
  const spiderGraph: SpiderGraphForTicker = Object.fromEntries(
    industryGroupCriteria.criteria.map((criterion) => {
      const report = reportMap.get(criterion.key);
      const pieData: SpiderGraphPie = {
        key: criterion.key,
        name: getReportName(criterion.key),
        summary: criterion.shortDescription,
        scores:
          report?.performanceChecklistEvaluation?.performanceChecklistItems?.map((pc: PerformanceChecklistItem) => ({
            score: pc.score,
            comment: `${pc.checklistItem}: ${pc.oneLinerExplanation}`,
          })) || [],
      };
      return [criterion.key, pieData];
    })
  );

  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <div className="text-color">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto lg:text-center">
            <div className="flex justify-end">
              <PrivateWrapper>
                <TickerActionsDropdown tickerKey={tickerKey} />
              </PrivateWrapper>
            </div>
            <h1 className="mt-2 text-pretty text-4xl font-semibold tracking-tight sm:text-5xl">
              {tickerReport.companyName} ({tickerKey})
            </h1>
            <h2 className="mt-5 whitespace-pre-line">{tickerReport.shortDescription}</h2>
            <div className="max-w-lg mx-auto">
              <RadarChart data={spiderGraph} />
            </div>
            {tickerReport.latest10QInfo ? (
              <div className="border-b border-gray-100 text-left">
                <dl className="divide-y text-color">
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium">Reporting Period</dt>
                    <dd className="mt-1 text-sm/6 sm:col-span-2 sm:mt-0">{tickerReport.latest10QInfo.periodOfReport}</dd>
                  </div>
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium">SEC 10Q Filing Link</dt>
                    <dd className="mt-1 text-sm/6 sm:col-span-2 sm:mt-0">{tickerReport.latest10QInfo.filingUrl}</dd>
                  </div>
                </dl>
              </div>
            ) : (
              <PrivateWrapper>
                <PopulateLatest10QInfoButton tickerKey={tickerKey} />
              </PrivateWrapper>
            )}
            <div className="mx-auto mt-12 text-left">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-8 lg:max-w-none lg:grid-cols-2">
                {industryGroupCriteria?.criteria?.map((criterion) => {
                  const report = reportMap.get(criterion.key);
                  return (
                    <div key={criterion.key} className="relative text-left">
                      <dt>
                        <div className="absolute left-0 top-0 flex items-center justify-center heading-color rounded-lg">
                          <span className=" text-blue-200">📊</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <div className="ml-6 text-xl">{criterion.name}</div>
                        </div>
                        <div className="text-sm py-1">{criterion.shortDescription}</div>
                        {report?.performanceChecklistEvaluation && (
                          <ul className="list-disc mt-2">
                            {report.performanceChecklistEvaluation?.performanceChecklistItems?.map((item, index) => (
                              <li key={index} className="mb-1 flex items-start">
                                <span className="mr-2">{item.score > 0 ? '✅' : '❌'}</span>
                                <span>{item.checklistItem}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </dt>
                      <div>
                        <Link href={`/public-equities/tickers/${tickerKey}/criteria/${criterion.key}`} className="link-color text-sm mt-4">
                          See Full Report &rarr;
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
