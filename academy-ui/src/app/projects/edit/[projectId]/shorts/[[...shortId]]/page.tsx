'use client';

import WithSpace from '@/app/withSpace';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import EditProjectShortVideoView from '@/components/projects/projectShortVideo/Edit/EditProjectShortVideoView';
import { SpaceWithIntegrationsFragment, useProjectQuery } from '@/graphql/generated/generated-types';
import { useRouter } from 'next/navigation';
import React from 'react';

function EditProjectShortPage(props: {
  params: {
    projectId: string;
    byteId: string[];
  };
  space: SpaceWithIntegrationsFragment;
}) {
  const router = useRouter();
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

  if (loading || !projectResponse?.project) {
    return (
      <PageWrapper>
        <FullPageLoader />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <EditProjectShortVideoView
        space={props.space}
        project={projectResponse.project}
        onAfterSave={() => router.push(`/projects/view/${projectResponse?.project.id}/shorts`)}
        onCancel={() => router.back()}
      />
    </PageWrapper>
  );
}

export default WithSpace(EditProjectShortPage);
