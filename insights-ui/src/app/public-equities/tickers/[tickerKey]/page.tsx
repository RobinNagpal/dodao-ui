import Breadcrumbs from '@/components/ui/Breadcrumbs';
import RadarChart from '@/components/ui/RadarChart';
import { IndustryGroupCriteriaDefinition } from '@/types/public-equity/criteria-types';
import { CriterionEvaluation, PerformanceChecklistItem, SpiderGraphForTicker, SpiderGraphPie, TickerReport } from '@/types/public-equity/ticker-report-types';
import { getReportName } from '@/util/report-utils';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import Link from 'next/link';

export default async function TickerDetailsPage({ params }: { params: Promise<{ tickerKey: string }> }) {
  const { tickerKey } = await params;

  const criteriaResponse = await fetch(
    `https://dodao-ai-insights-agent.s3.us-east-1.amazonaws.com/public-equities/US/gics/real-estate/equity-real-estate-investment-trusts-reits/custom-criteria.json`,
    { cache: 'no-cache' }
  );
  const industryGroupCriteria: IndustryGroupCriteriaDefinition = (await criteriaResponse.json()) as IndustryGroupCriteriaDefinition;
  const tickerResponse = await fetch(
    `https://dodao-ai-insights-agent.s3.us-east-1.amazonaws.com/public-equities/US/tickers/${tickerKey}/latest-10q-report.json`,
    { cache: 'no-cache' }
  );

  const tickerReport = (await tickerResponse.json()) as TickerReport;
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
  const reports: CriterionEvaluation[] = tickerReport.evaluationsOfLatest10Q || [];
  const reportMap = new Map(reports.map((report) => [report.criterionKey, report]));
  const spiderGraph: SpiderGraphForTicker = Object.fromEntries(
    reports.map((report): [string, SpiderGraphPie] => {
      const pieData: SpiderGraphPie = {
        key: report.criterionKey,
        name: getReportName(report.criterionKey),
        summary: report.importantMetrics?.status || '',
        scores:
          report.performanceChecklistEvaluation?.performanceChecklist?.map((pc: PerformanceChecklistItem) => ({
            score: pc.score,
            comment: `${pc.checklistItem}: ${pc.oneLinerExplanation}`,
          })) || [],
      };
      return [report.criterionKey, pieData];
    })
  );

  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <div className="text-color">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto lg:text-center">
            <p className="mt-2 text-pretty text-4xl font-semibold tracking-tight sm:text-5xl">{tickerKey}</p>
            <div className="max-w-lg mx-auto">
              <RadarChart data={spiderGraph} />
            </div>
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
                            {report.performanceChecklistEvaluation?.performanceChecklist?.map((item, index) => (
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
