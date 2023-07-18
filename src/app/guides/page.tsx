'use client';

import withSpace, { SpaceProps } from '@/app/withSpace';
import Block from '@/components/app/Block';
import GuideSkeleton from '@/components/core/loaders/CardLoader';
import GuideSummaryCard from '@/components/guides/Summary/GuideSummaryCard';
import NoGuide from '@/components/guides/Summary/NoGuides';
import { Grid4Cols } from '@/components/core/grids/Grid4Colst';
import PageWrapper from '@/components/core/page/PageWrapper';
import { GuideSummaryFragment, useGuidesQueryQuery } from '@/graphql/generated/generated-types';
import React from 'react';
import { useEffect, useState } from 'react';

function Guide({ space }: SpaceProps) {
  const { data, loading } = useGuidesQueryQuery({ variables: { space: space.id } });

  const loadingData = loading || !space;
  const [showSkeleton, setShowSkeleton] = useState(true);
  console.log('First time:showSkeleton', showSkeleton);
  useEffect(() => {
    if (!loading) {
      setShowSkeleton(false);
    }
  }, [loading]);
  return (
    <>
      <PageWrapper>
        <Block>{showSkeleton && <GuideSkeleton />}</Block>

        <div className="flex justify-center items-center px-5 sm:px-0">
          {!data?.guides?.length && !loadingData && <NoGuide />}
          {!!data?.guides?.length && <Grid4Cols>{data?.guides?.map((guide: GuideSummaryFragment, i) => <GuideSummaryCard key={i} guide={guide} />)}</Grid4Cols>}
        </div>
        <div style={{ height: '10px', width: '10px', position: 'absolute' }} />
      </PageWrapper>
    </>
  );
}

export default withSpace(Guide);
