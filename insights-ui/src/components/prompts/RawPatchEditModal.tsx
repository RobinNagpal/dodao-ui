import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import TextareaAutosize from '@dodao/web-core/components/core/textarea/TextareaAutosize';
import Button from '@dodao/web-core/components/core/buttons/Button';
import React, { useEffect, useState } from 'react';
import { Prisma } from '@prisma/client';

export interface RawPatchEditModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  sampleJson?: any;
  onSave: (patch: Prisma.JsonValue) => void;
}

export default function RawPatchEditModal({ open, onClose, title, sampleJson, onSave }: RawPatchEditModalProps) {
  // Use a function to initialize rawJson
  const getInitialJson = (): string => {
    if (!sampleJson) return '';
    // If sampleJson is a string, try to parse it to be safe
    if (typeof sampleJson === 'string') {
      try {
        const parsed = JSON.parse(sampleJson);
        return JSON.stringify(parsed, null, 2);
      } catch (error) {
        console.log('Error parsing JSON string:', error);
        return sampleJson; // Fallback to original string if parsing fails
      }
    } else {
      // If it's already an object/array, stringify it
      return JSON.stringify(sampleJson, null, 2);
    }
  };

  const [rawJson, setRawJson] = useState<string>(getInitialJson());
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
      onSave(parsedJson);
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
            modelValue={rawJson || ''}
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
