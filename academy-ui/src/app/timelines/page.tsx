import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import React from 'react';
import TimelinesInformation from './TimelinesGrid.';
import { Metadata } from 'next';
import { getSpaceServerSide } from '@/utils/api/getSpaceServerSide';

export async function generateMetadata(): Promise<Metadata> {
  const space = (await getSpaceServerSide())!;
  return {
    title: 'Timelines',
    description: `Timelines about new updates on ${space.name}`,
    keywords: [],
  };
}

function Timeline() {
  return (
    <PageWrapper>
      <TimelinesInformation />
    </PageWrapper>
  );
}

export default Timeline;
