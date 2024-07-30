'use client';

import ViewShortVideoModal from '@/components/shortVideos/View/ViewShortVideoModal';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { ShortVideo, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import withSpace from '@/contexts/withSpace';

function VideoModal(props: { space: SpaceWithIntegrationsFragment; params: { videoId: string } }) {
  const [videos, setVideos] = React.useState<ShortVideo[]>([]);
  useEffect(() => {
    axios.get(`/api/short-videos?spaceId=${props.space.id}`).then((response) => setVideos(response.data.shortVideos));
  }, [props.space.id]);

  const router = useRouter();
  // const videos = [
  //   {
  //     id: '23b50a5c-4648-4406-8b7b-62c315abf16b',
  //     title: "What's new in Uniswap V4 - 1?",
  //     description: "What's new in Uniswap V4? What's new in Uniswap V4?",
  //     thumbnail:
  //       'https://d31h13bdjwgzxs.cloudfront.net/academy/test-academy-eth/ShortVideo/23b50a5c_4648_4406_8b7b_62c315abf16b/1704973424337_uniswap_v4_hooks.png',
  //     videoUrl: 'https://dodao-prod-public-assets.s3.amazonaws.com/testing/Uniswap_V4.mp4',
  //     priority: 50,
  //     createdAt: '1702309508674',
  //     updatedAt: '1704973427275',
  //   },
  //   {
  //     id: 'f2e09d7e-7ef0-4b7b-b070-3dadccd54458',
  //     title: 'What is ETC-4337?',
  //     description: 'What is ETC-4337?',
  //     thumbnail:
  //       'https://d31h13bdjwgzxs.cloudfront.net/academy/test-academy-eth/ShortVideo/f2e09d7e_7ef0_4b7b_b070_3dadccd54458/1704973443923_why_erc_4337.png',
  //     videoUrl: 'https://dodao-prod-public-assets.s3.amazonaws.com/testing/Why_everyone_is_talking_about_ERC-4337.mp4',
  //     priority: 50,
  //     createdAt: '1702309458622',
  //     updatedAt: '1704973446105',
  //   },
  // ];

  return (
    <ViewShortVideoModal
      initialSlide={videos.findIndex((video) => video.id === props.params.videoId)}
      videos={videos}
      onClose={() => router.push('/shorts')}
      onShowEditModal={() => {
        router.push(`/shorts/edit/${props.params.videoId}`);
      }}
    />
  );
}

export default withSpace(VideoModal);
