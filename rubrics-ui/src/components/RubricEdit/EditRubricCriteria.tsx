import ConfirmationModal from '@/components/ConfirmationModal/ConfirmationModal';
import EditRubricCell from '@/components/RubricEdit/EditRubricCell';
import { RubricWithEntities } from '@/types/rubricsTypes/types';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import { RubricCriteria } from '@prisma/client';
import React, { useState } from 'react';
import EditRubricCriteriaModal from '@/components/EditRubricCriteriaModal/EditRubricCriteriaModal';

export interface EditRubricCriteriaProps {
  criteria: RubricCriteria;
  rubric: RubricWithEntities;
  onCriteriaEdited: (criteria: RubricCriteria) => void;
}

const EditRubricCriteria: React.FC<EditRubricCriteriaProps> = ({ criteria, rubric, onCriteriaEdited }) => {
  const [isDeleteIconClicked, setIsDeleteIconClicked] = useState(false);
  const [isCriteriaModalOpen, setIsCriteriaModalOpen] = useState(false);
  const { showNotification } = useNotificationContext();

  const deleteCriteria = async (criteriaId: string) => {
    const updatedRubric = await fetch(`${getBaseUrl()}/api/rubrics/${rubric.id}/criteria/${criteriaId}`, {
      method: 'DELETE',
    });

    if (updatedRubric.ok) {
      onCriteriaEdited(criteria);
    }
  };

  const handleCriteriaSave = async (updatedTitle: string) => {
    const response = await fetch(`${getBaseUrl()}/api/rubrics/${rubric.id}/criteria/${criteria.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newContent: updatedTitle }),
    });

    if (response.ok) {
      const data = await response.json();
      setIsCriteriaModalOpen(false);
      showNotification({ type: 'success', message: data.message });
      onCriteriaEdited({ ...criteria, title: updatedTitle });
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

      {/* Using the EditRubricCriteriaModal component */}
      <EditRubricCriteriaModal
        isOpen={isCriteriaModalOpen}
        onClose={() => setIsCriteriaModalOpen(false)}
        onSave={handleCriteriaSave}
        initialTitle={criteria.title}
      />

      <ConfirmationModal
        isOpen={isDeleteIconClicked}
        onClose={() => setIsDeleteIconClicked(false)}
        onConfirm={() => deleteCriteria(criteria.id)}
        message="Are you sure you want to delete this criteria?"
      />
    </>
  );
};

export default EditRubricCriteria;
