'use client';

import withSpace, { SpaceProps } from '@/app/withSpace';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import EditShortVideoView from '@/components/shortVideos/Edit/EditShortVideoView';
import { useShortVideoQuery } from '@/graphql/generated/generated-types';
import { useRouter } from 'next/navigation';
import React from 'react';

const MainShortsComponent = ({ space, params }: SpaceProps & { params?: { videoId: string } }) => {
  const router = useRouter();
  const result = useShortVideoQuery({
    variables: { spaceId: space.id, id: params?.videoId! },
  });
  return (
    <PageWrapper>
      <EditShortVideoView
        space={space}
        onAfterSave={() => router.push('/shorts')}
        onCancel={() => router.push('/shorts')}
        shortVideoToEdit={result.data?.shortVideo}
      />
    </PageWrapper>
  );
};

export default withSpace(MainShortsComponent);
