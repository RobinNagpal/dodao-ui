'use client';

import withSpace, { SpaceProps } from '@/app/withSpace';
import BytesGrid from '@/components/bytes/List/BytesGrid';
import PageWrapper from '@/components/core/page/PageWrapper';
import { useQueryBytesQuery } from '@/graphql/generated/generated-types';
import React from 'react';

function Byte({ space }: SpaceProps) {
  const { data, error, loading, refetch: fetchBytes } = useQueryBytesQuery({ variables: { spaceId: space.id } });
  return (
    <PageWrapper>
      <BytesGrid loading={loading} bytes={data?.bytes} />
    </PageWrapper>
  );
}

export default withSpace(Byte);
