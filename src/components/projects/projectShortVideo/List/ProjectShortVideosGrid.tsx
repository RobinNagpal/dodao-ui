'use client';

import Block from '@/components/app/Block';
import CardLoader from '@/components/core/loaders/CardLoader';
import PageWrapper from '@/components/core/page/PageWrapper';
import EditProjectShortVideoModal from '@/components/projects/projectShortVideo/Edit/EditProjectShortVideoModal';
import Shorts from '@/components/shortVideos/View/Shorts';
import ViewShortVideoModal from '@/components/shortVideos/View/ViewShortVideoModal';
import { ProjectFragment, SpaceWithIntegrationsFragment, useProjectShortVideosQuery } from '@/graphql/generated/generated-types';
import React, { useState } from 'react';

export interface ProjectShortVideosGridProps {
  space: SpaceWithIntegrationsFragment;
  project: ProjectFragment;
}
export default function ProjectShortVideosGrid({ space, project }: ProjectShortVideosGridProps) {
  const { data: queryResponse, loading, refetch } = useProjectShortVideosQuery({ variables: { projectId: project.id } });
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
  if (selectedVideoIndex !== null) {
    return (
      <ViewShortVideoModal
        initialSlide={selectedVideoIndex}
        videos={queryResponse?.projectShortVideos || []}
        onClose={() => setSelectedVideoIndex(null)}
        projectId={project.id}
        onShowEditModal={() => {
          setSelectedVideoIndex(null);
          setEditVideoIndex(selectedVideoIndex);
        }}
      />
    );
  }

  if (editVideoIndex !== null && queryResponse?.projectShortVideos?.[editVideoIndex]) {
    const shortVideo = queryResponse?.projectShortVideos?.[editVideoIndex];

    return (
      <EditProjectShortVideoModal
        shortVideoToEdit={shortVideo}
        onClose={() => setEditVideoIndex(null)}
        space={space}
        onAfterSave={() => {
          setEditVideoIndex(null);
          setSelectedVideoIndex(editVideoIndex);
          refetch();
        }}
        project={project}
      />
    );
  }

  return <Shorts shortVideos={queryResponse?.projectShortVideos || []} />;
}
