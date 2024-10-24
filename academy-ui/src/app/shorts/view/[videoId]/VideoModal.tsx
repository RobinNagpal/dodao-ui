'use client';

import ViewShortVideoModal from '@/components/shortVideos/View/ViewShortVideoModal';
import { SpaceTypes } from '@/types/space/SpaceDto';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { ShortVideo, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import withSpace from '@/contexts/withSpace';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

function VideoModal(props: { space: SpaceWithIntegrationsFragment; params: { videoId: string } }) {
  const [videos, setVideos] = React.useState<ShortVideo[]>([]);
  const [initialSlideIndex, setInitialSlideIndex] = React.useState<number>(-1);

  useEffect(() => {
    axios.get(`${getBaseUrl()}/api/short-videos?spaceId=${props.space.id}`).then((response) => {
      setVideos(response.data.shortVideos);
      const index = response.data.shortVideos.findIndex((video: ShortVideo) => video.id === props.params.videoId);
      setInitialSlideIndex(index);
    });
  }, [props.space.id, props.params.videoId]);

  const router = useRouter();
  return (
    <ViewShortVideoModal
      key={initialSlideIndex}
      initialSlide={initialSlideIndex}
      videos={videos}
      onClose={() => (props.space.type === SpaceTypes.TidbitsSite ? router.push('/') : router.push('/tidbit-collections'))}
      onShowEditModal={() => {
        router.push(`/shorts/edit/${props.params.videoId}`);
      }}
    />
  );
}

export default withSpace(VideoModal);
