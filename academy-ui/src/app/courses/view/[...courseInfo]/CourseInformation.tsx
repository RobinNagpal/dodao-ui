'use client';

import DeleteCourseSubmissionModal from '@/components/app/Modal/Course/DeleteCourseSubmissionModal';
import AddNewCourseContentModal from '@/components/courses/Edit/AddNewCourseContentModal';
import CourseNavigationNew from '@/components/courses/Edit/CourseNavigationNew';
import BasicCourseConfigurations from '@/components/courses/View/BasicCourseConfigurations';
import CourseDetailsRightSection, { ItemTypes } from '@/components/courses/View/CourseDetailsRightSection';
import { useCourseSubmission } from '@/components/courses/View/useCourseSubmission';
import useViewCourse from '@/components/courses/View/useViewCourse';
import withSpace from '@/contexts/withSpace';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { isAdmin } from '@/utils/auth/isAdmin';
import Block from '@dodao/web-core/components/app/Block';
import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import RowLoading from '@dodao/web-core/components/core/loaders/RowLoading';
import { Session } from '@dodao/web-core/types/auth/Session';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { isSuperAdmin } from '@dodao/web-core/utils/auth/superAdmins';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import styled from 'styled-components';

type CourseInformationProps = {
  courseInfo: string[];
  space: SpaceWithIntegrationsFragment;
};

const StyledNavWrapper = styled.div`
  max-width: 350px;
  min-width: 300px;
  overflow-y: auto;

  height: calc(65vh);

  /* Hide the scrollbar width */
  ::-webkit-scrollbar {
    width: 0.5em;
  }

  ::-webkit-scrollbar-track {
    background-color: transparent;
  }
`;

const StyledRightContent = styled.div`
  @screen md {
    &.overflow-hidden {
      overflow: hidden;
    }
  }

  > div {
    display: flex;
    flex-direction: column;
    padding-right: 16px;
  }
`;

const DeleteButton = styled(IconButton)`
  background-color: red;
  border-color: white;
`;

const CourseInformation = ({ courseInfo, space }: CourseInformationProps) => {
  const { data: sessionData } = useSession();
  const session: Session | null = sessionData as Session | null;

  // urls - /courses/view/${course.key}/${topic.key}/[readings/summaries/questions/submission]/[summaryKey/readingKey/questionKey]
  const courseKey = Array.isArray(courseInfo) ? courseInfo[0] : (courseInfo as string);

  const isCourseSubmissionScreen = Array.isArray(courseInfo) && courseInfo.length > 1 && courseInfo[1] === 'submission';
  const topicKey = Array.isArray(courseInfo) && courseInfo.length > 1 && !isCourseSubmissionScreen ? courseInfo[1] : undefined;

  const itemType = Array.isArray(courseInfo) && courseInfo.length > 2 ? courseInfo[2] : undefined;

  const itemKey = Array.isArray(courseInfo) && courseInfo.length > 3 ? courseInfo[3] : undefined;

  const [showDeleteSubmissionModal, setShowDeleteSubmissionModal] = useState(false);

  const [modalCourseNewItemOpen, setModalCourseNewItemOpen] = useState(false);

  const courseHelper = useViewCourse(space, courseKey);
  const submissionHelper = useCourseSubmission(space, courseKey);

  const { course, loading } = courseHelper;

  const isCourseAdmin =
    session && (isAdmin(session as Session, space) || isSuperAdmin(session as Session) || course?.courseAdmins?.includes(session?.username));

  const showAddModal = () => {
    setModalCourseNewItemOpen(true);
  };

  return (
    <>
      {course ? (
        <Block slim className="w-full">
          <div className="px-4 py-3 bg-skin-header-bg lg:rounded-2xl pb-3 flex justify-between w-full">
            <Link href={`/courses/view/${courseKey}`} className="text-xl">
              <h3>{course.title}</h3>
            </Link>
            <div>
              {submissionHelper.courseSubmission && <DeleteButton iconName={IconTypes.Trash} onClick={() => setShowDeleteSubmissionModal(true)} />}
              <BasicCourseConfigurations space={space} courseKey={courseKey} />
            </div>
          </div>
          <div className="flex flex-col md:flex-row">
            <StyledNavWrapper className="my-4 relative overflow-scroll">
              <CourseNavigationNew
                course={course}
                isCourseSubmissionScreen={isCourseSubmissionScreen}
                space={space}
                showAddModal={showAddModal}
                courseHelper={courseHelper}
                submissionHelper={submissionHelper}
                topicKey={topicKey}
                itemType={itemType as ItemTypes}
                itemKey={itemKey}
                isCourseAdmin={!!isCourseAdmin}
              />
            </StyledNavWrapper>
            <div className="border-r-2"></div>

            <StyledRightContent className={`flex-1 m-4 ${itemType === 'questions' ? 'overflow-y-hidden' : 'overflow-hidden'}`}>
              <CourseDetailsRightSection
                course={course}
                space={space}
                isCourseAdmin={!!isCourseAdmin}
                courseHelper={courseHelper}
                submissionHelper={submissionHelper}
                isCourseSubmissionScreen={isCourseSubmissionScreen}
                topicKey={topicKey}
                itemType={itemType as ItemTypes}
                itemKey={itemKey}
              />
            </StyledRightContent>
          </div>
        </Block>
      ) : (
        loading && (
          <Block slim>
            <RowLoading className="my-2" />
          </Block>
        )
      )}
      {course && (
        <AddNewCourseContentModal
          open={modalCourseNewItemOpen}
          closeModal={() => setModalCourseNewItemOpen(false)}
          course={course}
          space={space}
          courseHelper={courseHelper}
          submissionHelper={submissionHelper}
        />
      )}
      {showDeleteSubmissionModal && (
        <DeleteCourseSubmissionModal
          open={showDeleteSubmissionModal}
          onClose={() => setShowDeleteSubmissionModal(false)}
          onDelete={async () => {
            await fetch(`${getBaseUrl()}/api/courses/submission/course-submissions/${courseKey}`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                spaceId: space.id,
                courseKey: courseKey,
              }),
            });

            window.location.reload();
          }}
        />
      )}
    </>
  );
};

export default withSpace(CourseInformation);
