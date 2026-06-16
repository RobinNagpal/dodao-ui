import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { ProcessingStatus, ProjectDetails, REPORT_TYPES_TO_DISPLAY, SpiderGraph } from '@/types/project/project';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import { Metadata } from 'next';
import React from 'react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import ProjectDetailPage from '@/components/projects/ProductDetailsPage';
import { formatProjectName, truncateDescription } from '@/util/report-utils';

const DEFAULT_OG_IMAGE = 'https://koalagains.com/koalagain_logo.png';

export async function generateMetadata({ params }: { params: Promise<{ projectId: string }> }): Promise<Metadata> {
  const { projectId } = await params;

  const res = await fetch(`${getBaseUrl()}/api/crowd-funding/projects/${projectId}`);
  const data: { projectDetails: ProjectDetails } = await res.json();

  const projectName = data.projectDetails?.name || formatProjectName(projectId);
  const startupSummary = data.projectDetails?.processedProjectInfo?.startupSummary?.trim();
  const hasAnyCompletedReport = REPORT_TYPES_TO_DISPLAY.some((rt) => data.projectDetails?.reports?.[rt]?.status === ProcessingStatus.COMPLETED);

  const description =
    truncateDescription(startupSummary) ??
    `Independent crowdfunding analysis for ${projectName}: founder & team, traction, market opportunity, execution, valuation, and financial-health checklists for retail investors.`;

  const canonicalUrl = `https://koalagains.com/crowd-funding/projects/${projectId}`;
  const ogImage = data.projectDetails?.imgUrl || DEFAULT_OG_IMAGE;

  return {
    title: `${projectName} — Crowdfunding Analysis | KoalaGains`,
    description,
    robots: hasAnyCompletedReport ? { index: true, follow: true } : { index: false, follow: true },
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${projectName} — Crowdfunding Analysis`,
      description,
      url: canonicalUrl,
      type: 'article',
      images: [ogImage],
      siteName: 'KoalaGains',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${projectName} — Crowdfunding Analysis`,
      description,
      images: [ogImage],
    },
  };
}

export default async function ProjectDetailPageWrapper({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;

  const res = await fetch(`${getBaseUrl()}/api/crowd-funding/projects/${projectId}`);
  const data: { projectDetails: ProjectDetails; spiderGraph: SpiderGraph | {} } = await res.json();

  const projectName = data.projectDetails?.name || formatProjectName(projectId);
  const startupSummary = data.projectDetails?.processedProjectInfo?.startupSummary?.trim();
  const canonicalUrl = `https://koalagains.com/crowd-funding/projects/${projectId}`;
  const ogImage = data.projectDetails?.imgUrl || DEFAULT_OG_IMAGE;

  const breadcrumbs: BreadcrumbsOjbect[] = [
    {
      name: 'Crowd Funding Projects',
      href: `/crowd-funding`,
      current: false,
    },
    {
      name: projectName,
      href: `/crowd-funding/projects/${projectId}`,
      current: true,
    },
  ];

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${projectName} — Crowdfunding Analysis`,
    description: truncateDescription(startupSummary) ?? `Independent crowdfunding analysis for ${projectName}.`,
    image: [ogImage],
    author: {
      '@type': 'Organization',
      name: 'KoalaGains',
      url: 'https://koalagains.com',
      logo: {
        '@type': 'ImageObject',
        url: DEFAULT_OG_IMAGE,
      },
    },
    publisher: {
      '@type': 'Organization',
      name: 'KoalaGains',
      url: 'https://koalagains.com',
      logo: {
        '@type': 'ImageObject',
        url: DEFAULT_OG_IMAGE,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    about: {
      '@type': 'Organization',
      name: projectName,
      url: data.projectDetails?.projectInfoInput?.websiteUrl,
    },
  };

  return (
    <PageWrapper>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      {data.projectDetails && <ProjectDetailPage projectId={projectId} initialProjectDetails={data.projectDetails} projectDetails={data.projectDetails} />}
    </PageWrapper>
  );
}
