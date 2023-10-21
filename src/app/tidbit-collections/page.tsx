'use client';

import withSpace, { SpaceProps } from '@/app/withSpace';
import ByteCollectionsGrid from '@/components/byteCollection/View/ByteCollectionsGrid';
import PageWrapper from '@/components/core/page/PageWrapper';
import { useByteCollectionsQuery } from '@/graphql/generated/generated-types';
import React from 'react';

function ByteCollections({ space }: SpaceProps) {
  const { data, error, loading, refetch: fetchSimulations } = useByteCollectionsQuery({ variables: { spaceId: space.id } });

  const loadingData = loading || !space;

  return (
    <PageWrapper>
      <ByteCollectionsGrid byteCollections={data?.byteCollections} loadingData={loadingData} space={space} />
    </PageWrapper>
  );
}

export default withSpace(ByteCollections);
