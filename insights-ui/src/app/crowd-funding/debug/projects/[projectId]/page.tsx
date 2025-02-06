import ProjectDebugPage from '@/components/projects/ProjectDebugPage';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { ProjectDetails, SpiderGraph } from '@/types/project/project';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import React from 'react';

export default async function ProjectDetailPageWrapper({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;

  const res = await fetch(`${getBaseUrl()}/api/crowd-funding/projects/${projectId}`);
  const data: { projectDetails: ProjectDetails; spiderGraph: SpiderGraph | {} } = await res.json();

  const breadcrumbs: BreadcrumbsOjbect[] = [
    {
      name: projectId,
      href: `/crowd-funding/debug/projects/${projectId}`,
      current: true,
    },
  ];

  const spiderGraph = Object.keys(data.spiderGraph || {}).length ? (data.spiderGraph as SpiderGraph) : null;

  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <ProjectDebugPage projectId={projectId} initialProjectDetails={data.projectDetails} spiderGraph={spiderGraph} />
    </PageWrapper>
  );
}
