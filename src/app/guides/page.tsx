'use client';

import withSpace, { SpaceProps } from '@/app/withSpace';
import Block from '@/components/app/Block';
import RowLoading from '@/components/core/loaders/RowLoading';
import GuideSummaryCard from '@/components/guides/Summary/GuideSummaryCard';
import NoGuide from '@/components/guides/Summary/NoGuides';
import { Grid4Cols } from '@/components/core/grids/Grid4Colst';
import PageWrapper from '@/components/core/page/PageWrapper';
import { GuideSummaryFragment, useGuidesQueryQuery } from '@/graphql/generated/generated-types';
import React from 'react';

function Guide({ space }: SpaceProps) {
  const { data, loading } = useGuidesQueryQuery({ variables: { space: space.id } });

  const loadingData = loading || !space;
  return (
    <PageWrapper>
      {!data?.guides?.length && !loadingData && <NoGuide />}
      {!!data?.guides?.length && (
        <Grid4Cols>
          {data?.guides?.map((guide: GuideSummaryFragment, i) => (
            <GuideSummaryCard key={i} guide={guide} inProgress={false} />
          ))}
        </Grid4Cols>
      )}
      <div style={{ height: '10px', width: '10px', position: 'absolute' }} />
      {loadingData && (
        <Block slim={true}>
          <RowLoading className="my-2" />
        </Block>
      )}
    </PageWrapper>
  );
}

export default withSpace(Guide);
