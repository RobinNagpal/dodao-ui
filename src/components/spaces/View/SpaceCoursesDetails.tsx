import DetailsField from '@/components/core/details/DetailsField';
import DetailsHeader from '@/components/core/details/DetailsHeader';
import DetailsSection from '@/components/core/details/DetailsSection';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import { RawGitCourse, Space, useRawGitCoursesQuery } from '@/graphql/generated/generated-types';
import React from 'react';

export interface SpaceAuthDetailsProps {
  space: Space;
  className?: string;
}

function getCourseDetailsFields(courses: RawGitCourse[]): Array<{ label: string; value: string }> {
  return courses.map((course) => ({ label: course.courseKey, value: course.courseRepoUrl }));
}

export default function SpaceCourseDetails(props: SpaceAuthDetailsProps) {
  const threeDotItems = [{ label: 'Edit', key: 'edit' }];

  const selectFromThreedotDropdown = async (e: string) => {};

  const { data: coursesResponse, refetch } = useRawGitCoursesQuery({
    variables: {
      spaceId: props.space.id,
    },
  });

  return (
    <DetailsSection className={props.className}>
      <div className="flex w-full">
        <DetailsHeader header={'Auth Details'} subheader={'How login and other things are configured'} className="grow-1 w-full" />
        <PrivateEllipsisDropdown items={threeDotItems} onSelect={selectFromThreedotDropdown} className="ml-4 pt-4 grow-0 w-16" />
      </div>
      {(coursesResponse?.payload ? getCourseDetailsFields(coursesResponse?.payload) : []).map((field) => (
        <DetailsField key={field.label} label={field.label} value={field.value} />
      ))}
    </DetailsSection>
  );
}
