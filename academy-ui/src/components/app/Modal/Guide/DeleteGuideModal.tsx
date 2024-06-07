import Button from '@/components/core/buttons/Button';
import Input from '@/components/core/input/Input';
import SingleSectionModal from '@/components/core/modals/SingleSectionModal';
import { useState } from 'react';

export interface DeleteGuideModalProps {
  open: boolean;
  guideName: string;
  onClose: () => void;
  onDelete: () => void;
  deleting?: boolean;
}

export default function DeleteGuideModal({ open, onClose, guideName, deleting, onDelete }: DeleteGuideModalProps) {
  const [enterGuideName, setEnterGuideName] = useState('');
  return (
    <SingleSectionModal open={open} onClose={onClose} title={'Delete Guide'}>
      <div className="p-4">
        <Input modelValue={enterGuideName} maxLength={32} onUpdate={(e) => setEnterGuideName(e?.toString() || '')}>
          {`Type Guide Name "${guideName}"*`}
        </Input>
        <Button className="mt-4" disabled={enterGuideName !== guideName || deleting} onClick={onDelete} loading={deleting} variant="contained" primary>
          Delete Guide
        </Button>
      </div>
    </SingleSectionModal>
  );
}
