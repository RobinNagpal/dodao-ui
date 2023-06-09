'use client';

import withSpace from '@/app/withSpace';
import Block from '@/components/app/Block';
import RowLoading from '@/components/app/RowLoading';
import EllipsisDropdown from '@/components/core/dropdowns/EllipsisDropdown';
import CourseNavigation from '@/components/courses/Edit/CourseNavigation';
import ModalCourseNewItem from '@/components/courses/Edit/ModalCourseNewItem';
import { CourseDetailsFragment, SpaceWithIntegrationsFragment, useGitCourseQueryQuery } from '@/graphql/generated/generated-types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

const StyledNavWrapper = styled.div`
  @screen md {
    max-width: 300px;

    > div {
      position: absolute;
    }
  }
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

  const courseKey = Array.isArray(courseInfo) ? courseInfo[0] : (courseInfo as string);

  const [modalCourseNewItemOpen, setModalCourseNewItemOpen] = useState(false);
  const [course, setCourse] = useState<CourseDetailsFragment>();

  const { refetch, loading } = useGitCourseQueryQuery({
    variables: {
      spaceId: space.id,
      courseKey: courseKey,
    },
    skip: true,
  });

  const isAdmin = true;

  const isCourseAdmin = true;

  const isSuperAdmin = true;

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

  useEffect(() => {
    (async () => {
      const response = await refetch();
      const courseResponse = response.data?.course;
      if (courseResponse) {
        setCourse(courseResponse);
      }
    })();
  });

  const showAddModal = () => {
    setModalCourseNewItemOpen(true);
  };

  return (
    <div className="mt-6 pt-2 container-default">
      {course ? (
        <Block slim className="w-full">
          <div className="px-4 py-3 bg-skin-header-bg lg:rounded-2xl pb-3 flex justify-between w-full">
            <Link href={`/courses/${courseKey}`}>
              <h3>{course.title}</h3>
            </Link>
            {isSuperAdmin && (
              <div className="pull-right float-right mr-2 topnav-domain-navigation-three-dots">
                <EllipsisDropdown items={threeDotItems} onSelect={selectFromThreedotDropdown} />
              </div>
            )}
          </div>

          {course && (
            <div className="flex flex-col md:flex-row">
              <StyledNavWrapper className="my-4 relative overflow-scroll border-r-2">
                <CourseNavigation course={course} space={space} showAddModal={showAddModal} />
              </StyledNavWrapper>
              <StyledRightContent className="flex-1 m-4">
                <div>Right Section</div>
              </StyledRightContent>
            </div>
          )}
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
          courseHelper={{}}
          submissionHelper={{}}
        />
      )}
    </div>
  );
};

export default withSpace(CourseView);
