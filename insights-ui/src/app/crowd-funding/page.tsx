import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Grid4Cols } from '@dodao/web-core/components/core/grids/Grid4Cols';
import React from 'react';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import ProjectSummaryCard from '@/components/projects/ProjectSummaryCard';
import AddProjectButton from '@/components/ui/AddProjectButton';
import PrivateWrapper from '@/components/auth/PrivateWrapper';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Crowdfunding Projects | KoalaGains',
  description:
    'Browse our list of active crowdfunding projects on KoalaGains. Discover new opportunities, track performance, and dive deeper with AI-driven insights.',
  alternates: {
    canonical: 'https://koalagains.com/crowd-funding',
  },
  keywords: [
    'Crowdfunding Projects',
    'Investment Opportunities',
    'Crowdfunding Analysis',
    'Financial Analysis',
    'AI-driven Insights',
    'KoalaGains Crowdfunding',
    'Investment Reports',
  ],
};

export default async function Home() {
  const apiUrl = `${getBaseUrl()}/api/crowd-funding/projects`;
  const res = await fetch(apiUrl, { cache: 'no-cache' });
  const data = await res.json();

  const breadcrumbs: BreadcrumbsOjbect[] = [
    {
      name: 'Crowd Funding Projects',
      href: `/crowd-funding`,
      current: false,
    },
  ];

  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <div className="mx-auto">
        <div className="text-center my-5">
          <div className="sm:flex-auto">
            <h1 className="font-semibold leading-6 text-2xl text-color">Crowd Funding Projects</h1>
            <p className="my-2 text-sm text-color">A list of all the projects.</p>
          </div>
        </div>
        <PrivateWrapper>
          <AddProjectButton />
        </PrivateWrapper>
        <Grid4Cols>
          {data.projectIds!.length > 0 ? (
            data.projectIds.map((projectId: string) => <ProjectSummaryCard key={projectId} projectId={projectId} />)
          ) : (
            <div className="text-color text-center">No projects to show</div>
          )}
        </Grid4Cols>
      </div>
    </PageWrapper>
  );
}
