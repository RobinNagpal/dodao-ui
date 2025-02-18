import ReportDebugPage from '@/components/projects/ReportDebugPage';
import { ReportInterface } from '@/types/project/project';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import React from 'react';

export default async function DebugReportPage({ params }: { params: Promise<{ reportType: string }> }) {
  const { reportType } = await params;

  const res = await fetch(`${getBaseUrl()}/api/crowd-funding/debug/reports/${reportType}`);
  const data = await res.json();

  const reportsData: Record<string, ReportInterface> = {};
  data.projects.forEach((project: { projectId: string; report: ReportInterface | null }) => {
    if (project.report) {
      reportsData[project.projectId] = project.report;
    }
  });

  return (
    <div>
      <ReportDebugPage reportsData={reportsData} reportType={reportType} />
    </div>
  );
}
