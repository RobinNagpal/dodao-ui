import React, { useState } from 'react';
import { RubricWithEntities } from '@/types/rubricsTypes/types';
import { RubricCell, RubricCriteria } from '@prisma/client';
import axios from 'axios';
import SingleSectionModal from '@dodao/web-core/components/core/modals/SingleSectionModal';

export interface EditRubricCellProps {
  rubric: RubricWithEntities;
  cell: RubricCell;
  criteria: RubricCriteria;
  cellIndex: number;
  onUpdated: (updatedCell: RubricCell) => void;
}

const EditRubricCell: React.FC<EditRubricCellProps> = ({ cell, criteria, cellIndex, onUpdated, rubric }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatedDescription, setUpdatedDescription] = useState(cell.description);

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleSave = async () => {
    try {
      const response = await axios.put(`/api/rubrics/${rubric.id}/cell/${cell.id}`, {
        description: updatedDescription,
      });

      const updatedCell = response.data as RubricCell;
      onUpdated(updatedCell);
      handleModalClose();
    } catch (error) {
      console.error('Error updating rubric cell:', error);
    }
  };

  return (
    <>
      <td className="py-2 px-4 border-r border-b cursor-pointer" onClick={handleModalOpen}>
        <div className="flex items-center overflow-y-auto max-h-26">
          <span className="flex-grow">{cell.description}</span>
        </div>
      </td>

      <SingleSectionModal open={isModalOpen} onClose={handleModalClose} title={`Edit ${criteria.title} - Cell ${cellIndex + 1}`}>
        <textarea value={updatedDescription} onChange={(e) => setUpdatedDescription(e.target.value)} className="w-full p-2 border rounded" rows={5} />
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
    </>
  );
};

export default EditRubricCell;
