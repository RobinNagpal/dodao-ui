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
import { parseMarkdown } from '@/util/parse-markdown';
import SpiderChartFlyoutMenu from './SpiderChartFlyoutMenu';
import {
  ArrowTopRightOnSquareIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  DocumentCurrencyDollarIcon,
  InformationCircleIcon,
  ScaleIcon,
} from '@heroicons/react/20/solid';
import { getGraphColor, getSpiderGraphScorePercentage } from '@/util/radar-chart-utils';
import { safeParseJsonString } from '@/util/safe-parse-json-string';
import TickerNewsSection from './TickerNewsSection';

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

  const spiderGraphScorePercentage = getSpiderGraphScorePercentage(spiderGraph);
  const { border } = getGraphColor(spiderGraphScorePercentage);
  const aboutTicker = safeParseJsonString(tickerReport.tickerInfo);

  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <div className="mx-auto max-w-7xl px-6 lg:px-8 text-color">
        <div className="mx-auto lg:text-center">
          {/* Private Ellipsis */}
          <div className="flex justify-end">
            <PrivateWrapper>
              <TickerActionsDropdown tickerKey={tickerKey} />
            </PrivateWrapper>
          </div>

          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none text-left">
              <h1 className="text-pretty text-2xl font-semibold tracking-tight sm:text-4xl">
                {tickerReport.companyName} ({tickerKey}){' '}
                <a href={aboutTicker.reitWebsiteUrl} target="_blank">
                  <ArrowTopRightOnSquareIcon className="size-8 cursor-pointer inline link-color" />
                </a>
              </h1>

              {/* Ticker Info and Spider Chart Row */}
              <div className="flex flex-col gap-x-5 gap-y-2 lg:flex-row">
                {/* Ticker Info on the left */}
                <div className="lg:w-full lg:max-w-2xl lg:flex-auto">
                  <p className="mt-6">{tickerReport.shortDescription}</p>
                  <p className="mt-6">
                    <span className="markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(aboutTicker.reitInfo ?? 'Not yet populated') }} />
                  </p>
                </div>

                {/* Spider chart on the right */}
                <div className="lg:flex lg:flex-auto lg:justify-center relative">
                  <div className="lg:absolute lg:top-10 lg:left-0 lg:flex lg:items-center lg:w-full lg:h-full">
                    <div className="w-full max-w-lg mx-auto relative">
                      <div className="absolute top-10 right-0 flex space-x-2">
                        <div className="text-2xl font-bold -z-10" style={{ color: border }}>
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
          </div>

          {/* Icons row */}
          <div className="my-8 flex items-center justify-center lg:justify-start space-x-8">
            <div className="flex items-center justify-start space-x-2">
              <span className="block-bg-color rounded-full p-2">
                <CalendarIcon className="size-5" title="Years Since IPO" />
              </span>
              <div>{aboutTicker.yearsSinceIpo}</div>
            </div>

            <div className="flex items-center justify-start space-x-2">
              <span className="block-bg-color rounded-full p-2">
                <BuildingOfficeIcon className="size-5" title="REIT Type" />
              </span>
              <div>{aboutTicker.gicsClassification?.subIndustry ?? 'N/A'}</div>
            </div>

            <div className="flex items-center justify-start space-x-2">
              <span className="block-bg-color rounded-full p-2">
                <DocumentCurrencyDollarIcon className="size-5" title="SEC Latest 10Q Filing" />
              </span>
              <div>
                <a href={tickerReport.latest10QInfo?.filingUrl} target="_blank" className="hover:underline">
                  SEC 10Q
                </a>
              </div>
            </div>

            <div className="flex items-center justify-start space-x-2">
              <span className="block-bg-color rounded-full p-2">
                <ScaleIcon className="size-5" title="Valuation" />
              </span>
              <div>{aboutTicker.valuation ?? 'N/A'}</div>
            </div>
          </div>

          {/* Latest News block */}
          <div className="w-full text-left p-4 block-bg-color rounded-xl flex">
            <span>
              <InformationCircleIcon className="size-5 inline mr-2" title="Latest News" />
            </span>
            <div>
              <span className="markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(aboutTicker.latestNews ?? 'Not yet populated') }} />
            </div>
          </div>

          {/* Reports Section */}
          <div className="border-y border-color my-8">
            <div className="font-semibold text-xl text-center my-5">Analysis Reports</div>
          </div>
          <div className="mx-auto mt-12 text-left">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-8 md:max-w-none md:grid-cols-2">
              {industryGroupCriteria?.criteria?.map((criterion) => {
                const report = reportMap.get(criterion.key);
                return (
                  <div key={criterion.key} className="relative text-left block-bg-color p-4 rounded-xl">
                    <dt className="my-2">
                      <div className="flex items-center font-semibold">
                        <span className="text-lg">📄</span>
                        <div className="ml-2 text-xl">{criterion.name}</div>
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
                    <div className="absolute bottom-0 right-0 p-4">
                      <Link href={`/public-equities/tickers/${tickerKey}/criteria/${criterion.key}`} className="link-color text-sm mt-4 font-semibold">
                        See Full Report &rarr;
                      </Link>
                    </div>
                  </div>
                );
              })}
            </dl>
          </div>

          {/* News section */}
          <div className="border-y border-color my-8">
            <div className="font-semibold text-xl text-center my-5">News</div>
          </div>
          <TickerNewsSection articles={aboutTicker.tickerNews?.articles ?? []} />
        </div>
      </div>
    </PageWrapper>
  );
}
