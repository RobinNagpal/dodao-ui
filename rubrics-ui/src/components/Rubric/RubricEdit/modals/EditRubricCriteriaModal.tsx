import React, { useState } from 'react';
import SingleSectionModal from '@dodao/web-core/components/core/modals/SingleSectionModal';
import TextareaAutosize from '@dodao/web-core/components/core/textarea/TextareaAutosize';
import Button from '@dodao/web-core/components/core/buttons/Button';
interface EditRubricCriteriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTitle: string) => Promise<void>;
  title: string;
}

const EditRubricCriteriaModal: React.FC<EditRubricCriteriaModalProps> = ({ isOpen, onClose, onSave, title }) => {
  const [updatedTitle, setUpdatedTitle] = useState(title);

  const handleSave = async () => {
    await onSave(updatedTitle);
  };

  return (
    <SingleSectionModal open={isOpen} onClose={onClose} title="Edit Criteria">
      <TextareaAutosize
        label={updatedTitle}
        onUpdate={(value: string | number | undefined) => setUpdatedTitle(value as string)}
        className="w-full p-4 resize-none"
        rows={5}
        placeholder="Enter criteria description..."
      />
      <div className="mt-4 flex justify-end">
        <Button className="inline-flex justify-center" onClick={handleSave}>
          Save
        </Button>
      </div>
    </SingleSectionModal>
  );
};

export default EditRubricCriteriaModal;
