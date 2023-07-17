import UpsertRawCourseModal from '@/components/app/Modal/Course/UpsertRawCourseModal';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import { Table, TableActions, TableRow } from '@/components/core/table/Table';
import { useNotificationContext } from '@/contexts/NotificationContext';
import {
  RawGitCourse,
  Space,
  useDeleteAndPullCourseRepoMutation,
  useRawGitCoursesQuery,
  useUpsertGitCourseMutation,
} from '@/graphql/generated/generated-types';
import { PublishStatus } from '@/types/deprecated/models/enums';
import React, { useMemo, useState } from 'react';
import soryBy from 'lodash/sortBy';

export interface SpaceAuthDetailsProps {
  space: Space;
  className?: string;
}

export default function SpaceCourseDetails(props: SpaceAuthDetailsProps) {
  const [showUpsertRawCourseModal, setShowUpsertRawCourseModal] = useState(false);
  const threeDotItems = [{ label: 'Add New', key: 'add' }];
  const [upsertGitCourseMutation] = useUpsertGitCourseMutation();
  const [deleteAndPullCourseRepoMutation] = useDeleteAndPullCourseRepoMutation();
  const { showNotification } = useNotificationContext();
  const [courseToEdit, setCourseToEdit] = useState<RawGitCourse | null>(null);

  const selectFromThreedotDropdown = async (e: string) => {
    setShowUpsertRawCourseModal(true);
  };

  function getCourseTableRows(courses?: RawGitCourse[]): TableRow[] {
    const sortedCourses = soryBy((courses || []) as RawGitCourse[], (course) => -course.weight);
    return sortedCourses.map(
      (course): TableRow => ({
        id: course.courseKey,
        columns: [course.courseKey, course.courseRepoUrl, course.weight.toString()],
        item: course,
      })
    );
  }

  const tableActions: TableActions = useMemo(() => {
    return {
      items: [
        {
          key: 'edit',
          label: 'Edit',
        },
        {
          key: 'deleteAndPull',
          label: 'Delete and Pull',
        },
      ],
      onSelect: async (key: string, course: RawGitCourse) => {
        if (key === 'edit') {
          setCourseToEdit(course);
          setShowUpsertRawCourseModal(true);
        } else if (key === 'deleteAndPull') {
          await deleteAndPullCourseRepoMutation({
            variables: {
              spaceId: props.space.id,
              courseKey: course.courseKey,
            },
          });

          showNotification({ type: 'success', message: 'Course deleted and pulled successfully' });
        }
      },
    };
  }, []);

  const upsertRawCourse = async (repoUrl: string, publishStatus: PublishStatus, weight: number) => {
    setShowUpsertRawCourseModal(false);
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
      showNotification({ type: 'success', message: 'Course upserted successfully' });
    } else {
      showNotification({ type: 'error', message: 'Failed to upserted course' });
    }
    setCourseToEdit(null);
    await refetch();
  };

  const { data: coursesResponse, refetch } = useRawGitCoursesQuery({
    variables: {
      spaceId: props.space.id,
    },
  });

  return (
    <div className="mt-8 mr-8">
      <div className="flex justify-between">
        <h1 className="text-xl">Courses</h1>
        <PrivateEllipsisDropdown items={threeDotItems} onSelect={selectFromThreedotDropdown} />
      </div>
      <Table
        data={getCourseTableRows(coursesResponse?.payload)}
        columnsHeadings={['Key', 'Repo URL', 'Weight']}
        columnsWidthPercents={[20, 50, 20, 10]}
        actions={tableActions}
      />
      {showUpsertRawCourseModal && (
        <UpsertRawCourseModal
          open={showUpsertRawCourseModal}
          onUpsertRawCourse={(repoUrl, publishStatus, weight) => upsertRawCourse(repoUrl, publishStatus, weight)}
          rawGitCourse={courseToEdit || undefined}
          onClose={() => {
            setShowUpsertRawCourseModal(false);
            setCourseToEdit(null);
          }}
        />
      )}
    </div>
  );
}
