'use client';

import withSpace, { SpaceProps } from '@/app/withSpace';
import ByteCollectionsGrid from '@/components/byteCollection/View/ByteCollectionsGrid';
import PageWrapper from '@/components/core/page/PageWrapper';
import { useByteCollectionsQuery, useQueryByteDetailsQuery } from '@/graphql/generated/generated-types';
import React from 'react';

function ByteCollections({ space }: SpaceProps) {
  const { data, error, loading, refetch: fetchSimulations } = useByteCollectionsQuery({ variables: { spaceId: space.id } });

  const loadingData = loading || !space;
  const { refetch } = useQueryByteDetailsQuery({ skip: true });
  return (
    <PageWrapper>
      <ByteCollectionsGrid
        byteCollections={data?.byteCollections}
        loadingData={loadingData}
        space={space}
        baseByteCollectionsEditUrl={'/tidbit-collections/edit'}
        fetchByteFn={async (byteId: string) => {
          const response = await refetch({ byteId: byteId, spaceId: space.id });
          return response.data.byte;
        }}
      />
    </PageWrapper>
  );
}

export default withSpace(ByteCollections);
