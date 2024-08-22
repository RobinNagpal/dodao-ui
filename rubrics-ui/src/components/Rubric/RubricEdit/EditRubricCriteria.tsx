import EditRubricCriteriaModal from '@/components/Rubric/RubricEdit/modals/EditRubricCriteriaModal';
import EditRubricCell from '@/components/Rubric/RubricEdit/EditRubricCell';
import { RubricWithEntities } from '@/types/rubricsTypes/types';
import DeleteConfirmationModal from '@dodao/web-core/components/app/Modal/DeleteConfirmationModal';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import { RubricCriteria } from '@prisma/client';
import React, { useState } from 'react';

export interface EditRubricCriteriaProps {
  criteria: RubricCriteria;
  rubric: RubricWithEntities;
  onCriteriaEdited: (criteria: RubricCriteria) => void;
}

const EditRubricCriteria: React.FC<EditRubricCriteriaProps> = ({ criteria, rubric, onCriteriaEdited }) => {
  const [isDeleteIconClicked, setIsDeleteIconClicked] = useState(false);
  const [isCriteriaModalOpen, setIsCriteriaModalOpen] = useState(false);
  const [deletingCriteria, setDeletingCriteria] = useState(false);
  const { showNotification } = useNotificationContext();

  const deleteCriteria = async (criteriaId: string) => {
    setDeletingCriteria(true);
    const updatedRubric = await fetch(`${getBaseUrl()}/api/rubrics/${rubric.id}/criteria/${criteriaId}`, {
      method: 'DELETE',
    });

    if (updatedRubric.ok) {
      onCriteriaEdited(criteria);
    }

    setDeletingCriteria(false);
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

      <EditRubricCriteriaModal isOpen={isCriteriaModalOpen} onClose={() => setIsCriteriaModalOpen(false)} onSave={handleCriteriaSave} title={criteria.title} />

      <DeleteConfirmationModal
        title={'Delete Criteria'}
        open={isDeleteIconClicked}
        onClose={() => setIsDeleteIconClicked(false)}
        onDelete={() => deleteCriteria(criteria.id)}
        deleting={deletingCriteria}
      />
    </>
  );
};

export default EditRubricCriteria;
