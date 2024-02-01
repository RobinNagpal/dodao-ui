import PageWrapper from '@/components/core/page/PageWrapper';
import React from 'react';
import TimelinesInformation from './component/timelinesInfo';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Timelines',
  description: 'Timelines about new trending things about Blockchain',
};

function Timeline() {
  return (
    <PageWrapper>
      <TimelinesInformation />
    </PageWrapper>
  );
}

export default Timeline;
