'use client';

import { REPORT_TYPES_TO_DISPLAY, ReportInterface } from '@/types/project/project';
import { useEffect, useState } from 'react';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import Link from 'next/link';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { regenerateAReportOfAllProjects } from '@/util/regenerate-report-of-all-projects';

interface ReportDebugPageProps {
  reportsData: Record<string, ReportInterface>;
  reportType: string;
}

export default function ReportDebugPage({ reportsData, reportType }: ReportDebugPageProps) {
  const allReportsOfATypeForAllProjects: Record<string, ReportInterface> = reportsData;

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
        <Button className="" onClick={() => regenerateAReportOfAllProjects(Object.keys(reportsData), 'gpt-4o', reportType)}>
          Retrigger For All Projects with GPT 4o
        </Button>
        <Button className="" onClick={() => regenerateAReportOfAllProjects(Object.keys(reportsData), 'gpt-4o-mini', reportType)}>
          Retrigger For All Projects with GPT 4o-mini
        </Button>
      </div>

      <div className="max-w-6xl mx-auto text-color">
        <table>
          <thead>
            <tr>
              <th>Project Id</th>
              <th>Evaluation Items</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(allReportsOfATypeForAllProjects).map(([projectId, report]) => (
              <tr key={projectId}>
                <td>{projectId}</td>
                <td className="p-5">
                  {report.performanceChecklist && report.performanceChecklist.length > 0 ? (
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
            ))}
          </tbody>
        </table>
      </div>
    </PageWrapper>
  );
}
