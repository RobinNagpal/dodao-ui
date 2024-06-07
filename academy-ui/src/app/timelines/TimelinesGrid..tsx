'use client';

import withSpace, { SpaceProps } from '@/app/withSpace';
import Block from '@dodao/web-core/components/app/Block';
import RowLoading from '@dodao/web-core/components/core/loaders/RowLoading';
import TimelineSummaryCard from '@/components/timelines/Timelines/TimelineSummaryCard';
import NoTimeline from '@/components/timelines/Timelines/NoTimelines';
import { Grid4Cols } from '@/components/core/grids/Grid4Cols';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { useTimelinesQuery } from '@/graphql/generated/generated-types';
import React from 'react';

function TimelinesInformation({ space }: SpaceProps) {
  const { data, error, loading, refetch: fetchTimelines } = useTimelinesQuery({ variables: { spaceId: space.id } });

  const loadingData = loading || !space;
  return (
    <>
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
    </>
  );
}

export default withSpace(TimelinesInformation);
