import ProjectDebugPage from '@/components/projects/ProjectDebugPage';
import { ProjectDetails, SpiderGraph } from '@/types/project/project';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import Link from 'next/link';
import React from 'react';

export default async function ProjectDetailPageWrapper({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;

  const res = await fetch(`${getBaseUrl()}/api/crowd-funding/projects/${projectId}`);
  const data: { projectDetails: ProjectDetails; spiderGraph: SpiderGraph | {} } = await res.json();

  const spiderGraph = Object.keys(data.spiderGraph || {}).length ? (data.spiderGraph as SpiderGraph) : null;

  return (
    <PageWrapper>
      <div className="flex justify-end">
        <Link href={`/crowd-funding/projects/${projectId}`} className="link-color underline cursor-pointer">
          {' '}
          Back to project Page
        </Link>
      </div>
      <ProjectDebugPage projectId={projectId} initialProjectDetails={data.projectDetails} spiderGraph={spiderGraph} />
    </PageWrapper>
  );
}
