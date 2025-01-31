'use client';

import React, { useEffect, useState, useMemo } from 'react';
import ProjectDetailTable from '@/components/projects/ProjectDetailTable';
import { ProjectDetail, Status } from '@/types/project/project';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

interface ProjectDetailPageProps {
  projectId: string;
  initialProjectDetails: ProjectDetail;
}

export default function ProjectDetailPage({ projectId, initialProjectDetails }: ProjectDetailPageProps) {
  const [projectDetails, setProjectDetails] = useState<ProjectDetail>(initialProjectDetails);
  const [reloadTrigger, setReloadTrigger] = useState(false);

  const fetchProjectDetails = async () => {
    try {
      const res = await fetch(`${getBaseUrl()}/api/crowd-funding/projects/${projectId}`);
      const data = await res.json();
      setProjectDetails(data.projectDetails);
      setReloadTrigger(false);
    } catch (err) {
      console.error('Failed to fetch project details:', err);
    }
  };

  // Combine reports and finalReport into a single array
  // UseMemo for reports calculation
  const reports = useMemo(() => {
    if (!projectDetails?.reports) return [];

    const baseReports = Object.entries(projectDetails.reports).map(([name, report]) => ({
      name,
      status: report.status,
      markdownLink: report.markdownLink,
      pdfLink: report.pdfLink,
      startTime: report.startTime ?? undefined,
      estimatedTimeInSec: report.estimatedTimeInSec ?? undefined,
      endTime: report.endTime ?? undefined,
    }));

    const finalReport = Object.values(projectDetails.reports).every((report) => report.status === Status.completed)
      ? [
          {
            name: 'final_report',
            status: projectDetails.finalReport.status,
            markdownLink: projectDetails.finalReport.markdownLink,
            pdfLink: projectDetails.finalReport.pdfLink,
            startTime: projectDetails.finalReport.startTime ?? undefined,
            estimatedTimeInSec: projectDetails.finalReport.estimatedTimeInSec ?? undefined,
            endTime: projectDetails.finalReport.endTime ?? undefined,
          },
        ]
      : [];

    console.log('Reports recalculated:', [...baseReports, ...finalReport]);
    return [...baseReports, ...finalReport];
  }, [projectDetails]);

  // Polling mechanism for refreshing data
  useEffect(() => {
    const interval = setInterval(() => {
      const hasInProgressReport = reports.some((report) => report.status === Status.in_progress || report.status === Status.not_started);

      if (hasInProgressReport) {
        console.log('Refetching due to in-progress status...');
        fetchProjectDetails();
      }
    }, 10000); // Poll every 15 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [reports]);

  useEffect(() => {
    if (reloadTrigger) {
      fetchProjectDetails();
    }
  }, [reloadTrigger]);

  return (
    <div className="w-full">
      <div className="text-center text-color my-5">
        <h1 className="font-semibold leading-6 text-2xl">{projectDetails.name}</h1>
        <div className="my-5">Overall Status: {projectDetails.status}</div>
      </div>
      {reports.length > 0 ? (
        <div className="block-bg-color w-full">
          <ProjectDetailTable reports={reports} projectId={projectId} reload={() => setReloadTrigger(true)} />
        </div>
      ) : (
        <div className="mt-4 text-center text-color">No reports to show</div>
      )}
    </div>
  );
}
