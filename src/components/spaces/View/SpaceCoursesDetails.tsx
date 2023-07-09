import AddRawCourseModal from '@/components/app/Modal/Course/AddRawCourseModal';
import DetailsField from '@/components/core/details/DetailsField';
import DetailsHeader from '@/components/core/details/DetailsHeader';
import DetailsSection from '@/components/core/details/DetailsSection';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { RawGitCourse, Space, useRawGitCoursesQuery, useUpsertGitCourseMutation } from '@/graphql/generated/generated-types';
import { PublishStatus } from '@/types/deprecated/models/enums';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

export interface SpaceAuthDetailsProps {
  space: Space;
  className?: string;
}

function getCourseDetailsFields(courses: RawGitCourse[]): Array<{ label: string; value: string }> {
  return courses.map((course) => ({ label: course.courseKey, value: course.courseRepoUrl }));
}

export default function SpaceCourseDetails(props: SpaceAuthDetailsProps) {
  const [showAddRawCourseModal, setShowAddRawCourseModal] = useState(false);
  const threeDotItems = [{ label: 'Add New', key: 'add' }];
  const [upsertGitCourseMutation] = useUpsertGitCourseMutation();
  const selectFromThreedotDropdown = async (e: string) => {
    setShowAddRawCourseModal(true);
  };

  const router = useRouter();
  const { showNotification } = useNotificationContext();

  const onAddRawCourse = async (repoUrl: string, publishStatus: PublishStatus, weight: number) => {
    setShowAddRawCourseModal(false);
    const result = await upsertGitCourseMutation({
      variables: {
        spaceId: props.space.id,
        gitCourseInput: {
          courseRepoUrl: repoUrl,
          publishStatus,
          weight,
        },
      },
    });

    const payload = result.data?.payload;
    if (payload) {
      showNotification({ type: 'success', message: 'Course added successfully' });
      router.push(`/courses/view/${payload.key}`);
    } else {
      showNotification({ type: 'error', message: 'Failed to add course' });
    }

    await refetch();
  };

  const { data: coursesResponse, refetch } = useRawGitCoursesQuery({
    variables: {
      spaceId: props.space.id,
    },
  });

  return (
    <>
      <DetailsSection className={props.className}>
        <div className="flex w-full">
          <DetailsHeader header={'Courses'} className="grow-1 w-full" />
          <PrivateEllipsisDropdown items={threeDotItems} onSelect={selectFromThreedotDropdown} className="ml-4 pt-4 grow-0 w-16" />
        </div>
        {(coursesResponse?.payload ? getCourseDetailsFields(coursesResponse?.payload) : []).map((field) => (
          <DetailsField key={field.label} label={field.label} value={field.value} />
        ))}
      </DetailsSection>
      <AddRawCourseModal
        open={showAddRawCourseModal}
        onAddRawCourse={(repoUrl, publishStatus, weight) => onAddRawCourse(repoUrl, publishStatus, weight)}
        onClose={() => setShowAddRawCourseModal(false)}
      />
    </>
  );
}
