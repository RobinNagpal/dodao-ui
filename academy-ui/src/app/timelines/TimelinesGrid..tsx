'use client';

import NoTimeline from '@/components/timelines/Timelines/NoTimelines';
import TimelineSummaryCard from '@/components/timelines/Timelines/TimelineSummaryCard';
import { SpaceProps } from '@/types/SpaceProps';
import { Timeline } from '@/graphql/generated/generated-types';
import Block from '@dodao/web-core/components/app/Block';
import { Grid4Cols } from '@dodao/web-core/components/core/grids/Grid4Cols';
import RowLoading from '@dodao/web-core/components/core/loaders/RowLoading';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

function TimelinesInformation({ space }: SpaceProps) {
  const [data, setData] = useState<{ timelines?: Timeline[] }>();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data } = await axios.get(`${getBaseUrl()}/api/timelines?spaceId=${space.id}`);
      setData(data);
      setLoading(false);
    }
    fetchData();
  }, [space]);

  const loadingData = loading || !space;
  return (
    <>
      {!data?.timelines?.length && !loadingData && <NoTimeline />}
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

export default TimelinesInformation;
