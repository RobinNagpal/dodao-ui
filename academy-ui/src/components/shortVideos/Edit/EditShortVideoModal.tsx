import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import EditShortVideoView from '@/components/shortVideos/Edit/EditShortVideoView';
import { ShortVideo, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import React from 'react';

export interface EditShortVideoModalProps {
  onClose: () => void;
  shortVideoToEdit?: ShortVideo;
  space: SpaceWithIntegrationsFragment;
  onSave: () => void;
}

export default function EditShortVideoModal({ onClose, shortVideoToEdit, space, onSave }: EditShortVideoModalProps) {
  return (
    <FullPageModal title="Edit Video" open={true} onClose={onClose} fullWidth={false}>
      <div className="p-8">
        <EditShortVideoView shortVideoToEdit={shortVideoToEdit} space={space} onAfterSave={onSave} onCancel={() => onClose()} />
      </div>
    </FullPageModal>
  );
}
