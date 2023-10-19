'use client';

import WithSpace from '@/app/withSpace';
import PageWrapper from '@/components/core/page/PageWrapper';
import ProjectTopNav from '@/components/projects/Nav/ProjectTopNav';
import { SpaceWithIntegrationsFragment, useProjectQuery } from '@/graphql/generated/generated-types';

function ProjectViewHome(props: {
  params: {
    projectIdAndTab: string[];
  };
  space: SpaceWithIntegrationsFragment;
}) {
  console.log('ProjectViewHome props', props.params.projectIdAndTab);
  const projectId = props.params.projectIdAndTab[0];

  const {
    data: projectResponse,
    refetch,
    error,
    loading,
  } = useProjectQuery({
    variables: {
      id: projectId,
    },
  });

  return (
    <div>
      {projectResponse?.project && <ProjectTopNav space={props.space} project={projectResponse?.project} />}
      <PageWrapper>Project Details</PageWrapper>
    </div>
  );
}

export default WithSpace(ProjectViewHome);
