'use client';

import { useParams } from 'next/navigation';
import EditProjectView from '@/components/projects/EditProjectView';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { ProjectDetails } from '@/types/project/project';

export default function Page() {
  const params = useParams();
  const projectId = params?.projectId as string | null; // Get projectId from URL
  //   const res = await fetch(`${getBaseUrl()}/api/crowd-funding/projects/${projectId}/edit}`);
  //   const data: { projectDetails: ProjectDetails } = await res.json();
  //   const { projectDetails } = data;
  //   console.log(projectDetails);
  return <EditProjectView projectId={projectId} />;
}
