import AddRawCourseModal from '@/components/app/Modal/Course/AddRawCourseModal';
import RowLoading from '@/components/core/loaders/RowLoading';
import { Table, TableRow } from '@/components/core/table/Table';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { useRawGitCoursesQuery, useUpsertGitCourseMutation } from '@/graphql/generated/generated-types';
import { PublishStatus } from '@/types/deprecated/models/enums';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CourseListScreen(props: { spaceId: string }) {
  const [showAddRawCourseModal, setShowAddRawCourseModal] = useState(false);
  const router = useRouter();
  const { showNotification } = useNotificationContext();
  const { data: coursesResponse, refetch } = useRawGitCoursesQuery({
    variables: {
      spaceId: props.spaceId,
    },
  });

  const [upsertGitCourseMutation] = useUpsertGitCourseMutation();
  const onAddRawCourse = async (repoUrl: string, publishStatus: PublishStatus, weight: number) => {
    setShowAddRawCourseModal(false);
    const result = await upsertGitCourseMutation({
      variables: {
        spaceId: props.spaceId,
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

  const coursesList = coursesResponse?.payload;
  return coursesList ? (
    <div className="mt-16">
      <Table
        heading={'Courses List'}
        data={coursesList.map(
          (c): TableRow => ({
            columns: [c.courseKey, c.courseRepoUrl || 'N/A'],
            id: c.courseKey,
            item: c,
          })
        )}
        columnsHeadings={['Key', 'Repo Url']}
        columnsWidthPercents={[20, 80]}
        addNewLabel={'Add Course'}
        onAddNew={() => setShowAddRawCourseModal(true)}
      />
      <AddRawCourseModal
        open={showAddRawCourseModal}
        onAddRawCourse={(repoUrl, publishStatus, weight) => onAddRawCourse(repoUrl, publishStatus, weight)}
        onClose={() => setShowAddRawCourseModal(false)}
      />
    </div>
  ) : (
    <RowLoading />
  );
}
