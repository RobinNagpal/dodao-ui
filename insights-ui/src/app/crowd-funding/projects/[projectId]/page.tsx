import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { ProjectDetails } from '@/types/project/project';
import ProjectDetailPageWrapper from '@/components/projects/ProjectDetailPageWrapper';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import React from 'react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';

export default async function ProjectDetailPage({ params }: { params: { projectId: string } }) {
  const { projectId } = params;

  const res = await fetch(`${getBaseUrl()}/api/crowd-funding/projects/${projectId}`);
  const data: { projectDetails: ProjectDetails } = await res.json();

  const breadcrumbs: BreadcrumbsOjbect[] = [
    {
      name: projectId,
      href: `/crowd-funding/projects/${projectId}`,
      current: true,
    },
  ];

  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <ProjectDetailPageWrapper
        params={{
          projectId: projectId,
        }}
      />
    </PageWrapper>
  );
}
