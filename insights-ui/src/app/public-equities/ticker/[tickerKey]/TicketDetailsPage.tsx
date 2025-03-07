'use client';

import {
  IndustryGroup,
  Sector,
  TickerReport,
  CreateSingleReportsRequest,
  SpiderGraphForTicker,
  SpiderGraphPie,
  PerformanceChecklistItem,
  CriteriaEvaluation,
} from '@/types/public-equity/ticker-report';
import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { getReportName } from '@/util/report-utils';
import RadarChart from '@/components/ui/RadarChart';
import PrivateWrapper from '@/components/auth/PrivateWrapper';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function TickerDetailsPageWrapper({ tickerKey }: { tickerKey: string }) {
  const [reportExists, setReportExists] = useState(false);
  const [reports, setReports] = useState<CriteriaEvaluation[]>([]);
  const [industryGroup, setIndustryGroup] = useState<IndustryGroup | null>(null);
  const [sector, setSector] = useState<Sector | null>(null);
  const { data: industryGroupCriteria } = useFetchData<{ criteria: { key: string; name: string; shortDescription: string }[] }>(
    `https://dodao-ai-insights-agent.s3.us-east-1.amazonaws.com/public-equities/US/gics/real-estate/equity-real-estate-investment-trusts-reits/custom-criteria.json`,
    {},
    'Failed to fetch criteria data'
  );

  const checkReportExists = async () => {
    const response = await fetch(`https://dodao-ai-insights-agent.s3.us-east-1.amazonaws.com/public-equities/US/tickers/${tickerKey}/latest-10q-report.json`);
    if (response.status === 200) {
      const data: TickerReport = await response.json();
      setReports(data.evaluationsOfLatest10Q || []);
      setIndustryGroup(data.selectedIndustryGroup);
      setSector(data.selectedSector);
      setReportExists(true);
    } else {
      setReports([]);
      setIndustryGroup(null);
      setSector(null);
      setReportExists(false);
    }
  };

  useEffect(() => {
    checkReportExists();
  }, [tickerKey]);

  const { postData, loading } = usePostData<{ message: string }, CreateSingleReportsRequest>({
    errorMessage: 'Failed to create ticker report',
    successMessage: 'Ticker report created successfully',
    redirectPath: `/public-equities/debug/ticker-reports/${tickerKey}`,
  });

  const baseURL = process.env.NEXT_PUBLIC_AGENT_APP_URL?.toString() || '';

  const handleCreateSingleCriterionReport = async (criterionKey: string) => {
    if (!industryGroup || !sector) return;
    postData(`${baseURL}/api/public-equities/US/upsert-ai-criteria`, {
      ticker: tickerKey,
      criterionKey,
      industryGroupId: industryGroup.id,
      sectorId: sector.id,
    });
  };

  const reportMap = new Map(reports.map((report) => [report.criterionKey, report]));

  const spiderGraph: SpiderGraphForTicker = Object.fromEntries(
    reports.map((report): [string, SpiderGraphPie] => {
      const pieData: SpiderGraphPie = {
        key: report.criterionKey,
        name: getReportName(report.criterionKey),
        summary: report.importantMetrics?.status || '',
        scores:
          report.performanceChecklist?.map((pc: PerformanceChecklistItem) => ({
            score: pc.score,
            comment: `${pc.checklistItem}: ${pc.oneLinerExplanation}`,
          })) || [],
      };
      return [report.criterionKey, pieData];
    })
  );

  return (
    <div className="text-color">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto lg:text-center">
          <p className="mt-2 text-pretty text-4xl font-semibold tracking-tight sm:text-5xl">{tickerKey}</p>
          <p className="mt-5">{reportExists ? 'Report Available' : 'No Report Found'}</p>
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
                      <div className="absolute left-0 top-0 flex size-10 items-center justify-center heading-color rounded-lg">
                        <span className="size-6 text-blue-200">📊</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <div className="ml-6 text-xl">{criterion.name}</div>
                        <PrivateWrapper>
                          <IconButton
                            iconName={IconTypes.Reload}
                            tooltip="Create Report"
                            onClick={() => handleCreateSingleCriterionReport(criterion.key)}
                            disabled={loading}
                            loading={loading}
                            variant="text"
                            removeBorder={true}
                            className="link-color pointer-cursor"
                          />
                        </PrivateWrapper>
                      </div>
                      <div className="text-sm py-1">{criterion.shortDescription}</div>
                      {report?.performanceChecklist && (
                        <ul className="list-disc mt-2">
                          {report.performanceChecklist.map((item, index) => (
                            <li key={index} className="mb-1 flex items-start">
                              <span className="mr-2">{item.score > 0 ? '✅' : '❌'}</span>
                              <span>{item.checklistItem}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </dt>
                    <div>
                      <Link href={`/public-equities/ticker/${tickerKey}/criterion/${criterion.key}`} className="link-color text-sm mt-4">
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
  );
}
