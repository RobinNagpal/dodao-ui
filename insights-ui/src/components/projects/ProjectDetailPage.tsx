'use client';

import React, { useEffect, useState } from 'react';
import ProjectDetailTable from '@/components/projects/ProjectDetailTable';
import { ProjectDetail, Status } from '@/types/project/project';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

interface ProjectDetailPageProps {
  projectId: string;
  initialProjectDetails: ProjectDetail;
}

export default function ProjectDetailPage({ projectId, initialProjectDetails }: ProjectDetailPageProps) {
  const [projectDetails, setProjectDetails] = useState<ProjectDetail>(initialProjectDetails);

  const fetchProjectDetails = async () => {
    try {
      const res = await fetch(`${getBaseUrl()}/api/crowd-funding/projects/${projectId}`);
      const data = await res.json();
      setProjectDetails(data.projectDetails);
    } catch (err) {
      console.error('Failed to fetch project details:', err);
    }
  };

  // Combine reports and finalReport into a single array
  const reports = projectDetails?.reports
    ? [
        ...Object.entries(projectDetails.reports).map(([name, report]) => ({
          name,
          status: report.status,
          markdownLink: report.markdownLink,
          pdfLink: report.pdfLink,
        })),
        // Add final report only if all other reports are completed
        ...(Object.values(projectDetails.reports).every((report) => report.status === Status.completed)
          ? [
              {
                name: 'final_report',
                status: projectDetails.finalReport.status,
                markdownLink: projectDetails.finalReport.markdownLink,
                pdfLink: projectDetails.finalReport.pdfLink,
              },
            ]
          : []),
      ]
    : [];

  // Polling mechanism for refreshing data
  useEffect(() => {
    const interval = setInterval(() => {
      const hasInProgressReport = reports.some((report) => report.status === Status.in_progress);

      if (hasInProgressReport) {
        console.log('Refetching due to in-progress status...');
        fetchProjectDetails();
      }
    }, 15000); // Poll every 15 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [reports]);

  return (
    <div className="mx-auto max-w-lg">
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
    </div>
  );
}
