'use client';

import ProjectDetailTable from '@/components/projects/ProjectDetailTable';
import { ProcessingStatus, ProjectDetails, ReportWithName, SpiderGraph } from '@/types/project/project';
import Accordion from '@dodao/web-core/utils/accordion/Accordion';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ProjectDetailPageProps {
  projectId: string;
  initialProjectDetails: ProjectDetails;
  spiderGraph: SpiderGraph | null;
}

export default function ProjectDebugPage({ projectId, initialProjectDetails, spiderGraph }: ProjectDetailPageProps) {
  const [projectDetails, setProjectDetails] = useState<ProjectDetails>(initialProjectDetails);

  const [reloadTrigger, setReloadTrigger] = useState(false);
  const [openWebsiteContentAccordion, setOpenWebsiteContentAccordion] = useState(false);
  const [openCrowdFundingContentAccordion, setOpenCrowdFundingContentAccordion] = useState(false);
  const [openAdditionalUrlsContentAccordion, setOpenAdditionalUrlsContentAccordion] = useState(false);
  const [openSecMarkdownContentAccordion, setOpenSecMarkdownContentAccordion] = useState(false);
  const fetchProjectDetails = async () => {
    try {
      const res = await fetch(`${getBaseUrl()}/api/crowd-funding/projects/${projectId}`, { cache: 'no-cache' });
      const data = await res.json();
      setProjectDetails(data.projectDetails);
      setReloadTrigger(false);
    } catch (err) {
      console.error('Failed to fetch project details:', err);
    }
  };

  // Combine reports and finalReport into a single array
  // UseMemo for reports calculation
  const reports: ReportWithName[] = Object.entries(projectDetails.reports).map(([name, report]) => ({ ...report, name }));

  // Polling mechanism for refreshing data
  useEffect(() => {
    const interval = setInterval(() => {
      const hasInProgressReport = reports.some((report) => report.status === ProcessingStatus.IN_PROGRESS || report.status === ProcessingStatus.NOT_STARTED);

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
    <div className="w-full text-color">
      <div className="text-center text-color my-5">
        <h1 className="font-semibold leading-6 text-2xl">{projectDetails.name}</h1>
        <div className="my-5">Overall Status: {projectDetails.status}</div>
      </div>

      <Accordion
        label="Crowdfunding Content"
        isOpen={openCrowdFundingContentAccordion}
        onClick={() => setOpenCrowdFundingContentAccordion(!openCrowdFundingContentAccordion)}
      >
        {projectDetails.processedProjectInfo?.contentOfCrowdfundingUrl && (
          <Markdown className="markdown text-color" remarkPlugins={[remarkGfm]}>
            {projectDetails.processedProjectInfo?.contentOfCrowdfundingUrl}
          </Markdown>
        )}
      </Accordion>

      <Accordion label="Website Content" isOpen={openWebsiteContentAccordion} onClick={() => setOpenWebsiteContentAccordion(!openWebsiteContentAccordion)}>
        {projectDetails.processedProjectInfo?.contentOfWebsiteUrl && (
          <Markdown className="markdown text-color" remarkPlugins={[remarkGfm]}>
            {projectDetails.processedProjectInfo?.contentOfWebsiteUrl}
          </Markdown>
        )}
      </Accordion>

      <Accordion
        label="Additional URLs"
        isOpen={openAdditionalUrlsContentAccordion}
        onClick={() => setOpenAdditionalUrlsContentAccordion(!openAdditionalUrlsContentAccordion)}
      >
        {projectDetails.processedProjectInfo?.contentOfAdditionalUrls && (
          <Markdown className="markdown text-color" remarkPlugins={[remarkGfm]}>
            {projectDetails.processedProjectInfo?.contentOfAdditionalUrls}
          </Markdown>
        )}
      </Accordion>

      <Accordion
        label="SEC Markdown Content"
        isOpen={openSecMarkdownContentAccordion}
        onClick={() => setOpenSecMarkdownContentAccordion(!openSecMarkdownContentAccordion)}
      >
        {projectDetails.processedProjectInfo?.secInfo?.secMarkdownContent && (
          <Markdown className="markdown text-color" remarkPlugins={[remarkGfm]}>
            {projectDetails.processedProjectInfo?.secInfo?.secMarkdownContent}
          </Markdown>
        )}
      </Accordion>

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
