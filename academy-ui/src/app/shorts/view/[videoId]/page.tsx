import VideoModal from '@/app/shorts/view/[videoId]/VideoModal';
import { ProjectShortVideo, ShortVideo } from '@/graphql/generated/generated-types';
import getApiResponse from '@/utils/api/getApiResponse';
import { getSpaceServerSide } from '@/utils/api/getSpaceServerSide';
import { Metadata } from 'next';
import React from 'react';

export async function generateMetadata({ params }: { params: { videoId: string } }): Promise<Metadata> {
  const space = (await getSpaceServerSide())!;
  const videoId = params.videoId;
  const video = await getApiResponse<ShortVideo | ProjectShortVideo>(space, `short-videos/${videoId}`);
  return {
    title: video.title,
    description: video.description,
    keywords: [],
  };
}

export default function VideoPage({ params }: { params: { videoId: string } }) {
  return <VideoModal params={params} />;
}
