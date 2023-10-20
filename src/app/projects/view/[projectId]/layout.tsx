import PageWrapper from '@/components/core/page/PageWrapper';
import ProjectTopNav from '@/components/projects/Nav/ProjectTopNav';
import { getProjectUsingAPI } from '@/utils/api/getProjectUsingAPI';
import { getSpaceServerSide } from '@/utils/api/getSpaceServerSide';

async function ProjectViewHome(props: {
  params: {
    projectId: string;
  };
}) {
  const space = await getSpaceServerSide();
  const projectId = props.params.projectId;
  const project = await getProjectUsingAPI(projectId);

  return (
    <div>
      {project && space && <ProjectTopNav space={space} project={project} />}
      <PageWrapper>Project Details</PageWrapper>
    </div>
  );
}

export default ProjectViewHome;
