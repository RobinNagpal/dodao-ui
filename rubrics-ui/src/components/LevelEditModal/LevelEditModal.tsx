import { RubricLevel } from '@prisma/client';
import React, { useState } from 'react';
import SingleSectionModal from '@dodao/web-core/components/core/modals/SingleSectionModal';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedLevel: RubricLevel) => Promise<void>;
  level: RubricLevel;
}

const EditLevelModal: React.FC<ModalProps> = ({ isOpen, onClose, onSave, level }) => {
  const [updateLevel, setUpdateLevel] = useState<RubricLevel>(level);

  const handleSave = async () => {
    await onSave(updateLevel);
    onClose();
  };

  return (
    <SingleSectionModal open={isOpen} onClose={onClose} title="Edit Level">
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Column Name:</label>
        <input
          type="text"
          value={updateLevel?.columnName}
          onChange={(e) => setUpdateLevel({ ...updateLevel, columnName: e.target.value })}
          className="w-full border rounded-md p-2"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Score:</label>
        <input
          type="number"
          min={0}
          max={10}
          value={updateLevel?.score || 1}
          onChange={(e) => setUpdateLevel({ ...updateLevel, score: parseInt(e.target.value) })}
          className="w-full border rounded-md p-2"
        />
      </div>
      <div className="flex justify-center">
        <button onClick={handleSave} className="bg-blue-500 text-white py-2 px-4 rounded-full mr-2">
          Save
        </button>
      </div>
    </SingleSectionModal>
  );
};

export default EditLevelModal;
