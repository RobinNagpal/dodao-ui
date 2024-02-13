'use client';

import withSpace, { SpaceProps } from '@/app/withSpace';
import PageWrapper from '@/components/core/page/PageWrapper';
import EditShortVideoView from '@/components/shortVideos/Edit/EditShortVideoView';
import { useRouter } from 'next/navigation';
import React from 'react';

const MainShortsComponent = ({ space, params }: SpaceProps & { params?: { videoId: string } }) => {
  const router = useRouter();
  return (
    <PageWrapper>
      <EditShortVideoView
        space={space}
        onAfterSave={() => router.push('/shorts')}
        onCancel={() => router.push('/shorts')}
        shortVideoToEdit={{
          id: '23b50a5c-4648-4406-8b7b-62c315abf16b',
          title: "What's new in Uniswap V4 - 1?",
          description: "What's new in Uniswap V4? What's new in Uniswap V4?",
          thumbnail:
            'https://d31h13bdjwgzxs.cloudfront.net/academy/test-academy-eth/ShortVideo/23b50a5c_4648_4406_8b7b_62c315abf16b/1704973424337_uniswap_v4_hooks.png',
          videoUrl: 'https://dodao-prod-public-assets.s3.amazonaws.com/testing/Uniswap_V4.mp4',
          priority: 50,
          createdAt: '1702309508674',
          updatedAt: '1704973427275',
        }}
      />
    </PageWrapper>
  );
};

export default withSpace(MainShortsComponent);
