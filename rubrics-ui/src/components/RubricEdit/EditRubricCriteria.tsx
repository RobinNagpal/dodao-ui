import ConfirmationModal from '@/components/ConfirmationModal/ConfirmationModal';
import EditRubricCell from '@/components/RubricEdit/EditRubricCell';
import { RubricWithEntities } from '@/types/rubricsTypes/types';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import { RubricCriteria } from '@prisma/client';
import React, { useState } from 'react';
import SingleSectionModal from '@dodao/web-core/components/core/modals/SingleSectionModal';
export interface EditRubricCriteriaProps {
  criteria: RubricCriteria;
  rubric: RubricWithEntities;
  onCriteriaEdited: (criteria: RubricCriteria) => void;
}

const EditRubricCriteria: React.FC<EditRubricCriteriaProps> = ({ criteria, rubric, onCriteriaEdited }) => {
  const [isDeleteIconClicked, setIsDeleteIconClicked] = useState(false);
  const [isCriteriaModalOpen, setIsCriteriaModalOpen] = useState(false);
  const [updatedCriteriaDescription, setUpdatedCriteriaDescription] = useState(criteria.title);
  const { showNotification } = useNotificationContext();

  const deleteCriteria = async (criteriaId: string) => {
    const updatedRubric = await fetch(`${getBaseUrl()}/api/rubrics/${rubric.id}/criteria/${criteriaId}`, {
      method: 'DELETE',
    });

    if (updatedRubric.ok) {
      onCriteriaEdited(criteria);
    }
  };
  const handleCriteriaModalClose = () => {
    setIsCriteriaModalOpen(false);
  };

  const handleCriteriaSave = async () => {
    const response = await fetch(`${getBaseUrl()}/api/rubrics/${rubric.id}/criteria/${criteria.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newContent: updatedCriteriaDescription }),
    });

    if (response.ok) {
      const data = await response.json();
      setIsCriteriaModalOpen(false);
      showNotification({ type: 'success', message: data.message });
      onCriteriaEdited({ ...criteria, title: updatedCriteriaDescription });
    } else {
      const errorData = await response.json();
      showNotification({ type: 'error', message: errorData.error });
    }
  };

  return (
    <>
      <tr>
        <td className="py-2 px-4 border-r border-b font-bold cursor-pointer max-w-xs break-words">
          <div onClick={() => setIsCriteriaModalOpen(true)} className="overflow-y-auto max-h-24">
            {criteria.title}
          </div>
        </td>
        {rubric.levels.map((level, levelIndex) =>
          rubric.cells
            .filter((cell) => cell.criteriaId === criteria.id && cell.levelId === level.id)
            .map((cell, cellIndex) => (
              <EditRubricCell
                key={cell.id}
                rubric={rubric}
                cell={cell}
                criteria={criteria}
                cellIndex={cellIndex}
                onUpdated={() => onCriteriaEdited(criteria)}
              />
            ))
        )}

        <td>
          <button onClick={() => setIsDeleteIconClicked(true)}>
            <TrashIcon className="w-8 h-8 text-red-500 mx-auto" />
          </button>
        </td>
      </tr>
      <SingleSectionModal open={isCriteriaModalOpen} onClose={handleCriteriaModalClose} title="Edit Criteria">
        <textarea
          value={updatedCriteriaDescription}
          onChange={(e) => setUpdatedCriteriaDescription(e.target.value)}
          className="w-full p-4 border border-gray-300 rounded-xl shadow-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all duration-200 ease-in-out text-base placeholder-gray-500 bg-gradient-to-r from-white to-gray-50 hover:shadow-xl resize-none"
          rows={5}
          placeholder="Enter criteria description..."
        />
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            onClick={handleCriteriaSave}
          >
            Save
          </button>
        </div>
      </SingleSectionModal>
      <ConfirmationModal
        isOpen={isDeleteIconClicked}
        onClose={() => setIsDeleteIconClicked(false)}
        onConfirm={() => deleteCriteria(criteria.id)}
        message="Are you sure you want to select this cell?"
      />{' '}
    </>
  );
};

export default EditRubricCriteria;
