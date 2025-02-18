'use client';

import { REPORT_TYPES_TO_DISPLAY } from '@/types/project/project';
import { ProjectInfoAndReport } from '@/types/project/report';
import { regenerateAReportOfAllProjects } from '@/util/regenerate-report-of-all-projects';
import Button from '@dodao/web-core/components/core/buttons/Button';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import Link from 'next/link';

interface ReportDebugPageProps {
  reportsData: ProjectInfoAndReport[];
  reportType: string;
}

export default function ReportDebugPage({ reportsData, reportType }: ReportDebugPageProps) {
  return (
    <PageWrapper>
      <div className="text-color">
        <div>Choose a report to debug:</div>
        {REPORT_TYPES_TO_DISPLAY.map((type) => (
          <Link href={`/crowd-funding/debug/reports/${type}`} key={type}>
            <div className="link-color hover:underline">{type}</div>
          </Link>
        ))}
      </div>

      <div className="w-full flex justify-end gap-5">
        <Button
          className=""
          onClick={() =>
            regenerateAReportOfAllProjects(
              reportsData.map((proj) => proj.projectId),
              'gpt-4o',
              reportType
            )
          }
        >
          Retrigger For All Projects with GPT 4o
        </Button>
        <Button
          className=""
          onClick={() =>
            regenerateAReportOfAllProjects(
              reportsData.map((proj) => proj.projectId),
              'gpt-4o-mini',
              reportType
            )
          }
        >
          Retrigger For All Projects with GPT 4o-mini
        </Button>
      </div>

      <div className="max-w-6xl mx-auto text-color">
        <table className="w-full">
          <thead>
            <tr className="w-full">
              <th>Project Id</th>
              <th>Project Info</th>
              <th>Evaluation Items</th>
            </tr>
          </thead>
          <tbody>
            {reportsData.map((projectAndReport) => {
              const { projectId, projectInfo, report } = projectAndReport;
              return (
                <tr key={projectId} className="w-full">
                  <td>{projectId}</td>
                  <td className="mx-2 max-w-[300px] text-break break-all">
                    <div>
                      <span className="font-bold">Crowd Funding URL:</span>{' '}
                      <Link target="_blank" href={projectInfo.crowdFundingUrl} className="link-color">
                        {projectInfo.crowdFundingUrl}
                      </Link>
                    </div>
                    <div>
                      <span className="font-bold">SEC Filing URL:</span>{' '}
                      <Link target="_blank" href={projectInfo.secFilingUrl} className="link-color">
                        {projectInfo.secFilingUrl}
                      </Link>
                    </div>
                    <div>
                      <span className="font-bold">Website URL:</span>{' '}
                      <Link target="_blank" href={projectInfo.websiteUrl} className="link-color">
                        {projectInfo.websiteUrl}
                      </Link>
                    </div>
                    <div>
                      <span className="font-bold">Debug Page</span>{' '}
                      <Link target="_blank" href={`/crowd-funding/debug/projects/${projectId}`} className="link-color">
                        Click here
                      </Link>
                    </div>
                  </td>
                  <td className="p-5">
                    {report?.performanceChecklist?.length ? (
                      <>
                        <ul className="list-disc mt-2">
                          {report.performanceChecklist.map((item, index) => (
                            <li key={index} className="mb-1 flex items-start">
                              <span className="mr-2">{item.score === 1 ? '✅' : '❌'}</span>
                              <span>{item.checklistItem}</span>
                            </li>
                          ))}
                        </ul>
                        <div>
                          <Link target="_blank" href={`/crowd-funding/projects/${projectId}/reports/${reportType}`} className="link-color text-sm mt-4">
                            See Full Report &rarr;
                          </Link>
                        </div>
                      </>
                    ) : (
                      <span>No evaluation items available</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </PageWrapper>
  );
}
