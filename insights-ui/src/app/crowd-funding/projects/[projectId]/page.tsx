import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { ProjectDetails, REPORT_TYPES_TO_DISPLAY, ReportInterfaceWithType, SpiderGraph } from '@/types/project/project';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import { Metadata } from 'next';
import React from 'react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import ProjectDebugPage from '@/components/projects/ProjectDebugPage';
import ProjectDetailPage from '@/components/projects/ProductDetailsPage';

export async function generateMetadata({ params }: { params: Promise<{ projectId: string }> }): Promise<Metadata> {
  const { projectId } = await params;

  const res = await fetch(`${getBaseUrl()}/api/crowd-funding/projects/${projectId}`);
  const data: { projectDetails: ProjectDetails } = await res.json();

  return {
    title: `${data.projectDetails.name} - Crowdfunding Project | DoDAO`,
    description: `DoDAO Agentic Insights provides detailed analysis and insights for "${data.projectDetails.name}" with graphs, reports and metrics like growth,financial health ,traction, valuation ,Execution and speed.`,
    keywords: [
      'Crowdfunding',
      'Traction',
      'Investment',
      'Market Opportunity',
      'Execution and Speed',
      'Team',
      'Valuation',
      data.projectDetails.name,
      'Wefunder',
      'Kickstarter',
      'Start Engine',
      'Insights',
    ],
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `https://agentic-insights.dodao.io/crowd-funding/projects/${projectId}`,
    },
    openGraph: {
      title: `${data.projectDetails.name} - Crowdfunding Project | DoDAO`,
      description: `DoDAO Agentic Insights provides detailed analysis and insights for "${data.projectDetails.name}" with graphs, reports and metrics like growth,financial health ,traction, valuation ,Execution and speed.`,
      url: `https://agentic-insights.dodao.io/crowd-funding/projects/${projectId}`,
      type: 'website',
      images: [data.projectDetails.imgUrl || ''],
      siteName: 'Agentic Insights - DoDao',
    },
  };
}

export default async function ProjectDetailPageWrapper({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;

  const res = await fetch(`${getBaseUrl()}/api/crowd-funding/projects/${projectId}`);
  const data: { projectDetails: ProjectDetails; spiderGraph: SpiderGraph | {} } = await res.json();

  const breadcrumbs: BreadcrumbsOjbect[] = [
    {
      name: 'Crowd Funding Projects',
      href: `/crowd-funding`,
      current: false,
    },
    {
      name: projectId,
      href: `/crowd-funding/projects/${projectId}`,
      current: true,
    },
  ];

  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      {data.projectDetails && <ProjectDetailPage projectId={projectId} initialProjectDetails={data.projectDetails} projectDetails={data.projectDetails} />}
    </PageWrapper>
  );
}
