'use client';

import withSpace, { SpaceProps } from '@/contexts/withSpace';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import EditShortVideoView from '@/components/shortVideos/Edit/EditShortVideoView';
import { ShortVideoFragment } from '@/graphql/generated/generated-types';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import axios from 'axios';

const MainShortsComponent = ({ space, params }: SpaceProps & { params?: { videoId: string } }) => {
  const router = useRouter();
  const [videoResponse, setVideoResponse] = React.useState<{ shortVideo?: ShortVideoFragment }>();

  useEffect(() => {
    async function fetchData() {
      const response = await axios.get(`/api/short-videos/${params?.videoId}?spaceId=${space.id}`);
      setVideoResponse(response.data);
    }
    fetchData();
  }, [params?.videoId, space.id]);

  return (
    <PageWrapper>
      {/* <EditShortVideoView
        space={space}
        onAfterSave={() => router.push('/shorts')}
        onCancel={() => router.push('/shorts')}
        shortVideoToEdit={videoResponse?.shortVideo}
      /> */}
    </PageWrapper>
  );
};

export default withSpace(MainShortsComponent);
