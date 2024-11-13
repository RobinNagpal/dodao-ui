import UpsertRawCourseModal from '@/components/app/Modal/Course/UpsertRawCourseModal';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import { RawGitCourse } from '@/graphql/generated/generated-types';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import { Table, TableActions, TableRow } from '@dodao/web-core/components/core/table/Table';
import { PublishStatus } from '@dodao/web-core/types/deprecated/models/enums';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import soryBy from 'lodash/sortBy';
import React, { useEffect, useMemo, useState } from 'react';

export interface SpaceAuthDetailsProps {
  space: SpaceWithIntegrationsDto;
  className?: string;
}

export default function SpaceCourseDetails(props: SpaceAuthDetailsProps) {
  const [showUpsertRawCourseModal, setShowUpsertRawCourseModal] = useState(false);
  const threeDotItems = [{ label: 'Add New', key: 'add' }];
  const { showNotification } = useNotificationContext();
  const [courseToEdit, setCourseToEdit] = useState<RawGitCourse | null>(null);
  const [coursesResponse, setCoursesResponse] = useState<{ rawGitCourses?: RawGitCourse[] }>();

  useEffect(() => {
    async function fetchData() {
      const response = await fetch(`/api/courses/${props.space.id}`);
      const data = await response.json();
      setCoursesResponse(data);
    }
    // This logic won't work as we don't have raw courses now
    fetchData();
  }, [props.space.id]);

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
          // This call won't work as the logic is not implemented in the backend
          await fetch(`/api/courses/delete-and-pull-course-repo`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              spaceId: props.space.id,
              courseKey: course.courseKey,
            }),
          });

          showNotification({ type: 'success', message: 'Course deleted and pulled successfully' });
        }
      },
    };
  }, []);

  const upsertRawCourse = async (repoUrl: string, publishStatus: PublishStatus, weight: number) => {
    setShowUpsertRawCourseModal(false);
    // This logic won't work as the backend logic isn't implemented
    const response = await fetch(`/api/courses/${courseToEdit?.courseKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        spaceId: props.space.id,
        gitCourseInput: {
          courseRepoUrl: repoUrl,
          publishStatus,
          weight,
        },
      }),
    });

    if (response.ok) {
      showNotification({ type: 'success', message: 'Course upserted successfully' });
    } else {
      showNotification({ type: 'error', message: 'Failed to upserted course' });
    }
    setCourseToEdit(null);
  };

  return (
    <div className="mt-8">
      <div className="flex justify-between">
        <div className="text-xl">Courses</div>
        <PrivateEllipsisDropdown items={threeDotItems} onSelect={selectFromThreedotDropdown} />
      </div>
      <Table
        data={getCourseTableRows(coursesResponse?.rawGitCourses)}
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
