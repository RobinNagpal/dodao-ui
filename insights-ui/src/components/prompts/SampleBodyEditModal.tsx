import Button from '@dodao/web-core/components/core/buttons/Button';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import TextareaAutosize from '@dodao/web-core/components/core/textarea/TextareaAutosize';
import React, { useEffect, useState } from 'react';

interface SampleBodyEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (value: string) => void;
  initialValue?: string;
}

export default function SampleBodyEditModal({ isOpen, onClose, onSave, initialValue = '' }: SampleBodyEditModalProps) {
  const [bodyText, setBodyText] = useState(initialValue);

  useEffect(() => {
    setBodyText(initialValue);
  }, [initialValue]);

  const handleSave = () => {
    onSave(bodyText);
    onClose();
  };

  return (
    <FullPageModal open={isOpen} onClose={onClose} title={'Edit Sample Body'}>
      <div className="flex flex-col h-[calc(100vh-120px)] p-4">
        <div className="flex-1 overflow-hidden">
          <TextareaAutosize
            label={''}
            modelValue={bodyText || ''}
            onUpdate={(val) => setBodyText(val as string)}
            className="h-full w-full font-mono text-sm resize-none pb-4"
            fillParent={true}
          />
        </div>

        <div className="flex justify-end mt-4 pt-4 border-t border-gray-200">
          <Button onClick={handleSave} primary variant="contained">
            Save
          </Button>
        </div>
      </div>
    </FullPageModal>
  );
}
