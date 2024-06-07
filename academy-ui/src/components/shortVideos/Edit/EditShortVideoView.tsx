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
  const [upsertShortVideoMutation] = useUpsertShortVideoMutation();

  const upsertShortVideo = async (shortVideo: ShortVideoInput) => {
    await upsertShortVideoMutation({
      variables: {
        shortVideo: {
          id: shortVideo.id,
          title: shortVideo.title,
          description: shortVideo.description,
          priority: shortVideo.priority,
          videoUrl: shortVideo.videoUrl,
          thumbnail: shortVideo.thumbnail,
        },
        spaceId: space.id,
      },
      refetchQueries: ['ShortVideos'],
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
