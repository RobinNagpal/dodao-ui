'use client';

import WithSpace from '@/app/withSpace';
import ByteCollectionsGrid from '@/components/byteCollection/View/ByteCollectionsGrid';
import BytesGrid from '@/components/bytes/List/BytesGrid';
import FullPageLoader from '@/components/core/loaders/FullPageLoading';
import ProjectShortVideosGrid from '@/components/projects/projectShortVideo/List/ProjectShortVideosGrid';
import {
  SpaceWithIntegrationsFragment,
  useProjectByteCollectionsQuery,
  useProjectByteQuery,
  useProjectBytesQuery,
  useProjectQuery,
} from '@/graphql/generated/generated-types';
import React from 'react';

function CollectionsPage(props: { params: { projectId: string; viewType: string }; space: SpaceWithIntegrationsFragment }) {
  const { data: project } = useProjectQuery({
    variables: {
      id: props.params.projectId,
    },
  });

  const { loading: loadingByteCollections, data: byteCollectionsData } = useProjectByteCollectionsQuery({
    variables: {
      projectId: props.params.projectId,
    },
  });

  const { loading: loadingByte, data: bytesData } = useProjectBytesQuery({
    variables: {
      projectId: props.params.projectId,
    },
  });

  const { refetch } = useProjectByteQuery({
    skip: true,
  });

  if (!project?.project) {
    return <FullPageLoader />;
  }

  if (props.params.viewType === 'tidbits') {
    return <BytesGrid loading={loadingByte} bytes={bytesData?.projectBytes} baseByteViewUrl={`/projects/view/${project?.project.id}/tidbits`} />;
  }

  if (props.params.viewType === 'shorts') {
    return <ProjectShortVideosGrid space={props.space} project={project?.project} />;
  }

  return (
    <ByteCollectionsGrid
      loadingData={loadingByteCollections}
      space={props.space}
      project={project?.project}
      byteCollections={byteCollectionsData?.projectByteCollections}
      baseByteCollectionsEditUrl={`/projects/edit/${project?.project.id}/tidbit-collections`}
      fetchByteFn={async (byteId: string) => {
        const response = await refetch({ projectId: props.params.projectId, id: byteId });
        return response.data.projectByte;
      }}
    />
  );
}

export default WithSpace(CollectionsPage);
