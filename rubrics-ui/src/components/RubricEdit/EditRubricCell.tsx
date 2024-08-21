import React, { useState } from 'react';
import { RubricWithEntities } from '@/types/rubricsTypes/types';
import { RubricCell, RubricCriteria } from '@prisma/client';
import SingleSectionModal from '@dodao/web-core/components/core/modals/SingleSectionModal';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
export interface EditRubricCellProps {
  rubric: RubricWithEntities;
  cell: RubricCell;
  criteria: RubricCriteria;
  cellIndex: number;
  onUpdated: (cell: RubricCell) => void;
}

const EditRubricCell: React.FC<EditRubricCellProps> = ({ cell, criteria, cellIndex, onUpdated, rubric }) => {
  const [isCellModalOpen, setIsCellModalOpen] = useState<boolean>(false);
  const [updatedCellDescription, setUpdatedCellDescription] = useState<string>(cell.description);
  const { showNotification } = useNotificationContext();

  const handleCellSave = async () => {
    const response = await fetch(`${getBaseUrl()}/api/rubrics/${rubric.id}/cell/${cell.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: updatedCellDescription,
      }),
    });
    if (response.ok) {
      showNotification({ type: 'success', message: 'Cell updated successfully' });
    } else {
      showNotification({ type: 'error', message: 'An error occured while updating cell' });
    }
    const updatedCell = (await response.json()) as RubricCell;
    onUpdated(updatedCell);
    setIsCellModalOpen(true);
  };

  return (
    <>
      <td className="py-2 px-4 border-r border-b cursor-pointer" onClick={() => setIsCellModalOpen(true)}>
        <div className="flex items-center overflow-y-auto max-h-26">
          <span className="flex-grow">{cell.description}</span>
        </div>
      </td>

      <SingleSectionModal open={isCellModalOpen} onClose={() => setIsCellModalOpen(false)} title="Edit Cell">
        <textarea
          value={updatedCellDescription}
          onChange={(e) => setUpdatedCellDescription(e.target.value)}
          className="w-full p-4 border border-gray-300 rounded-xl shadow-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all duration-200 ease-in-out text-base placeholder-gray-500 bg-gradient-to-r from-white to-gray-50 hover:shadow-xl"
          rows={5}
        />
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            onClick={handleCellSave}
          >
            Save
          </button>
        </div>
      </SingleSectionModal>
    </>
  );
};

export default EditRubricCell;
