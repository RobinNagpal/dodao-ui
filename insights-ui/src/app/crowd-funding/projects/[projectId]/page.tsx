import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { ProjectDetails, SpiderGraph } from '@/types/project/project';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import { Metadata } from 'next';
import React from 'react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import ProjectDetailPage from '@/components/projects/ProjectDetailPage';
import NewProjectDetailPage from '@/components/projects/NewProductDeatilPage';

export async function generateMetadata({ params }: { params: Promise<{ projectId: string }> }): Promise<Metadata> {
  const { projectId } = await params;

  const res = await fetch(`${getBaseUrl()}/api/crowd-funding/projects/${projectId}`);
  const data: { projectDetails: ProjectDetails } = await res.json();

  return {
    title: `${data.projectDetails.name} - Crowdfunding Project | DoDAO`,
    description: `Learn more about the crowdfunding project "${data.projectDetails.name}". Explore funding details, project insights, and official links.`,
    keywords: [
      'Crowdfunding',
      'Blockchain',
      'Funding',
      data.projectDetails.name,
      'Wefunder',
      'Kickstarter',
      'Start Engine',
      'Indiegogo',
      'Insights',
      'Financial',
      'Project',
      'Analysis',
      'Evaluations',
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
      description: `Explore project details, funding status, and insights for "${data.projectDetails.name}".`,
      url: `https://agentic-insights.dodao.io/crowd-funding/projects/${projectId}`,
      type: 'website',
      siteName: 'DoDAO',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${data.projectDetails.name} - Crowdfunding Project | DoDAO`,
      description: `Discover more about "${data.projectDetails.name}". Get details, reports, and funding status.`,
      site: '@dodao_io',
      creator: '@dodao_io',
    },
  };
}

export default async function ProjectDetailPageWrapper({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;

  const res = await fetch(`${getBaseUrl()}/api/crowd-funding/projects/${projectId}`);
  const data: { projectDetails: ProjectDetails; spiderGraph: SpiderGraph | {} } = await res.json();

  const breadcrumbs: BreadcrumbsOjbect[] = [
    {
      name: projectId,
      href: `/crowd-funding/projects/${projectId}`,
      current: true,
    },
  ];

  const spiderGraph = Object.keys(data.spiderGraph || {}).length ? (data.spiderGraph as SpiderGraph) : null;

  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <NewProjectDetailPage projectId={projectId} initialProjectDetails={data.projectDetails} spiderGraph={spiderGraph} />
      <ProjectDetailPage projectId={projectId} initialProjectDetails={data.projectDetails} spiderGraph={spiderGraph} />
    </PageWrapper>
  );
}
