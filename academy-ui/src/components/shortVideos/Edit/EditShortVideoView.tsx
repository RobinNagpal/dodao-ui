import EditShortVideoForm from '@/components/shortVideos/Edit/EditShortVideoForm';
import { ShortVideo, ShortVideoInput, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { ByteCollectionSummary } from '@/types/byteCollections/byteCollection';
import React from 'react';

export interface EditShortVideoModalProps {
  shortVideoToEdit?: ShortVideo;
  space: SpaceWithIntegrationsFragment;
  byteCollection: ByteCollectionSummary;
  closeEditShortModal?: () => void;
  onAfterSave?: () => void;
  onCancel: () => void;
}

export default function EditShortVideoView({ shortVideoToEdit, space, byteCollection, onCancel, closeEditShortModal }: EditShortVideoModalProps) {
  const upsertShortVideo = async (shortVideo: ShortVideoInput) => {
    await fetch(`/api/short-videos/${shortVideo.id}`, {
      method: 'POST',
      body: JSON.stringify({
        spaceId: space.id,
        shortVideo: {
          id: shortVideo.id,
          title: shortVideo.title,
          description: shortVideo.description,
          priority: shortVideo.priority,
          videoUrl: shortVideo.videoUrl,
          thumbnail: shortVideo.thumbnail,
        },
        byteCollectionId: byteCollection.id,
      }),
    });
  };

  return (
    <EditShortVideoForm
      onCancel={onCancel}
      shortVideoToEdit={shortVideoToEdit}
      spaceId={space.id}
      saveShortVideoFn={upsertShortVideo}
      closeEditShortModal={closeEditShortModal}
    />
  );
}
