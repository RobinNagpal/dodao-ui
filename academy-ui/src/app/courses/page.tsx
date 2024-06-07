import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import MainContainer from '@dodao/web-core/components/main/Container/MainContainer';
import React from 'react';
import CoursesInformation from './CoursesGrid';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Courses',
  description: 'Different courses related to Blockchain',
};

function Courses() {
  return (
    <MainContainer>
      <PageWrapper>
        <CoursesInformation />
      </PageWrapper>
    </MainContainer>
  );
}

export default Courses;
