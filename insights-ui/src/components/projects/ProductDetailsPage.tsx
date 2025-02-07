import ProjectActionsDropdown from '@/components/projects/ProjectActionsDropdown';
import ReportActionsDropdown from '@/components/reports/ReportActionsDropdown';
import { ProjectDetails, REPORT_TYPES_TO_DISPLAY, ReportInterfaceWithType, SpiderGraph, SpiderGraphPie } from '@/types/project/project';
import { getReportName } from '@/util/report-utils';
import Link from 'next/link';
import React from 'react';
import RadarChart from '../ui/RadarChart';
import PrivateWrapper from '../auth/PrivateWrapper';

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

  const spiderGraph: SpiderGraph = Object.fromEntries(
    reports.map((report): [string, SpiderGraphPie] => {
      const pieData: SpiderGraphPie = {
        key: report.type,
        name: getReportName(report.type),
        // Sum of all scores in the report
        scores: report.performanceChecklist.map((pc) => ({ score: pc.score, comment: pc.checklistItem })),
      };
      return [report.type, pieData];
    })
  );

  console.log('projectDetails.reports', JSON.stringify(projectDetails.reports, null, 2));
  return (
    <div className="py-24 sm:py-32 text-color">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto  lg:text-center">
          <div className="flex justify-end">
            <PrivateWrapper>
              <ProjectActionsDropdown projectId={projectId} />
            </PrivateWrapper>
          </div>
          <p className="mt-2 text-pretty text-4xl font-semibold tracking-tight sm:text-5xl">{initialProjectDetails.name}</p>
          <div className="max-w-lg mx-auto">
            <RadarChart data={spiderGraph} />
          </div>
          <div className="mt-6 border-t border-gray-100 text-left">
            <dl className="divide-y text-color">
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm/6 font-medium ">Crowd Funding Link</dt>
                <dd className="mt-1 text-sm/6  sm:col-span-2 sm:mt-0">{initialProjectDetails.projectInfoInput.crowdFundingUrl}</dd>
              </div>
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm/6 font-medium ">Website Link</dt>
                <dd className="mt-1 text-sm/6 sm:col-span-2 sm:mt-0">{initialProjectDetails.projectInfoInput.websiteUrl}</dd>
              </div>
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm/6 font-medium ">SEC Filing Link</dt>
                <dd className="mt-1 text-sm/6 sm:col-span-2 sm:mt-0">{initialProjectDetails.projectInfoInput.secFilingUrl}</dd>
              </div>
              {initialProjectDetails.projectInfoInput.additionalUrls && (
                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                  <dt className="text-sm/6 font-medium ">Additional Links</dt>
                  {initialProjectDetails.projectInfoInput.additionalUrls.map((url, index) => (
                    <dd key={index} className="mt-1 text-sm/6 sm:col-span-2 sm:mt-0">
                      {url}
                    </dd>
                  ))}
                </div>
              )}
            </dl>
          </div>
          <div className="mx-auto mt-16 sm:mt-20 lg:mt-24 text-left">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
              {REPORT_TYPES_TO_DISPLAY.map((reportType) => {
                const report = projectDetails.reports[reportType];
                return (
                  <div key={reportType} className="relative text-left">
                    <dt>
                      <div className="absolute left-0 top-0 flex size-10 items-center justify-center heading-color rounded-lg">
                        <span aria-hidden="true" className="size-6">
                          📊
                        </span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <div className="ml-6 text-xl">{getReportName(reportType)}</div>
                        <PrivateWrapper>
                          <ReportActionsDropdown projectId={projectId} report={{ ...report, type: reportType }} />
                        </PrivateWrapper>
                      </div>
                      <div className="text-sm py-1">{report.summary}</div>
                    </dt>
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
