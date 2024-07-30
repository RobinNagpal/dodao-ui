import EditShortVideoForm from '@/components/shortVideos/Edit/EditShortVideoForm';
import { ShortVideo, ShortVideoInput, SpaceWithIntegrationsFragment, useUpsertShortVideoMutation } from '@/graphql/generated/generated-types';
import React from 'react';

export interface EditShortVideoModalProps {
  shortVideoToEdit?: ShortVideo;
  space: SpaceWithIntegrationsFragment;
  onAfterSave: () => void;
  onCancel: () => void;
}

export default function EditShortVideoView({ shortVideoToEdit, space, onAfterSave, onCancel }: EditShortVideoModalProps) {
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
