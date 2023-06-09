'use client';

import withSpace from '@/app/withSpace';
import SidebarButton from '@/components/app/Button/SidebarButton';
import EditIcon from '@/components/app/Icons/EditIcon';
import Button from '@/components/core/buttons/Button';
import FullPageLoader from '@/components/core/loaders/FullPageLoading';
import {
  CourseBasicInfoInput,
  CourseDetailsFragment,
  SpaceWithIntegrationsFragment,
  useCoursesQueryQuery,
  useGitCourseQueryQuery,
} from '@/graphql/generated/generated-types';
import { getMarkedRenderer } from '@/utils/ui/getMarkedRenderer';
import { marked } from 'marked';
import Link from 'next/link';

import React, { useEffect, useMemo, useState } from 'react';

const CourseView = ({ params, space }: { params: { courseInfo: string[] }; space: SpaceWithIntegrationsFragment }) => {
  const { courseInfo } = params;

  const courseKey = Array.isArray(courseInfo) ? courseInfo[0] : (courseInfo as string);

  const [editMode, setEditMode] = useState(false);
  const [course, setCourse] = useState<CourseDetailsFragment>();
  const { refetch } = useGitCourseQueryQuery({
    variables: {
      spaceId: space.id,
      courseKey: courseKey,
    },
    skip: true,
  });

  useEffect(() => {
    (async () => {
      const response = await refetch();
      const courseResponse = response.data?.course;
      if (courseResponse) {
        setCourse(courseResponse);
      }
    })();
  });

  const renderer = useMemo(() => getMarkedRenderer(), []);
  const details = useMemo(() => marked.parse(course?.details || '', { renderer }), [course, renderer]);

  const cancelEditMode = () => setEditMode(false);
  const showEditMode = () => setEditMode(true);

  const saveUpdates = (updates: CourseBasicInfoInput) => {};
  const isCourseAdmin = true;
  if (editMode) {
    // return <EditCourse course={course} space={space} updateCourse={saveUpdates} cancel={cancelEditMode} />;
  }

  return (
    <div>
      {course ? (
        <div className="h-full flex flex-col justify-between">
          <div>
            <div className="flex justify-between">
              <h1 className="mb-4">{course.title}</h1>
              {isCourseAdmin && (
                <SidebarButton onClick={showEditMode} className="mr-8">
                  <EditIcon />
                </SidebarButton>
              )}
            </div>

            <div className="mb-4">{course?.summary}</div>
            <p dangerouslySetInnerHTML={{ __html: details }} className="markdown-body"></p>
          </div>

          <div>
            <div className="flex flex-between mt-4 flex-1 items-end p-2">
              <div className="flex-1"></div>
              {course?.topics.length > 0 && (
                <Link href={`/topic/${course?.topics[0].key}`}>
                  <Button primary variant="contained">
                    Next
                    <span className="ml-2 font-bold">&#8594;</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      ) : (
        <FullPageLoader />
      )}
    </div>
  );
};
export default withSpace(CourseView);
