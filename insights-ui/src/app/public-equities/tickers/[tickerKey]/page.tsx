import Breadcrumbs from '@/components/ui/Breadcrumbs';
import RadarChart from '@/components/visualizations/RadarChart';
import { IndustryGroupCriteriaDefinition } from '@/types/public-equity/criteria-types';
import {
  FullCriterionEvaluation,
  FullNestedTickerReport,
  LinkedinProfile,
  PerformanceChecklistItem,
  SpiderGraphForTicker,
  SpiderGraphPie,
} from '@/types/public-equity/ticker-report-types';
import { getReportName } from '@/util/report-utils';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import Link from 'next/link';
import { Metadata } from 'next';
import { parseMarkdown } from '@/util/parse-markdown';
import SpiderChartFlyoutMenu from './SpiderChartFlyoutMenu';
import {
  ArrowTopRightOnSquareIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  CheckIcon,
  DivideIcon,
  DocumentCurrencyDollarIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
  PresentationChartLineIcon,
  ScaleIcon,
  SparklesIcon,
  UserGroupIcon,
} from '@heroicons/react/20/solid';
import { getGraphColor, getSpiderGraphScorePercentage } from '@/util/radar-chart-utils';
import { safeParseJsonString } from '@/util/safe-parse-json-string';
import TickerNewsSection from './TickerNewsSection';
import { getDateAsDDMonthYYYYFormat, getTimeAgo } from '@/util/get-date';

export async function generateMetadata({ params }: { params: Promise<{ tickerKey: string }> }): Promise<Metadata> {
  const { tickerKey } = await params;

  const tickerResponse = await fetch(`${getBaseUrl()}/api/tickers/${tickerKey}?page=tickerDetailsPage`, { cache: 'no-cache' });
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
  const tickerResponse = await fetch(`${getBaseUrl()}/api/tickers/${tickerKey}?page=tickerDetailsPage`, { cache: 'no-cache' });

  const tickerReport = (await tickerResponse.json()) as FullNestedTickerReport;
  const breadcrumbs: BreadcrumbsOjbect[] = [
    {
      name: 'Public Equities',
      href: `/public-equities/tickers`,
      current: false,
    },
    {
      name: tickerKey,
      href: `/public-equities/tickers/${tickerKey}`,
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
  const managementTeam = (tickerReport.managementTeam as LinkedinProfile[]) || [];

  const lastYearFFO = aboutTicker.financials?.ffoPerShare.ffoPerShareLastYear ?? 0;
  const currentYearFFO = aboutTicker.financials?.ffoPerShare.ffoPerShareCurrentYear ?? 0;

  // avoid division by zero
  const deltaPct = lastYearFFO !== 0 ? ((currentYearFFO - lastYearFFO) / lastYearFFO) * 100 : currentYearFFO;

  // format it with a +/− and two decimals
  const sign = deltaPct > 0 ? '+' : '';
  const ffoYoYChange = `${sign}${deltaPct.toFixed(2)}`;

  const priceToFFO =
    tickerReport.evaluationsOfLatest10Q
      ?.find((r) => r.criterionKey === 'operations_expense_management')
      ?.importantMetricsEvaluation.metrics.find((m) => m.metricKey === 'price_to_ffo')?.value ?? 'N/A';

  const dividends = aboutTicker.dividends?.dividends.results ?? [];

  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8 text-color lg:text-center">
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
                    <div className="absolute top-20 right-0 flex space-x-2">
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
        <div className="my-4 sm:my-6 lg:my-8 grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 lg:gap-4">
          <div className="flex items-center justify-start space-x-1 sm:space-x-2">
            <span className="block-bg-color rounded-full p-1 sm:p-1.5">
              <CalendarIcon className="size-3.5 sm:size-4" title="Years Since IPO" />
            </span>
            <div className="text-sm sm:text-base">{aboutTicker.yearsSinceIpo}</div>
          </div>

          <div className="flex items-center justify-start space-x-1 sm:space-x-2">
            <span className="block-bg-color rounded-full p-1 sm:p-1.5">
              <BuildingOfficeIcon className="size-3.5 sm:size-4" title="REIT Type" />
            </span>
            <div className="text-sm sm:text-base truncate">{aboutTicker.gicsClassification?.subIndustry ?? 'N/A'}</div>
          </div>

          <div className="flex items-center justify-start space-x-1 sm:space-x-2">
            <span className="block-bg-color rounded-full p-1 sm:p-1.5">
              <DocumentCurrencyDollarIcon className="size-3.5 sm:size-4" title="SEC Latest 10Q Filing" />
            </span>
            <div className="text-sm sm:text-base">
              <a href={tickerReport.latest10QInfo?.filingUrl} target="_blank" className="hover:underline link-color">
                SEC 10Q
              </a>
            </div>
          </div>

          <div className="flex items-center justify-start space-x-1 sm:space-x-2">
            <span className="block-bg-color rounded-full p-1 sm:p-1.5">
              <UserGroupIcon className="size-3.5 sm:size-4" title="Occupancy Rate" />
            </span>
            <div className="text-sm sm:text-base">{aboutTicker.occupancyRate ?? 'N/A'}</div>
          </div>

          <div className="flex items-center justify-start space-x-1 sm:space-x-2">
            <span className="block-bg-color rounded-full p-1 sm:p-1.5">
              <ScaleIcon className="size-3.5 sm:size-4" title="Valuation" />
            </span>
            <div className="text-sm sm:text-base">{aboutTicker.valuation ?? 'N/A'}</div>
          </div>
        </div>

        {/* Latest News block */}
        <div className="w-full text-left p-2 sm:p-3 md:p-4 block-bg-color rounded-xl">
          <div className="flex items-start">
            <InformationCircleIcon className="size-4 sm:size-5 flex-shrink-0 mt-1 mr-1.5 sm:mr-2" title="Latest News" />
            <div className="min-w-0 flex-1">
              <span className="markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(aboutTicker.latestNews ?? 'Not yet populated') }} />
            </div>
          </div>
        </div>

        {/* Business Model Section */}
        <div className="font-semibold text-xl text-left my-6">Business Model & Competitive Edge</div>
        <div className="w-full py-2 text-left block-bg-color rounded-xl flex flex-col">
          <InfoBlock heading="Business Model" content={aboutTicker.businessModel?.businessModel} IconComponent={BriefcaseIcon} />
          <InfoBlock heading="Uniqueness" content={aboutTicker.businessModel?.uniqueness} IconComponent={SparklesIcon} />
          <InfoBlock heading="Competitive Edge" IconComponent={PresentationChartLineIcon}>
            {aboutTicker.businessModel?.competitiveEdge &&
              aboutTicker.businessModel?.competitiveEdge.map((ce: string, i: number) => (
                <div key={i + '_competitiveEdge'} className="w-full text-left px-2 sm:px-3 md:px-4 block-bg-color rounded-xl flex">
                  <span>
                    <CheckIcon className="size-5 inline mr-2" />
                  </span>
                  <div className="markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(ce ?? 'Not yet populated') }} />
                </div>
              ))}
          </InfoBlock>
          <InfoBlock heading="Potential Risks" content={aboutTicker.businessModel?.risks} IconComponent={ExclamationTriangleIcon} />
        </div>

        {/* Financials Section */}
        <div className="font-semibold text-xl text-left my-4 sm:my-5 md:my-6">Financials</div>
        <div className="flex flex-col-reverse lg:flex-row lg:max-h-[25vh] gap-5">
          <div className="w-full md:w-1/2">
            <div className="h-full block-bg-color rounded-lg overflow-auto">
              <div className="inline-block min-w-full p-1 align-middle">
                <table className="min-w-full divide-y divide-gray-500">
                  <thead>
                    <tr className="text-center text-sm font-semibold sticky top-0 block-bg-color">
                      <th scope="col" className="px-2 py-3.5">
                        Ex Dividend
                      </th>
                      <th scope="col" className="px-2 py-3.5">
                        Payment
                      </th>
                      <th scope="col" className="px-2 py-3.5">
                        Dividend
                      </th>
                      <th scope="col" className="px-2 py-3.5">
                        Diff
                      </th>
                      <th scope="col" className="px-2 py-3.5">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-500">
                    {dividends.map((tx: any, idx: number) => {
                      const currentAmt = parseFloat(tx.cash_amount);
                      // “previous” in time is the next element in the array
                      const nextTx = idx < dividends.length - 1 ? dividends[idx + 1] : null;
                      const nextAmt = nextTx ? parseFloat(nextTx.cash_amount) : null;

                      const diffPct = nextAmt && nextAmt !== 0 ? ((currentAmt - nextAmt) / nextAmt) * 100 : null;

                      const diffDisplay = diffPct !== null ? `${diffPct > 0 ? '+' : ''}${diffPct.toFixed(1)}%` : '–';

                      const status = getDividendStatus(tx.ex_dividend_date, tx.pay_date);

                      return (
                        <tr key={tx.id} className="text-center text-sm">
                          <td className="p-2">
                            <div>{getDateAsDDMonthYYYYFormat(tx.ex_dividend_date)}</div>
                            <div className="text-sm text-gray-500">{getTimeAgo(tx.ex_dividend_date)}</div>
                          </td>
                          <td className="p-22font-medium">
                            <div>{getDateAsDDMonthYYYYFormat(tx.pay_date)}</div>
                            <div className="text-sm text-gray-500">{getTimeAgo(tx.pay_date)}</div>
                          </td>
                          <td className="p-2">${tx.cash_amount}</td>
                          <td className="p-2">
                            <span
                              className={
                                diffPct != null && diffPct > 0 ? 'text-green-600 font-medium' : diffPct != null && diffPct < 0 ? 'text-red-600 font-medium' : ''
                              }
                            >
                              {diffDisplay}
                            </span>
                          </td>
                          <td className="p-2">
                            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full text-color ${getStatusClasses(status)}`}>{status}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2 px-4">
            <div className="grid grid-cols-2 grid-rows-2 gap-4 overflow-auto text-left">
              <div className="border-l-2 border-color pl-3 sm:pl-4 md:pl-6 py-2 sm:py-3 md:py-4">
                <div className="font-semibold text-xl sm:text-2xl md:text-3xl mb-1 sm:mb-2">{priceToFFO}</div>
                <div className="text-sm sm:text-base">Price To FFO</div>
              </div>
              <div className="border-l-2 border-color pl-3 sm:pl-4 md:pl-6 py-2 sm:py-3 md:py-4">
                <div className="font-semibold text-xl sm:text-2xl md:text-3xl mb-1 sm:mb-2">{aboutTicker.financials?.priceToBook ?? 'N/A'} x</div>
                <div className="text-sm sm:text-base">Price To Book (P/B)</div>
              </div>
              <div className="border-l-2 border-color pl-3 sm:pl-4 md:pl-6 py-2 sm:py-3 md:py-4">
                <div className="font-semibold text-xl sm:text-2xl md:text-3xl mb-1 sm:mb-2">{aboutTicker.financials?.averageDividendYield ?? 'N/A'} %</div>
                <div className="text-sm sm:text-base">Average Dividend Yield</div>
              </div>
              <div className="border-l-2 border-color pl-3 sm:pl-4 md:pl-6 py-2 sm:py-3 md:py-4">
                <div className="font-semibold text-xl sm:text-2xl md:text-3xl mb-1 sm:mb-2">{ffoYoYChange} %</div>
                <div className="text-sm sm:text-base">{lastYearFFO !== 0 ? 'FFO/share 1yr Diff' : 'FFO/share'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Reports Section */}
        <div className="font-semibold text-xl text-left my-4 sm:my-5 md:my-6">Analysis Reports</div>
        <div className="mx-auto text-left">
          <dl className="grid max-w-xl grid-cols-1 gap-x-4 gap-y-4 sm:gap-x-6 sm:gap-y-6 md:gap-x-8 md:gap-y-8 md:max-w-none md:grid-cols-2">
            {industryGroupCriteria?.criteria?.map((criterion) => {
              const report = reportMap.get(criterion.key);
              return (
                <div key={criterion.key} className="relative text-left block-bg-color p-2 sm:p-3 md:p-4 rounded-xl">
                  <dt className="mt-2 mb-5">
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
        <div className="font-semibold text-xl text-left my-6">News</div>
        <TickerNewsSection articles={aboutTicker.tickerNews?.articles ?? []} />

        {/* Management Team */}
        {managementTeam.length > 0 && (
          <div className="mb-8">
            <div className="font-semibold text-xl text-left my-4 sm:my-5 md:my-6">{tickerKey}&apos;s Management Team</div>
            <div className="mx-auto">
              <ul role="list" className="flex flex-wrap justify-center gap-10">
                {managementTeam.map((member) => (
                  <li key={member.fullName} className="flex flex-col items-center">
                    <img
                      alt={member.fullName}
                      src={member.profilePicUrl != null ? member.profilePicUrl : '/dummy-avatar.svg'}
                      className="mx-auto size-32 rounded-full"
                    />
                    <div className="flex items-center mt-6">
                      <h3 className="text-base/7 font-semibold tracking-tight mr-2">{member.fullName}</h3>
                      <a href={`https://www.linkedin.com/in/${member.publicIdentifier}`} target="_blank" title="LinkedIn Url">
                        <ArrowTopRightOnSquareIcon className="size-5 cursor-pointer inline link-color" />
                      </a>
                    </div>
                    <p className="text-sm/6 text-center max-w-xs whitespace-normal break-words">{member.occupation}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-full text-left p-2 sm:p-3 md:p-4 my-3 sm:my-4 md:my-5 block-bg-color rounded-xl">
              <div className="flex items-start">
                <InformationCircleIcon className="size-4 sm:size-5 flex-shrink-0 mt-1 mr-1.5 sm:mr-2" />
                <div className="min-w-0 flex-1">
                  <span
                    className="markdown-body"
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(aboutTicker.managementTeamAssessment?.message ?? 'Not yet populated') }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Further info section */}
        <div className="font-semibold text-xl text-left my-4 sm:my-5 md:my-6">More Info About {tickerKey}</div>
        <div className="flex flex-col space-y-2">
          <InfoBlock heading="Dividend Profile" content={aboutTicker.dividendProfile} IconComponent={DivideIcon} />

          <InfoBlock heading="5-Year Outlook" content={aboutTicker.outlook} IconComponent={MagnifyingGlassIcon} />

          <InfoBlock heading="Tailwinds" content={aboutTicker.tailwinds} IconComponent={ArrowTrendingUpIcon} />

          <InfoBlock heading="Headwinds" content={aboutTicker.headwinds} IconComponent={ArrowTrendingDownIcon} />
        </div>
      </div>
    </PageWrapper>
  );
}

interface InfoBlockProps {
  heading: string;
  content?: string;
  IconComponent: React.ComponentType<{ className?: string }>;
  IconClasses?: string;
  children?: React.ReactNode;
}

function InfoBlock({ heading, content, children, IconComponent, IconClasses }: InfoBlockProps): JSX.Element {
  return (
    <div className="text-left block-bg-color px-2 sm:px-3 md:px-4 py-2 rounded-lg">
      <div className="flex items-center justify-start">
        <IconComponent className={IconClasses ?? 'h-5 w-5 mr-1.5 sm:mr-2'} />
        <div className="font-semibold my-1 sm:my-2">{heading}</div>
      </div>

      <div className="px-2 sm:px-3 md:px-4">
        {children ? (
          children
        ) : (
          <div
            className="markdown-body"
            dangerouslySetInnerHTML={{
              __html: parseMarkdown(content ?? 'Not yet populated'),
            }}
          />
        )}
      </div>
    </div>
  );
}

function getDividendStatus(exDateStr: string, payDateStr: string): 'Announced' | 'Unpaid' | 'Paid' | 'Unknown' {
  const now = new Date();
  const exDate = new Date(exDateStr);
  const payDate = new Date(payDateStr);

  if (exDate > now && payDate > now) {
    return 'Announced';
  }
  if (exDate <= now && payDate > now) {
    return 'Unpaid';
  }
  if (exDate <= now && payDate <= now) {
    return 'Paid';
  }
  return 'Unknown';
}

function getStatusClasses(status: string) {
  switch (status) {
    case 'Paid':
      return 'bg-green-600';
    case 'Announced':
      return 'bg-cyan-600';
    case 'Unpaid':
      return 'bg-yellow-100';
    default:
      return 'bg-gray-100';
  }
}
