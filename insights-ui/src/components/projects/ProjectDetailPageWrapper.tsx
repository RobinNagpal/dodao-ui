import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import ProjectDetailPage from '@/components/projects/ProjectDetailPage';
import { ProjectDetails } from '@/types/project/project';

export default async function ProjectDetailPageWrapper({ params }: { params: { projectId: string } }) {
  const { projectId } = params;

  // Fetch data on the server
  const res = await fetch(`${getBaseUrl()}/api/crowd-funding/projects/${projectId}`, { cache: 'no-cache' });

  if (!res.ok) {
    throw new Error('Failed to fetch project details');
  }

  const data: { projectDetails: ProjectDetails } = await res.json();

  return <ProjectDetailPage projectId={projectId} initialProjectDetails={data.projectDetails} />;
}
