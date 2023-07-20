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

  return (
    <PageWrapper>
      {loading ? (
        <Block>
          <GuideSkeleton />
        </Block>
      ) : (
        <div className="flex justify-center items-center px-5 sm:px-0">
          {!data?.guides?.length && !loading && <NoGuide />}
          {!!data?.guides?.length && (
            <Grid4Cols>
              {data?.guides?.map((guide: GuideSummaryFragment, i) => (
                <GuideSummaryCard key={i} guide={guide} />
              ))}
            </Grid4Cols>
          )}
        </div>
      )}
    </PageWrapper>
  );
}

export default withSpace(Guide);
