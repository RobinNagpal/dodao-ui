import React from 'react';
import Button from '@dodao/web-core/components/core/buttons/Button';
import styles from './FormFooter.module.scss';

interface FormFooterProps {
  saveButtonText: string;
  onSave: () => void;
  onSaveLoading: boolean;
  cancelButtonText?: string;
  onCancel?: () => void;
}

export const FormFooter = ({ saveButtonText, onSave, onSaveLoading, cancelButtonText, onCancel }: FormFooterProps) => {
  return (
    <div className="pt-12 pb-6">
      <div className="border-t border-gray-900/10">
        <div className="mt-6 flex items-center justify-end gap-x-2">
          {cancelButtonText && onCancel && (
            <Button removeBorder className={`text-sm font-semibold ${styles.textColor}`} onClick={onCancel}>
              {cancelButtonText}
            </Button>
          )}
          <Button variant="contained" primary loading={onSaveLoading} onClick={onSave}>
            {saveButtonText}
          </Button>
        </div>
      </div>
    </div>
  );
};
