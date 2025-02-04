'use client';

import ProjectDetailTable from '@/components/projects/ProjectDetailTable';
import { ProcessingStatus, ProjectDetails, ReportWithName, SpiderGraph } from '@/types/project/project';
import Accordion from '@dodao/web-core/utils/accordion/Accordion';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import RadarChart from '../ui/RadarChart';
import { useState, useEffect } from 'react';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

interface ProjectDetailPageProps {
  projectId: string;
  initialProjectDetails: ProjectDetails;
  spiderGraph: SpiderGraph | null;
}

export default function ProjectDetailPage({ projectId, initialProjectDetails, spiderGraph }: ProjectDetailPageProps) {
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

  const startupEvaluation =
    spiderGraph && Object.keys(spiderGraph).length > 0
      ? {
          productInnovation: { score: spiderGraph?.productInnovation?.reduce((acc, item) => acc + item.score, 0) || 0 },
          marketOpportunity: { score: spiderGraph?.marketOpportunity?.reduce((acc, item) => acc + item.score, 0) || 0 },
          teamStrength: { score: spiderGraph?.teamStrength?.reduce((acc, item) => acc + item.score, 0) || 0 },
          financialHealth: { score: spiderGraph?.financialHealth?.reduce((acc, item) => acc + item.score, 0) || 0 },
          businessModel: { score: spiderGraph?.businessModel?.reduce((acc, item) => acc + item.score, 0) || 0 },
        }
      : null;

  return (
    <div className="w-full text-color">
      <div className="text-center text-color my-5">
        <h1 className="font-semibold leading-6 text-2xl">{projectDetails.name}</h1>
        <div className="my-5">Overall Status: {projectDetails.status}</div>
      </div>

      {spiderGraph && (
        <>
          <div className="max-w-lg mx-auto">
            <RadarChart data={spiderGraph} />
          </div>
          {spiderGraph &&
            Object.entries(spiderGraph).map(([key, values]) => (
              <div key={key} className="category-section my-5">
                <h3 className="font-bold text-lg mb-2">{key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}</h3>
                <ul className="list-disc pl-5">
                  {values.map((item, index) => (
                    <li key={index} className="mb-1 flex items-start">
                      <span className="mr-2">{item.score === 1 ? '✅' : '❌'}</span>
                      <span>{item.comment}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </>
      )}

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
