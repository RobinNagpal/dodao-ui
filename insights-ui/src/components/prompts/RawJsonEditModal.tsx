import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import TextareaAutosize from '@dodao/web-core/components/core/textarea/TextareaAutosize';
import Button from '@dodao/web-core/components/core/buttons/Button';
import React, { useEffect, useState } from 'react';

export interface RawJsonEditModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  sampleJson?: any;
  onSave?: (json: string) => void;
}

export default function RawJsonEditModal({ open, onClose, title, sampleJson: jsonObj, onSave }: RawJsonEditModalProps) {
  const [rawJson, setRawJson] = useState<string>(jsonObj ? JSON.stringify(jsonObj, null, 2) : '{}');
  const [isValid, setIsValid] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Validate JSON whenever rawJson changes
  useEffect(() => {
    try {
      if (rawJson.trim() === '') {
        setIsValid(false);
        setErrorMessage('JSON cannot be empty');
        return;
      }

      JSON.parse(rawJson);
      setIsValid(true);
      setErrorMessage('');
    } catch (error) {
      setIsValid(false);
      setErrorMessage(error instanceof Error ? error.message : 'Invalid JSON format');
    }
  }, [rawJson]);

  const handleSave = () => {
    if (!isValid) return;

    try {
      const parsedJson = JSON.parse(rawJson);
      onSave?.(JSON.stringify(parsedJson));
      onClose();
    } catch (error) {
      console.error('Invalid JSON:', error);
    }
  };

  return (
    <FullPageModal open={open} onClose={onClose} title={title}>
      <div className="flex flex-col h-[calc(100vh-120px)] p-4">
        <div className="flex-1 overflow-hidden">
          <TextareaAutosize
            label={''}
            modelValue={rawJson || '{}'}
            onUpdate={(val) => setRawJson(val as string)}
            className="h-full w-full font-mono text-sm resize-none pb-4"
            fillParent={true}
          />
        </div>

        {!isValid && <div className="mt-2 text-red-500 text-sm">{errorMessage}</div>}

        <div className="flex justify-end mt-4 pt-4 border-t border-gray-200">
          <Button onClick={handleSave} primary variant="contained" disabled={!isValid}>
            Save
          </Button>
        </div>
      </div>
    </FullPageModal>
  );
}
