import React, { useState } from 'react';
import SingleSectionModal from '@dodao/web-core/components/core/modals/SingleSectionModal';

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
      <textarea
        value={updatedTitle}
        onChange={(e) => setUpdatedTitle(e.target.value)}
        className="w-full p-4 border border-gray-300 rounded-xl shadow-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all duration-200 ease-in-out text-base placeholder-gray-500 bg-gradient-to-r from-white to-gray-50 hover:shadow-xl resize-none"
        rows={5}
        placeholder="Enter criteria description..."
      />
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          onClick={handleSave}
        >
          Save
        </button>
      </div>
    </SingleSectionModal>
  );
};

export default EditRubricCriteriaModal;
