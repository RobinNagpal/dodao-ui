import ProjectActionsDropdown from '@/components/projects/ProjectActionsDropdown';
import ReportActionsDropdown from '@/components/reports/ReportActionsDropdown';
import { ProjectDetails, REPORT_TYPES_TO_DISPLAY, ReportInterfaceWithType, ReportType, SpiderGraph, SpiderGraphPie } from '@/types/project/project';
import { getReportName } from '@/util/report-utils';
import Link from 'next/link';
import React from 'react';
import RadarChart from '../visualizations/RadarChart';
import PrivateWrapper from '../auth/PrivateWrapper';
import ProjectInfoTable from './ProjectInfoTable';
import { getSpiderGraphScorePercentage } from '@/util/radar-chart-utils';

interface ProjectDetailPageProps {
  projectId: string;
  initialProjectDetails: ProjectDetails;
  projectDetails: ProjectDetails;
}

export default function ProjectDetailPage({ projectId, initialProjectDetails, projectDetails }: ProjectDetailPageProps) {
  const reports: ReportInterfaceWithType[] = REPORT_TYPES_TO_DISPLAY.map(
    (r): ReportInterfaceWithType => ({
      ...projectDetails.reports?.[r],
      type: r,
    })
  );
  const reportIcons: { [key in ReportType]: string } = {
    founder_and_team: '👨‍💼', // People/Team
    market_opportunity: '📈', // Growth/Market
    traction: '🚀', // Growth/Success
    execution_and_speed: '⏱️', // Speed/Execution
    valuation: '💰', // Finance/Value
    financial_health: '📊',
    [ReportType.GENERAL_INFO]: '',
    [ReportType.RELEVANT_LINKS]: '',
  };

  const spiderGraph: SpiderGraph = Object.fromEntries(
    reports.map((report): [string, SpiderGraphPie] => {
      const pieData: SpiderGraphPie = {
        key: report.type,
        name: getReportName(report.type),
        summary: report.summary || '',
        // Sum of all scores in the report
        scores: report.performanceChecklist?.map((pc) => ({ score: pc.score, comment: pc.checklistItem })) || [],
      };
      return [report.type, pieData];
    })
  );

  const spiderGraphScorePercentage = getSpiderGraphScorePercentage(spiderGraph);

  return (
    <div className="text-color">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto  lg:text-center">
          <div className="flex justify-end">
            <PrivateWrapper>
              <ProjectActionsDropdown projectId={projectId} />
            </PrivateWrapper>
          </div>
          <h1 className="mt-2 text-pretty text-4xl font-semibold tracking-tight sm:text-5xl">{initialProjectDetails.name}</h1>
          <p className="mt-5 whitespace-pre-line">{initialProjectDetails.processedProjectInfo?.startupSummary}</p>
          <div className="max-w-lg mx-auto">
            <RadarChart data={spiderGraph} scorePercentage={spiderGraphScorePercentage} />
          </div>
          <ProjectInfoTable initialProjectDetails={initialProjectDetails} />
          <div className="mx-auto mt-12 text-left">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-8 lg:max-w-none lg:grid-cols-2 ">
              {REPORT_TYPES_TO_DISPLAY.map((reportType) => {
                const report = projectDetails.reports[reportType];
                return (
                  <div key={reportType} className="relative text-left">
                    <dt>
                      <div className="absolute left-0 top-0 flex items-center justify-center heading-color rounded-lg">
                        <span aria-hidden="true" className="text-blue-200">
                          {reportIcons[reportType]}
                        </span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <h2 className="ml-6 text-xl">{getReportName(reportType)}</h2>
                        <PrivateWrapper>
                          <ReportActionsDropdown projectId={projectId} report={{ ...report, type: reportType }} reportType={reportType} />
                        </PrivateWrapper>
                      </div>
                      {report && <div className="text-sm py-1">{report.summary}</div>}
                    </dt>
                    {report && report.performanceChecklist && report.performanceChecklist.length > 0 && (
                      <>
                        <dd className="text-color text-sm">
                          {report.performanceChecklist?.length && (
                            <ul className="list-disc mt-2">
                              {report.performanceChecklist.map((item, index) => (
                                <li key={index} className="mb-1 flex items-start">
                                  <span className="mr-2">{item.score === 1 ? '✅' : '❌'}</span>
                                  <span>{item.checklistItem}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </dd>
                        <div>
                          <Link href={`/crowd-funding/projects/${projectId}/reports/${reportType}`} className="link-color text-sm mt-4">
                            See Full Report &rarr;
                          </Link>
                        </div>
                      </>
                    )}{' '}
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
