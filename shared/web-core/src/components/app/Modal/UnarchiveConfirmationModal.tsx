import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import SingleSectionModal from '@dodao/web-core/components/core/modals/SingleSectionModal';
import { useState } from 'react';

export interface UnarchiveCourseSubmissionModalProps {
  title: string;
  open: boolean;
  onClose: () => void;
  onUnarchive: () => void;
  unarchiving?: boolean;
  unarchiveButtonText?: string;
}

export default function UnarchiveConfirmationModal({ open, onClose, unarchiving, onUnarchive, title, unarchiveButtonText }: UnarchiveCourseSubmissionModalProps) {
  const [unarchiveMeText, setUnarchiveMeText] = useState('');
  return (
    <SingleSectionModal open={open} onClose={onClose} title={title}>
      <div className="p-4">
        <Input modelValue={unarchiveMeText} maxLength={32} onUpdate={(e) => setUnarchiveMeText(e?.toString() || '')} className="mb-4">
          {`Type "Unarchive Me" *`}
        </Input>
        <Button disabled={unarchiveMeText !== 'Unarchive Me' || unarchiving} onClick={onUnarchive} loading={unarchiving} variant="contained" primary>
          {unarchiveButtonText || title}
        </Button>
      </div>
    </SingleSectionModal>
  );
}
