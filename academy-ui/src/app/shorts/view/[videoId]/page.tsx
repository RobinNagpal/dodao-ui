import VideoModal from '@/app/shorts/view/[videoId]/VideoModal';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Metadata } from 'next';
import React from 'react';

export async function generateMetadata({ params }: { params: { videoId: string } }): Promise<Metadata> {
  const space = (await getSpaceServerSide())!;
  const videoId = params.videoId;
  const response = await fetch(`${getBaseUrl()}/api/short-videos/${videoId}?spaceId=${space.id}`);
  const video = (await response.json()).shortVideo;
  return {
    title: video.title,
    description: video.description,
    keywords: [],
  };
}

export default function VideoPage({ params }: { params: { videoId: string } }) {
  return <VideoModal params={params} />;
}
