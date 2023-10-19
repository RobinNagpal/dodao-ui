'use client';

import WithSpace from '@/app/withSpace';
import ProjectTopNav from '@/components/projects/Nav/ProjectTopNav';
import EditProjectByte from '@/components/projects/projectByte/Edit/EditProjectByte';
import { SpaceWithIntegrationsFragment, useProjectQuery } from '@/graphql/generated/generated-types';

function EditTidbitPage(props: {
  params: {
    projectId: string;
    byteId: string[];
  };
  space: SpaceWithIntegrationsFragment;
}) {
  console.log('ProjectViewHome props', props.params);
  const projectId = props.params.projectId;

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

  return projectResponse?.project ? (
    <div>
      <ProjectTopNav space={props.space} project={projectResponse?.project} />
      <EditProjectByte space={props.space} project={projectResponse?.project} params={props.params} />
    </div>
  ) : null;
}

export default WithSpace(EditTidbitPage);
