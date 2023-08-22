import Button from '@/components/core/buttons/Button';
import Input from '@/components/core/input/Input';
import FullScreenModal from '@/components/core/modals/FullScreenModal';
import { SpaceLoadersInfo, SpaceLoadersInfoInput } from '@/graphql/generated/generated-types';
import React, { useState } from 'react';

export interface UpsertSpaceLoadersInfoModalProps {
  open: boolean;
  onUpsert: (loaderInfos: SpaceLoadersInfoInput) => void;
  loadersInfo?: SpaceLoadersInfo;
  onClose: () => void;
}
export default function UpsertSpaceLoadersInfoModal({ open, onUpsert, onClose, loadersInfo }: UpsertSpaceLoadersInfoModalProps) {
  const [discourseUrl, setDiscourseUrl] = useState(loadersInfo?.discourseUrl || '');

  return (
    <FullScreenModal open={open} onClose={onClose} title={'Space Loaders'}>
      <div className="text-left">
        <div className="m-4 space-y-2">
          <Input label={'Discourse Url'} onUpdate={(repoUrl) => setDiscourseUrl(repoUrl?.toString() || '')} modelValue={discourseUrl} />

          <Button
            onClick={() =>
              onUpsert({
                discourseUrl: discourseUrl,
              })
            }
            variant="contained"
            primary
          >
            Upsert
          </Button>
        </div>
      </div>
    </FullScreenModal>
  );
}
