import UpsertRawCourseModal from '@/components/app/Modal/Course/UpsertRawCourseModal';
import DetailsField from '@/components/core/details/DetailsField';
import DetailsHeader from '@/components/core/details/DetailsHeader';
import DetailsSection from '@/components/core/details/DetailsSection';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import { Table, TableRow } from '@/components/core/table/Table';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { RawGitCourse, Space, useRawGitCoursesQuery, useUpsertGitCourseMutation } from '@/graphql/generated/generated-types';
import { PublishStatus } from '@/types/deprecated/models/enums';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

export interface SpaceAuthDetailsProps {
  space: Space;
  className?: string;
}

export default function SpaceCourseDetails(props: SpaceAuthDetailsProps) {
  const [showAddRawCourseModal, setShowAddRawCourseModal] = useState(false);
  const threeDotItems = [{ label: 'Add New', key: 'add' }];
  const [upsertGitCourseMutation] = useUpsertGitCourseMutation();
  const selectFromThreedotDropdown = async (e: string) => {
    setShowAddRawCourseModal(true);
  };

  function getCourseDetailsFields(courses: RawGitCourse[]): Array<{ label: string; value: string }> {
    return courses.map((course) => ({ label: course.courseKey, value: course.courseRepoUrl }));
  }

  function getCourseTableRows(courses?: RawGitCourse[]): TableRow[] {
    return (
      courses?.map(
        (course): TableRow => ({
          id: course.courseKey,
          columns: [course.courseKey, course.courseRepoUrl, course.weight.toString()],
          item: course,
        })
      ) || []
    );
  }
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
      <Table
        heading={'Courses'}
        data={getCourseTableRows(coursesResponse?.payload)}
        columnsHeadings={['Key', 'Repo URL', 'Weight']}
        columnsWidthPercents={[20, 60, 20]}
      />
      <UpsertRawCourseModal
        open={showAddRawCourseModal}
        onUpsertRawCourse={(repoUrl, publishStatus, weight) => onAddRawCourse(repoUrl, publishStatus, weight)}
        onClose={() => setShowAddRawCourseModal(false)}
      />
    </>
  );
}
