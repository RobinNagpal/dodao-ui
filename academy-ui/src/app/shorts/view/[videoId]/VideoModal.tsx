'use client';

import ViewShortVideoModal from '@/components/shortVideos/View/ViewShortVideoModal';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { ShortVideo, SpaceWithIntegrationsFragment, SpaceTypes } from '@/graphql/generated/generated-types';
import withSpace from '@/contexts/withSpace';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { TidbitCollectionTags } from '@/utils/api/fetchTags';

function VideoModal(props: { space: SpaceWithIntegrationsFragment; params: { videoId: string } }) {
  const [videos, setVideos] = React.useState<ShortVideo[]>([]);
  const [initialSlideIndex, setInitialSlideIndex] = React.useState<number>(-1);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch(`${getBaseUrl()}/api/short-videos?spaceId=${props.space.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          next: {
            tags: [TidbitCollectionTags.GET_TIDBIT_COLLECTIONS.toString()],
          },
        });

        if (response.ok) {
          const data = await response.json();
          setVideos(data.shortVideos);
          const index = data.shortVideos.findIndex((video: ShortVideo) => video.id === props.params.videoId);
          setInitialSlideIndex(index);
        } else {
          console.error('Failed to fetch short videos:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching short videos:', error);
      }
    };

    fetchVideos();
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
