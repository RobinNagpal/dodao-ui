'use client';

import withSpace, { SpaceProps } from '@/app/withSpace';
import Block from '@/components/app/Block';
import { Grid3Cols } from '@/components/core/grids/Grid3Cols';
import RowLoading from '@/components/core/loaders/RowLoading';
import PageWrapper from '@/components/core/page/PageWrapper';
import CourseSummaryCard from '@/components/courses/Summary/CourseSummaryCard';
import NoCourses from '@/components/courses/Summary/NoCourses';
import MainContainer from '@/components/main/Container/MainContainer';
import { CourseFragment, useCoursesQueryQuery } from '@/graphql/generated/generated-types';
import React from 'react';

function CoursesInformation({ space }: SpaceProps) {
  const { data, loading } = useCoursesQueryQuery({ variables: { spaceId: space.id } });

  const loadingData = loading || !space;
  return (
    <MainContainer>
      <PageWrapper>
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
      </PageWrapper>
    </MainContainer>
  );
}

export default withSpace(CoursesInformation);
