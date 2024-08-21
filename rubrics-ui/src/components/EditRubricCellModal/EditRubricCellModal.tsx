import React, { useState } from 'react';
import SingleSectionModal from '@dodao/web-core/components/core/modals/SingleSectionModal';

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
      <textarea
        value={updatedDescription}
        onChange={(e) => setUpdatedDescription(e.target.value)}
        className="w-full p-4 border border-gray-300 rounded-xl shadow-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all duration-200 ease-in-out text-base placeholder-gray-500 bg-gradient-to-r from-white to-gray-50 hover:shadow-xl"
        rows={5}
      />
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          onClick={handleSaveClick}
        >
          Save
        </button>
      </div>
    </SingleSectionModal>
  );
};

export default EditCellModal;
