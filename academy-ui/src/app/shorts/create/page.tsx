'use client';

import withSpace, { SpaceProps } from '@/app/withSpace';
import PageWrapper from '@/components/core/page/PageWrapper';
import EditShortVideoView from '@/components/shortVideos/Edit/EditShortVideoView';
import { useRouter } from 'next/navigation';
import React from 'react';

const MainShortsComponent = ({ space }: SpaceProps) => {
  const router = useRouter();
  return (
    <PageWrapper>
      <EditShortVideoView space={space} onAfterSave={() => router.push('/shorts')} onCancel={() => router.push('/shorts')} />
    </PageWrapper>
  );
};

export default withSpace(MainShortsComponent);
