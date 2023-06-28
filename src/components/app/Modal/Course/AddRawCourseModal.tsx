import Button from '@/components/core/buttons/Button';
import Input from '@/components/core/input/Input';
import FullScreenModal from '@/components/core/modals/FullScreenModal';
import StyledSelect from '@/components/core/select/StyledSelect';
import { PublishStatus } from '@/types/deprecated/models/enums';
import { publishStatusesSelect } from '@/utils/ui/statuses';
import React, { useState } from 'react';

export interface AddRawCourseModalProps {
  open: boolean;
  onAddRawCourse: (repoUrl: string, publishStatus: PublishStatus, weight: number) => void;
  onClose: () => void;
}
export default function AddRawCourseModal({ open, onAddRawCourse, onClose }: AddRawCourseModalProps) {
  const [repoUrl, setRepoUrl] = useState('');
  const [weight, setWeight] = useState(50);
  const [publishStatus, setPublishStatus] = useState<PublishStatus>(PublishStatus.Live);

  return (
    <FullScreenModal open={open} onClose={onClose} title={'Add Raw Course'}>
      <div className="text-left">
        <h3 className=" p-4 text-center font-bold text-2xl">Add Raw Course</h3>
        <div className="m-4 space-y-2">
          <Input label={'Course Repo URL'} onUpdate={(repoUrl) => setRepoUrl(repoUrl?.toString() || '')} modelValue={repoUrl} />
          <Input label="Priority" number modelValue={weight} onUpdate={(e) => (typeof e === 'number' ? setWeight(e) : setWeight(0))} />
          <StyledSelect
            label="Publish Status *"
            selectedItemId={publishStatus}
            items={publishStatusesSelect}
            setSelectedItemId={(value) => setPublishStatus(value as PublishStatus)}
          />
          <Button onClick={() => onAddRawCourse(repoUrl, publishStatus, weight)} variant="contained" primary>
            Add
          </Button>
        </div>
      </div>
    </FullScreenModal>
  );
}
