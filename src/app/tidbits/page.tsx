'use client';

import withSpace, { SpaceProps } from '@/app/withSpace';
import Block from '@/components/app/Block';
import RowLoading from '@/components/core/loaders/RowLoading';
import ByteSummaryCard from '@/components/bytes/Summary/ByteSummaryCard';
import NoByte from '@/components/bytes/Summary/NoBytes';
import { Grid4Cols } from '@/components/core/grids/Grid4Colst';
import PageWrapper from '@/components/core/page/PageWrapper';
import { useQueryBytesQuery } from '@/graphql/generated/generated-types';
import React from 'react';
import GuideSkeleton from '@/components/core/loaders/CardLoader';

function Byte({ space }: SpaceProps) {
  const { data, error, loading, refetch: fetchBytes } = useQueryBytesQuery({ variables: { spaceId: space.id } });

  const loadingData = loading || !space;
  return (
    <PageWrapper>
      <div className="flex justify-center items-center px-5 sm:px-0">
        {!data?.bytes.length && !loadingData && <NoByte />}
        {!!data?.bytes?.length && (
          <Grid4Cols>
            {data?.bytes?.map((byte, i) => (
              <ByteSummaryCard key={i} byte={byte} />
            ))}
          </Grid4Cols>
        )}
        <div style={{ height: '10px', width: '10px', position: 'absolute' }} />
        
      </div>
      {loadingData && (
          <Block slim={true}>
            <GuideSkeleton/>
          </Block>
        )}
    </PageWrapper>
  );
}

export default withSpace(Byte);
