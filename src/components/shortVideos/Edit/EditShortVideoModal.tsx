import FullPageModal from '@/components/core/modals/FullPageModal';
import EditShortVideoView from '@/components/shortVideos/Edit/EditShortVideoView';
import { ShortVideoInput, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import React from 'react';

export interface EditShortVideoModalProps {
  onClose: () => void;
  shortVideoToEdit?: ShortVideoInput;
  space: SpaceWithIntegrationsFragment;
  onSave: () => void;
}

export default function EditShortVideoModal({ onClose, shortVideoToEdit, space, onSave }: EditShortVideoModalProps) {
  return (
    <FullPageModal title="Edit Video" open={true} onClose={onClose} fullWidth={false}>
      <div className="p-8">
        <EditShortVideoView shortVideoToEdit={shortVideoToEdit} space={space} onSave={onSave} onCancel={() => onClose()} />
      </div>
    </FullPageModal>
  );
}
