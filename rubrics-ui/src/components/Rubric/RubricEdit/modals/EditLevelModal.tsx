import { RubricLevel } from '@prisma/client';
import React, { useState } from 'react';
import SingleSectionModal from '@dodao/web-core/components/core/modals/SingleSectionModal';
import Button from '@dodao/web-core/components/core/buttons/Button';
import TextareaAutosize from '@dodao/web-core/components/core/textarea/TextareaAutosize';
import Input from '@dodao/web-core/components/core/input/Input';
interface EditLevelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedLevel: RubricLevel) => Promise<void>;
  level: RubricLevel;
}

const EditLevelModal: React.FC<EditLevelModalProps> = ({ level, isOpen, onClose, onSave }) => {
  const [updatedLevel, setUpdatedLevel] = useState(level);

  const handleSave = async () => {
    await onSave(updatedLevel);
    onClose();
  };

  const handleChange = (key: string, value: string | number) => {
    setUpdatedLevel((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  return (
    <SingleSectionModal open={isOpen} onClose={onClose} title="Edit Level">
      <div className="mb-4">
        <Input
          modelValue={updatedLevel.columnName}
          onUpdate={(value: string | number | undefined) => handleChange('columnName', value as string)}
          className="w-full  rounded-md p-2"
          label="Column Name:"
        />
      </div>
      <div className="mb-4">
        <Input
          modelValue={updatedLevel.score}
          onUpdate={(value: string | number | undefined) => handleChange('score', parseInt(value as string))}
          className="w-full p-2"
          label="Score:"
        />
      </div>
      <div className="mb-4">
        <TextareaAutosize
          modelValue={updatedLevel.description || ''}
          label="Description:"
          onUpdate={(value: string | number | undefined) => handleChange('description', value as string)}
          className="w-full p-2"
        />
      </div>
      <div className="flex justify-center">
        <Button onClick={handleSave} primary variant="contained" className="mr-2">
          Save
        </Button>
      </div>
    </SingleSectionModal>
  );
};

export default EditLevelModal;
