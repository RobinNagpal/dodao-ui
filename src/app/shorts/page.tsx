'use client';

import withSpace, { SpaceProps } from '@/app/withSpace';
import CardLoader from '@/components/core/loaders/CardLoader';
import EditShortVideoModal from '@/components/shortVideos/Edit/EditShortVideoModal';
import ViewShortVideoModal from '@/components/shortVideos/View/ViewShortVideoModal';
import { useShortVideosQuery } from '@/graphql/generated/generated-types';
import React, { useState } from 'react';
import Shorts from '@/components/shortVideos/View/Shorts';

const MainShortsComponent = ({ space }: SpaceProps) => {
  const { data: queryResponse, loading } = useShortVideosQuery({ variables: { spaceId: '1' } });
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number | null>(null);
  const [editVideoIndex, setEditVideoIndex] = useState<number | null>(null);
  const handleThumbnailClick = (index: number) => {
    setSelectedVideoIndex(index);
  };

  if (loading) {
    return <CardLoader numberOfCards={3} />;
  }
  if (!!selectedVideoIndex) {
    return (
      <ViewShortVideoModal
        initialSlide={selectedVideoIndex}
        onClose={() => setSelectedVideoIndex(null)}
        onShowEditModal={() => {
          setSelectedVideoIndex(null);
          setEditVideoIndex(selectedVideoIndex);
        }}
      />
    );
  }

  if (!!editVideoIndex && queryResponse?.shortVideos?.[editVideoIndex]) {
    const shortVideo = queryResponse?.shortVideos?.[editVideoIndex];

    return (
      <EditShortVideoModal
        shortVideoToEdit={shortVideo}
        onClose={() => setEditVideoIndex(null)}
        space={space}
        onSave={() => {
          setEditVideoIndex(null);
          setSelectedVideoIndex(editVideoIndex);
        }}
      />
    );
  }

  return <Shorts onThumbnailClick={handleThumbnailClick} />;
};

export default withSpace(MainShortsComponent);
