'use client';

import withSpace, { SpaceProps } from '@/contexts/withSpace';
import Block from '@dodao/web-core/components/app/Block';
import { Grid3Cols } from '@dodao/web-core/components/core/grids/Grid3Cols';
import RowLoading from '@dodao/web-core/components/core/loaders/RowLoading';
import CourseSummaryCard from '@/components/courses/Summary/CourseSummaryCard';
import NoCourses from '@/components/courses/Summary/NoCourses';
import { CourseFragment, useCoursesQueryQuery } from '@/graphql/generated/generated-types';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function CoursesGrid({ space }: SpaceProps) {
  const [data, setData] = useState<{ courses?: CourseFragment[] }>();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data } = await axios.get(`/api/courses/?spaceId=${space.id}`);
      setData(data);
      setLoading(false);
    }
    fetchData();
  }, [space]);

  const loadingData = loading || !space;
  return (
    <>
      {!data?.courses?.length && !loadingData && <NoCourses />}
      {!!data?.courses?.length && (
        <Grid3Cols>
          {data?.courses?.map((c: CourseFragment, i) => (
            <CourseSummaryCard key={i} course={c} inProgress={false} />
          ))}
        </Grid3Cols>
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

export default withSpace(CoursesGrid);
