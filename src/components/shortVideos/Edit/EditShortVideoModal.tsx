import FullScreenModal from '@/components/core/modals/FullScreenModal';
import EditShortVidesView from '@/components/shortVideos/Edit/EditShortVidesView';
import { ShortVideoInput, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import React from 'react';

export interface EditShortVideoModalProps {
  onClose: () => void;
  shortVideoToEdit?: ShortVideoInput;
  space: SpaceWithIntegrationsFragment;
}

export default function EditShortVideoModal({ onClose, shortVideoToEdit, space }: EditShortVideoModalProps) {
  return (
    <FullScreenModal title="Edit Video" open={true} onClose={onClose} fullWidth={false}>
      <EditShortVidesView onClose={onClose} shortVideoToEdit={shortVideoToEdit} space={space} />
    </FullScreenModal>
  );
}
