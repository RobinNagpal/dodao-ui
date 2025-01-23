import ProjectDetailTable from '@/components/projects/ProjectDetailTable';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import React from 'react';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { ProjectDetail, Status } from '@/types/project/project';
import Link from 'next/link';

export default async function ProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;

  const res = await fetch(`${getBaseUrl()}/api/crowd-funding/projects/${projectId}`);

  const data: { projectDetails: ProjectDetail } = await res.json();

  const projectDetails = data.projectDetails;
  const reports = projectDetails?.reports
    ? Object.entries(projectDetails.reports).map(([name, report]) => ({
        name,
        status: report.status,
        markdownLink: report.markdownLink,
        pdfLink: report.pdfLink,
      }))
    : [];

  return (
    <PageWrapper>
      <div className="mx-auto max-w-lg">
        {projectDetails ? (
          <>
            <div className="text-center text-color my-5">
              <h1 className="font-semibold leading-6 text-2xl">{projectDetails.name}</h1>
              <div className="my-5">Overall Status: {projectDetails.status}</div>
            </div>
            {reports.length > 0 ? (
              <div className="block-bg-color">
                <ProjectDetailTable reports={reports} projectId={projectId} />
              </div>
            ) : (
              <div className="mt-4 text-center text-color">No reports to show</div>
            )}
            {projectDetails.finalReport.status === Status.completed && !projectDetails.finalReport.errorMessage && (
              <div className="w-full flex justify-around my-5">
                <div className="text-color">Final Report</div>
                <div className="flex gap-2">
                  {projectDetails.finalReport.pdfLink && (
                    <>
                      <a href={projectDetails.finalReport.pdfLink} target="_blank" rel="noopener noreferrer" className="link-color hover:underline">
                        PDF
                      </a>

                      <span>|</span>
                    </>
                  )}
                  {projectDetails.finalReport.markdownLink && (
                    <Link
                      href={{
                        pathname: `/crowd-funding/projects/${encodeURIComponent(projectId)}/reports/final_report`,
                        query: { markdownLink: projectDetails.finalReport.markdownLink },
                      }}
                      key={projectId}
                      className="link-color hover:underline"
                    >
                      View
                    </Link>
                  )}
                </div>
              </div>
            )}
            {projectDetails.finalReport.status === Status.completed && projectDetails.finalReport.errorMessage && (
              <div className="text-red-500">Final Report Error:{projectDetails.finalReport.errorMessage}</div>
            )}
          </>
        ) : (
          <div className="mt-4 text-center text-color">No project details available</div>
        )}
      </div>
    </PageWrapper>
  );
}
