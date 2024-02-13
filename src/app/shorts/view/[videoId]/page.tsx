import VideoModal from '@/app/shorts/view/[videoId]/VideoModal';
import { Metadata } from 'next';
import React from 'react';

export async function generateMetadata({ params }: { params: { videoId: string } }): Promise<Metadata> {
  const video = {
    id: '23b50a5c-4648-4406-8b7b-62c315abf16b',
    title: "What's new in Uniswap V4 - 1?",
    description: "What's new in Uniswap V4? What's new in Uniswap V4?",
    thumbnail:
      'https://d31h13bdjwgzxs.cloudfront.net/academy/test-academy-eth/ShortVideo/23b50a5c_4648_4406_8b7b_62c315abf16b/1704973424337_uniswap_v4_hooks.png',
    videoUrl: 'https://dodao-prod-public-assets.s3.amazonaws.com/testing/Uniswap_V4.mp4',
    priority: 50,
    createdAt: '1702309508674',
    updatedAt: '1704973427275',
  };

  return {
    title: video.title,
    description: video.description,
    keywords: [],
  };
}

export default function VideoPage({ params }: { params: { videoId: string } }) {
  return <VideoModal params={params} />;
}
