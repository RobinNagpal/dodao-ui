import ReportDebugPage from '@/components/projects/ReportDebugPage';
import { ReportInterface } from '@/types/project/project';
import { ProjectInfoAndReport } from '@/types/project/report';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import React from 'react';
import { assertValidCrowdFundingPageParams } from '@/utils/crowd-funding-param-utils';

export default async function DebugReportPage({ params }: { params: Promise<{ reportType: string }> }) {
  const { reportType } = await params;
  assertValidCrowdFundingPageParams({ reportType });

  const res = await fetch(`${getBaseUrl()}/api/crowd-funding/debug/reports/${reportType}`);
  const data = (await res.json()) as ProjectInfoAndReport[];

  return (
    <div>
      <ReportDebugPage reportsData={data} reportType={reportType} />
    </div>
  );
}
