import React from 'react';
import Button from '@dodao/web-core/components/core/buttons/Button';

interface FormFooterProps {
  saveButtonText: string;
  onSave: () => void;
  onSaveLoading?: boolean;
  saveButtonDisabled?: boolean;
  cancelButtonText?: string;
  onCancel?: () => void;
}

export const FormFooter = ({ saveButtonText, onSave, onSaveLoading, cancelButtonText, onCancel }: FormFooterProps) => {
  return (
    <div className="my-6">
      <div className="border-t border-color">
        <div className="mt-6 flex items-center justify-end gap-x-2">
          {cancelButtonText && onCancel && <Button onClick={onCancel}>{cancelButtonText}</Button>}
          <Button variant="contained" primary loading={onSaveLoading} onClick={onSave}>
            {saveButtonText}
          </Button>
        </div>
      </div>
    </div>
  );
};
