'use client';

import WithSpace from '@/app/withSpace';
import EditProjectByte from '@/components/projects/projectByte/Edit/EditProjectByte';
import { SpaceWithIntegrationsFragment, useProjectQuery } from '@/graphql/generated/generated-types';

function EditTidbitPage(props: {
  params: {
    projectId: string;
    byteId: string[];
  };
  space: SpaceWithIntegrationsFragment;
}) {
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
      <EditProjectByte space={props.space} project={projectResponse?.project} params={props.params} />
    </div>
  ) : null;
}

export default WithSpace(EditTidbitPage);
