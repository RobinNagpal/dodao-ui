'use client';

import WithSpace from '@/app/withSpace';
import ByteCollectionsGrid from '@/components/byteCollection/View/ByteCollectionsGrid';
import BytesGrid from '@/components/bytes/List/BytesGrid';
import { SpaceWithIntegrationsFragment, useProjectByteCollectionsQuery, useProjectBytesQuery, useProjectQuery } from '@/graphql/generated/generated-types';
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
  if (props.params.viewType === 'tidbits') {
    return <BytesGrid loading={loadingByte} bytes={bytesData?.projectBytes} />;
  }
  return (
    <ByteCollectionsGrid
      loadingData={loadingByteCollections}
      space={props.space}
      project={project?.project}
      byteCollections={byteCollectionsData?.projectByteCollections}
    />
  );
}

export default WithSpace(CollectionsPage);
