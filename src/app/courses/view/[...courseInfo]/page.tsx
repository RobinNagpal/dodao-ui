'use client';

import withSpace from '@/app/withSpace';
import Block from '@/components/app/Block';
import RowLoading from '@/components/app/RowLoading';
import EllipsisDropdown from '@/components/core/dropdowns/EllipsisDropdown';
import CourseNavigation from '@/components/courses/Edit/CourseNavigation';
import ModalCourseNewItem from '@/components/courses/Edit/ModalCourseNewItem';
import CourseDetailsRightSection, { ItemTypes } from '@/components/courses/View/CourseDetailsRightSection';
import { useCourseSubmission } from '@/components/courses/View/useCourseSubmission';
import useViewCourse from '@/components/courses/View/useViewCourse';
import { CourseDetailsFragment, SpaceWithIntegrationsFragment, useGitCourseQueryQuery } from '@/graphql/generated/generated-types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

const StyledNavWrapper = styled.div`
  max-width: 400px;
  overflow: hidden;
`;

const StyledRightContent = styled.div`
  @screen md {
    min-height: calc(100vh - 295px);
  }

  > div {
    display: flex;
    flex-direction: column;
    min-height: 90%;
  }
`;

const CourseView = ({ params, space }: { params: { courseInfo: string[] }; space: SpaceWithIntegrationsFragment }) => {
  const router = useRouter();
  const { courseInfo } = params;

  // urls - /courses/view/${course.key}/${topic.key}/[readings/summaries/questions/submission]/[summaryKey/readingKey/questionKey]
  const courseKey = Array.isArray(courseInfo) ? courseInfo[0] : (courseInfo as string);

  const topicKey = Array.isArray(courseInfo) && courseInfo.length > 1 ? courseInfo[1] : undefined;

  const itemType = Array.isArray(courseInfo) && courseInfo.length > 2 ? courseInfo[2] : undefined;

  const itemKey = Array.isArray(courseInfo) && courseInfo.length > 3 ? courseInfo[3] : undefined;

  console.log('course view params', {
    courseKey,
    topicKey,
    itemType,
    itemKey,
  });

  const [modalCourseNewItemOpen, setModalCourseNewItemOpen] = useState(false);

  const courseHelper = useViewCourse(space, courseKey);
  const submissionHelper = useCourseSubmission(space, courseKey);
  useEffect(() => {
    console.log('reload course', courseKey);
  }, [courseKey]);
  const isAdmin = true;

  const isCourseAdmin = true;

  const isSuperAdmin = true;

  useEffect(() => {
    if (!courseHelper.course) return;
    if (!submissionHelper.loadedSubmission) return;

    submissionHelper.loadCourseSubmission(courseHelper.course);
  }, [courseHelper.course, submissionHelper.loadedSubmission]);
  function editCourseRepo() {}

  function gitCourseIntegrations() {}

  function refreshCourse() {}

  const selectFromThreedotDropdown = (e: string) => {
    if (e === 'editCourseRepo') editCourseRepo();
    if (e === 'gitCourseIntegrations') gitCourseIntegrations();
    if (e === 'refreshCourse') refreshCourse();
  };

  const threeDotItems = [
    { label: 'Edit Course Repo', key: 'refreshCourse' },
    { label: 'Integrations', key: 'gitCourseIntegrations' },
    { label: 'Refresh', key: 'refreshCourse' },
  ];

  const showAddModal = () => {
    setModalCourseNewItemOpen(true);
  };

  const { course, loading } = courseHelper;

  return (
    <div className="pt-6 container-default">
      {course ? (
        <Block slim className="w-full">
          <div className="px-4 py-3 bg-skin-header-bg lg:rounded-2xl pb-3 flex justify-between w-full">
            <Link href={`/courses/view/${courseKey}`}>
              <h3>{course.title}</h3>
            </Link>
            {isSuperAdmin && (
              <div className="pull-right float-right mr-2 topnav-domain-navigation-three-dots">
                <EllipsisDropdown items={threeDotItems} onSelect={selectFromThreedotDropdown} />
              </div>
            )}
          </div>
          <div className="flex flex-col md:flex-row">
            <StyledNavWrapper className="my-4 relative overflow-scroll border-r-2 h-full">
              <CourseNavigation course={course} space={space} showAddModal={showAddModal} courseHelper={courseHelper} submissionHelper={submissionHelper} />
            </StyledNavWrapper>
            <StyledRightContent className="flex-1 m-4">
              <CourseDetailsRightSection
                course={course}
                space={space}
                isCourseAdmin={true}
                courseHelper={courseHelper}
                submissionHelper={submissionHelper}
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
    </div>
  );
};

export default withSpace(CourseView);
