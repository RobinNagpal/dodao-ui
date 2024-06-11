'use client';

import WithSpace from '@dodao/web-core/ui/auth/withSpace';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
import EditProjectByte from '@/components/projects/projectByte/Edit/EditProjectByte';
import { SpaceWithIntegrationsFragment, useProjectQuery } from '@/graphql/generated/generated-types';
import { useRouter } from 'next/navigation';
import React from 'react';

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
  const router = useRouter();

  if (loading || !projectResponse?.project) {
    return <FullPageLoader />;
  }

  function onClose() {
    router.push(`/projects/view/${projectResponse?.project?.id}`);
  }

  return (
    <FullScreenModal open={true} onClose={onClose} title={'Create Tidbit'}>
      <div className="text-left">
        <EditProjectByte space={props.space} project={projectResponse?.project} byteId={props.params.byteId?.[0]} />;
      </div>
    </FullScreenModal>
  );
}

export default WithSpace(EditTidbitPage);
