import { REPORT_TYPES_TO_DISPLAY, ReportInterface } from '@/types/project/project';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Link from 'next/link';
import React from 'react';

export default function DebugReportPage() {
  // This is projectId -> report
  const allReportsOfATypeForAllProjects: Record<string, ReportInterface> = {};
  return (
    <div>
      <div>
        <div>Choose a report to debug:</div>
        {REPORT_TYPES_TO_DISPLAY.map((reportType) => {
          return (
            <Link href={`/crowd-funding/debug/reports/${reportType}`} key={reportType}>
              <a>{reportType}</a>
            </Link>
          );
        })}
      </div>
      <div className="w-full">
        <Button className="float-right" onClick={() => console.log(allReportsOfATypeForAllProjects)}>
          Retrigger For All Projects
        </Button>
      </div>
      <div>
        <table>
          <tr>
            <th>Project Id</th>
            <th>Evaluation Items</th>
          </tr>
          {Object.entries(allReportsOfATypeForAllProjects).map(([projectId, report]) => {
            return (
              <tr key={projectId}>
                <td>{projectId}</td>
                <td>
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
                        <Link target="_blank" href={`/crowd-funding/projects/${projectId}/reports/${reportType}`} className="link-color text-sm mt-4">
                          See Full Report &rarr;
                        </Link>
                      </div>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </table>
      </div>
    </div>
  );
}
