import FullScreenModal from '@/components/core/modals/FullScreenModal';
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
    <FullScreenModal title="Edit Video" open={true} onClose={onClose} fullWidth={false}>
      <EditShortVideoView shortVideoToEdit={shortVideoToEdit} space={space} onSave={onSave} onCancel={() => onClose()} />
    </FullScreenModal>
  );
}
