import ProjectDetailTable from '@/components/projects/ProjectDetailTable';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import React from 'react';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { ProjectDetail } from '@/types/project/project';

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
            <div className="text-center text-color">
              <h1 className="font-semibold leading-6 text-2xl">{projectDetails.name}</h1>
              <div className="my-5">Overall Status: {projectDetails.status}</div>
            </div>
            {reports.length > 0 ? <ProjectDetailTable reports={reports} /> : <div className="mt-4 text-center text-color">No reports to show</div>}
          </>
        ) : (
          <div className="mt-4 text-center text-color">No project details available</div>
        )}
      </div>
    </PageWrapper>
  );
}
