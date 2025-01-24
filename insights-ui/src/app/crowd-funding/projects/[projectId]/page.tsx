import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { ProjectDetail } from '@/types/project/project';
import ProjectDetailPage from '@/components/projects/ProjectDetailPage';

export default async function ProjectDetailPageWrapper({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;

  const res = await fetch(`${getBaseUrl()}/api/crowd-funding/projects/${projectId}`);
  const data: { projectDetails: ProjectDetail } = await res.json();

  return (
    <div>
      <ProjectDetailPage projectId={projectId} initialProjectDetails={data.projectDetails} />
    </div>
  );
}
