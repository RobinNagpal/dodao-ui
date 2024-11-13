'use client';

import EditCourse from '@/components/courses/Edit/EditCourse';
import { CourseSubmissionHelper } from '@/components/courses/View/useCourseSubmission';
import { CourseHelper } from '@/components/courses/View/useViewCourse';
import { CourseBasicInfoInput, CourseDetailsFragment } from '@/graphql/generated/generated-types';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import Button from '@dodao/web-core/components/core/buttons/Button';
import SidebarButton from '@dodao/web-core/components/core/buttons/SidebarButton';
import EditIcon from '@dodao/web-core/components/core/icons/EditIcon';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import { getMarkedRenderer } from '@dodao/web-core/utils/ui/getMarkedRenderer';
import { marked } from 'marked';
import Link from 'next/link';

import React, { useMemo, useState } from 'react';

interface ChapterDetailsProps {
  course: CourseDetailsFragment;
  space: SpaceWithIntegrationsDto;
  isCourseAdmin: boolean;
  courseHelper: CourseHelper;
  submissionHelper: CourseSubmissionHelper;
}

const CourseDetails = ({ course, space, isCourseAdmin, courseHelper, submissionHelper }: ChapterDetailsProps) => {
  const [editMode, setEditMode] = useState(false);

  const renderer = useMemo(() => getMarkedRenderer(), []);
  const details = useMemo(() => marked.parse(course?.details || '', { renderer }), [course, renderer]);
  const [updating, setUpdating] = useState(false);

  const cancelEditMode = () => setEditMode(false);
  const showEditMode = () => setEditMode(true);

  const saveUpdates = async (updates: CourseBasicInfoInput) => {
    setUpdating(true);
    try {
      await fetch(`/api/courses/update-basic-info`, {
        method: 'POST',
        body: JSON.stringify({
          spaceId: space.id,
          courseBasicInfo: updates,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setEditMode(false);
    } catch (e) {
      console.error(e);
      setUpdating(false);
    }
  };

  if (editMode) {
    return <EditCourse course={course} space={space} updateCourse={saveUpdates} cancel={cancelEditMode} updating={updating} />;
  }

  return (
    <div className="h-full">
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
                <Link href={`/courses/view/${course.key}/${course?.topics[0].key}`}>
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
export default CourseDetails;
