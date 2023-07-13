'use client';

import withSpace from '@/app/withSpace';
import Block from '@/components/app/Block';
import RowLoading from '@/components/core/loaders/RowLoading';
import PageWrapper from '@/components/core/page/PageWrapper';
import CourseNavigation from '@/components/courses/Edit/CourseNavigation';
import ModalCourseNewItem from '@/components/courses/Edit/ModalCourseNewItem';
import BasicCourseConfigurations from '@/components/courses/View/BasicCourseConfigurations';
import CourseDetailsRightSection, { ItemTypes } from '@/components/courses/View/CourseDetailsRightSection';
import { useCourseSubmission } from '@/components/courses/View/useCourseSubmission';
import useViewCourse from '@/components/courses/View/useViewCourse';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

const StyledNavWrapper = styled.div`
  max-width: 350px;
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

const CourseView = ({ params, space }: { params: { courseInfo: string[] }; space: SpaceWithIntegrationsFragment }) => {
  const { data: session } = useSession();
  const { courseInfo } = params;

  // urls - /courses/view/${course.key}/${topic.key}/[readings/summaries/questions/submission]/[summaryKey/readingKey/questionKey]
  const courseKey = Array.isArray(courseInfo) ? courseInfo[0] : (courseInfo as string);

  const isCourseSubmissionScreen = Array.isArray(courseInfo) && courseInfo.length > 1 && courseInfo[1] === 'submission';
  const topicKey = Array.isArray(courseInfo) && courseInfo.length > 1 && !isCourseSubmissionScreen ? courseInfo[1] : undefined;

  const itemType = Array.isArray(courseInfo) && courseInfo.length > 2 ? courseInfo[2] : undefined;

  const itemKey = Array.isArray(courseInfo) && courseInfo.length > 3 ? courseInfo[3] : undefined;

  const [modalCourseNewItemOpen, setModalCourseNewItemOpen] = useState(false);

  const courseHelper = useViewCourse(space, courseKey);
  const submissionHelper = useCourseSubmission(space, courseKey);

  useEffect(() => {
    if (session) {
      if (!courseHelper.course) return;
      submissionHelper.initialize(courseHelper.course);
    }
  }, [courseHelper.course, session]);

  const { course, loading } = courseHelper;

  const showAddModal = () => {
    setModalCourseNewItemOpen(true);
  };

  return (
    <PageWrapper>
      {course ? (
        <Block slim className="w-full">
          <div className="px-4 py-3 bg-skin-header-bg lg:rounded-2xl pb-3 flex justify-between w-full">
            <Link href={`/courses/view/${courseKey}`} className="text-xl">
              <h3>{course.title}</h3>
            </Link>
            <BasicCourseConfigurations space={space} courseKey={courseKey} />
          </div>
          <div className="flex flex-col md:flex-row">
            <StyledNavWrapper className="my-4 relative overflow-scroll">
              <CourseNavigation
                course={course}
                isCourseSubmissionScreen={isCourseSubmissionScreen}
                space={space}
                showAddModal={showAddModal}
                courseHelper={courseHelper}
                submissionHelper={submissionHelper}
                topicKey={topicKey}
                itemType={itemType as ItemTypes}
                itemKey={itemKey}
              />
            </StyledNavWrapper>
            <div className="border-r-2"></div>

            <StyledRightContent className={`flex-1 m-4 ${itemType === 'questions' ? 'overflow-y-hidden' : 'overflow-hidden'}`}>
              <CourseDetailsRightSection
                course={course}
                space={space}
                isCourseAdmin={true}
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
        <ModalCourseNewItem
          open={modalCourseNewItemOpen}
          closeModal={() => setModalCourseNewItemOpen(false)}
          course={course}
          space={space}
          courseHelper={courseHelper}
          submissionHelper={submissionHelper}
        />
      )}
    </PageWrapper>
  );
};

export default withSpace(CourseView);
