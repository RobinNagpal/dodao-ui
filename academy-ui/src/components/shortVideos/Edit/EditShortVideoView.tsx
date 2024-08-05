import EditShortVideoForm from '@/components/shortVideos/Edit/EditShortVideoForm';
import {
  ShortVideo,
  ShortVideoInput,
  SpaceWithIntegrationsFragment,
  ByteCollectionFragment,
  useUpsertShortVideoMutation,
} from '@/graphql/generated/generated-types';
import React from 'react';

export interface EditShortVideoModalProps {
  shortVideoToEdit?: ShortVideo;
  space: SpaceWithIntegrationsFragment;
  byteCollection: ByteCollectionFragment;
  onAfterSave: () => void;
  onCancel: () => void;
}

export default function EditShortVideoView({ shortVideoToEdit, space, byteCollection, onAfterSave, onCancel }: EditShortVideoModalProps) {
  const upsertShortVideo = async (shortVideo: ShortVideoInput) => {
    const response = await fetch(`/api/short-videos/${shortVideo.id}`, {
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
      }),
    });

    const { upsertedShortVideo } = await response.json();

    const mappingResponse = await fetch('/api/mapping/upsertShortVideoMapping', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        byteCollectionId: byteCollection.id,
        itemId: upsertedShortVideo.id,
        itemType: 'Short',
        order: byteCollection.shorts.length + 1,
      }),
    });
  };

  return (
    <EditShortVideoForm
      onCancel={onCancel}
      shortVideoToEdit={shortVideoToEdit}
      spaceId={space.id}
      saveShortVideoFn={upsertShortVideo}
      onAfterSave={onAfterSave}
    />
  );
}
