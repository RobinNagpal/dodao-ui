'use client';

import withSpace, { SpaceProps } from '@/app/withSpace';
import Block from '@/components/app/Block';
import CardLoader from '@/components/core/loaders/CardLoader';
import PageWrapper from '@/components/core/page/PageWrapper';
import EditShortVideoModal from '@/components/shortVideos/Edit/EditShortVideoModal';
import ViewShortVideoModal from '@/components/shortVideos/View/ViewShortVideoModal';
import { useShortVideosQuery } from '@/graphql/generated/generated-types';
import React, { useState } from 'react';
import Shorts from '@/components/shortVideos/View/Shorts';

const MainShortsComponent = ({ space }: SpaceProps) => {
  const { data: queryResponse, loading, refetch } = useShortVideosQuery({ variables: { spaceId: space.id } });
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number | null>(null);
  const [editVideoIndex, setEditVideoIndex] = useState<number | null>(null);
  const handleThumbnailClick = (index: number) => {
    setSelectedVideoIndex(index);
  };

  if (loading) {
    return (
      <PageWrapper>
        <Block>
          <CardLoader numberOfCards={3} />
        </Block>
      </PageWrapper>
    );
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
          refetch();
        }}
      />
    );
  }

  return <Shorts onThumbnailClick={handleThumbnailClick} shortVideos={queryResponse?.shortVideos || []} />;
};

export default withSpace(MainShortsComponent);
