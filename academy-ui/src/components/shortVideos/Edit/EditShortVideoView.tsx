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
  onAfterSave?: () => void;
  onCancel: () => void;
}

export default function EditShortVideoView({ shortVideoToEdit, space, byteCollection, onCancel }: EditShortVideoModalProps) {
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
        byteCollectionId: byteCollection.id,
      }),
    });
  };

  return <EditShortVideoForm onCancel={onCancel} shortVideoToEdit={shortVideoToEdit} spaceId={space.id} saveShortVideoFn={upsertShortVideo} />;
}
