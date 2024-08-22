import React, { useState } from 'react';
import SingleSectionModal from '@dodao/web-core/components/core/modals/SingleSectionModal';
import Button from '@dodao/web-core/components/core/buttons/Button';
import TextareaAutosize from '@dodao/web-core/components/core/textarea/TextareaAutosize';
interface EditCellModalProps {
  isOpen: boolean;
  onClose: () => void;
  description: string;
  onSave: (updatedDescription: string) => void;
}

const EditCellModal: React.FC<EditCellModalProps> = ({ isOpen, onClose, description, onSave }) => {
  const [updatedDescription, setUpdatedDescription] = useState<string>(description);

  const handleSaveClick = () => {
    onSave(updatedDescription);
    onClose();
  };

  return (
    <SingleSectionModal open={isOpen} onClose={onClose} title="Edit Cell">
      <TextareaAutosize
        modelValue={updatedDescription}
        label=""
        onUpdate={(value: string | number | undefined) => setUpdatedDescription(value as string)}
        className="w-full p-4"
        rows={5}
      />

      <div className="mt-4 flex justify-end">
        <Button type="button" className="justify-center" onClick={handleSaveClick}>
          Save
        </Button>
      </div>
    </SingleSectionModal>
  );
};

export default EditCellModal;
