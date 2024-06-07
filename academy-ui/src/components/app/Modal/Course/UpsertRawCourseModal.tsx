import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import StyledSelect from '@dodao/web-core/components/core/select/StyledSelect';
import { RawGitCourse } from '@/graphql/generated/generated-types';
import { PublishStatus } from '@dodao/web-core/types/deprecated/models/enums';
import { publishStatusesSelect } from '@dodao/web-core/utils/ui/statuses';
import React, { useState } from 'react';

export interface AddRawCourseModalProps {
  open: boolean;
  onUpsertRawCourse: (repoUrl: string, publishStatus: PublishStatus, weight: number) => void;
  rawGitCourse?: RawGitCourse;
  onClose: () => void;
}
export default function UpsertRawCourseModal({ open, onUpsertRawCourse, onClose, rawGitCourse }: AddRawCourseModalProps) {
  const [repoUrl, setRepoUrl] = useState(rawGitCourse?.courseRepoUrl || '');
  const [weight, setWeight] = useState(rawGitCourse?.weight || 50);
  const [publishStatus, setPublishStatus] = useState<PublishStatus>((rawGitCourse?.publishStatus as PublishStatus) || PublishStatus.Live);

  return (
    <FullPageModal open={open} onClose={onClose} title={'Upsert Course'}>
      <div className="text-left">
        <div className="m-4 space-y-2">
          <Input label={'Course Repo URL'} onUpdate={(repoUrl) => setRepoUrl(repoUrl?.toString() || '')} modelValue={repoUrl} />
          <Input label="Priority" number modelValue={weight} onUpdate={(e) => (typeof e === 'number' ? setWeight(e) : setWeight(0))} />
          <StyledSelect
            label="Publish Status *"
            selectedItemId={publishStatus}
            items={publishStatusesSelect}
            setSelectedItemId={(value) => setPublishStatus(value as PublishStatus)}
          />

          <Button onClick={() => onUpsertRawCourse(repoUrl, publishStatus, weight)} variant="contained" primary>
            {rawGitCourse ? 'Update' : 'Add'}
          </Button>
        </div>
      </div>
    </FullPageModal>
  );
}
