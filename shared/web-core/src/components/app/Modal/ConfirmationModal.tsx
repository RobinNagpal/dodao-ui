'use client';

import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import SingleSectionModal from '@dodao/web-core/components/core/modals/SingleSectionModal';
import { useState } from 'react';

export interface ConfirmationModalProps {
  title: string;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  confirming?: boolean;
  confirmationText: string;
  askForTextInput: boolean;
  showSemiTransparentBg?: boolean;
}

export default function ConfirmationModal({
  open,
  onClose,
  onConfirm,
  confirmationText,
  confirming,
  title,
  askForTextInput,
  showSemiTransparentBg,
}: ConfirmationModalProps) {
  const [confirmInputText, setConfirmInputText] = useState('');
  return (
    <SingleSectionModal open={open} onClose={onClose} title={title} showSemiTransparentBg={showSemiTransparentBg}>
      <div className="p-4">
        <p className="my-4">{confirmationText}</p>
        {askForTextInput && (
          <Input modelValue={confirmInputText} maxLength={32} onUpdate={(e) => setConfirmInputText(e?.toString() || '')} className="mb-4">
            {`Type "Confirm" *`}
          </Input>
        )}
        <Button disabled={askForTextInput && confirmInputText !== 'Confirm'} onClick={onConfirm} loading={confirming} variant="contained" primary>
          Confirm
        </Button>
      </div>
    </SingleSectionModal>
  );
}
