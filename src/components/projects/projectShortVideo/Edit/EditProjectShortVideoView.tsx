import EditShortVideoForm from '@/components/shortVideos/Edit/EditShortVideoForm';
import {
  ProjectFragment,
  ProjectShortVideo,
  ProjectShortVideoInput,
  SpaceWithIntegrationsFragment,
  useUpsertProjectShortVideoMutation,
} from '@/graphql/generated/generated-types';
import React from 'react';

export interface EditShortVideoModalProps {
  shortVideoToEdit?: ProjectShortVideo;
  space: SpaceWithIntegrationsFragment;
  project: ProjectFragment;
  onAfterSave: () => void;
  onCancel: () => void;
}

export default function EditProjectShortVideoView({ shortVideoToEdit, space, project, onCancel, onAfterSave }: EditShortVideoModalProps) {
  const [upsertShortVideoMutation] = useUpsertProjectShortVideoMutation();

  const upsertShortVideo = async (shortVideo: ProjectShortVideoInput) => {
    await upsertShortVideoMutation({
      variables: {
        input: {
          id: shortVideo.id,
          title: shortVideo.title,
          description: shortVideo.description,
          priority: shortVideo.priority,
          videoUrl: shortVideo.videoUrl,
          thumbnail: shortVideo.thumbnail,
        },
        projectId: project.id,
      },
      refetchQueries: ['ProjectShortVideos'],
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
