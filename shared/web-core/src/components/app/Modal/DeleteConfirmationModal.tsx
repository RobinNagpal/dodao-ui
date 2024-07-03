import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import SingleSectionModal from '@dodao/web-core/components/core/modals/SingleSectionModal';
import { useState } from 'react';

export interface DeleteCourseSubmissionModalProps {
  title: string;
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  deleting?: boolean;
}

export default function DeleteConfirmationModal({ open, onClose, deleting, onDelete, title }: DeleteCourseSubmissionModalProps) {
  const [deleteMeText, setDeleteMeText] = useState('');
  return (
    <SingleSectionModal open={open} onClose={onClose} title={title}>
      <div className="p-4">
        <Input modelValue={deleteMeText} maxLength={32} onUpdate={(e) => setDeleteMeText(e?.toString() || '')} className="mb-4">
          {`Type "Delete Me" *`}
        </Input>
        <Button disabled={deleteMeText !== 'Delete Me' || deleting} onClick={onDelete} loading={deleting} variant="contained" primary>
          {title}
        </Button>
      </div>
    </SingleSectionModal>
  );
}
