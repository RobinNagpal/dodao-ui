import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import EditProjectShortVideoView from '@/components/projects/projectShortVideo/Edit/EditProjectShortVideoView';
import { ProjectFragment, ProjectShortVideo, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import React from 'react';

export interface EditShortVideoModalProps {
  onClose: () => void;
  shortVideoToEdit?: ProjectShortVideo;
  space: SpaceWithIntegrationsFragment;
  onAfterSave: () => void;
  project: ProjectFragment;
}

export default function EditProjectShortVideoModal({ onClose, project, shortVideoToEdit, space, onAfterSave }: EditShortVideoModalProps) {
  return (
    <FullPageModal title="Edit Video" open={true} onClose={onClose} fullWidth={false}>
      <div className="p-8">
        <EditProjectShortVideoView project={project} shortVideoToEdit={shortVideoToEdit} space={space} onAfterSave={onAfterSave} onCancel={() => onClose()} />
      </div>
    </FullPageModal>
  );
}
