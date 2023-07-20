'use client';

import withSpace, { SpaceProps } from '@/app/withSpace';
import Block from '@/components/app/Block';
import RowLoading from '@/components/core/loaders/RowLoading';
import TimelineSummaryCard from '@/components/timelines/Timelines/TimelineSummaryCard';
import NoTimeline from '@/components/timelines/Timelines/NoTimelines';
import { Grid4Cols } from '@/components/core/grids/Grid4Colst';
import PageWrapper from '@/components/core/page/PageWrapper';
import { useTimelinesQuery } from '@/graphql/generated/generated-types';
import React from 'react';

function Timeline({ space }: SpaceProps) {
  const { data, error, loading, refetch: fetchTimelines } = useTimelinesQuery({ variables: { spaceId: space.id } });

  const loadingData = loading || !space;
  return (
    <PageWrapper>
      {!data?.timelines.length && !loadingData && <NoTimeline />}
      {!!data?.timelines?.length && (
        <Grid4Cols>
          {data?.timelines?.map((timeline, i) => (
            <TimelineSummaryCard key={i} timeline={timeline} />
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

export default withSpace(Timeline);
