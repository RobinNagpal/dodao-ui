import React, { useState } from 'react';
import { RubricWithEntities } from '@/types/rubricsTypes/types';
import { RubricCell, RubricCriteria } from '@prisma/client';
import EditCellModal from '@/components/Rubric/RubricEdit/modals/EditRubricCellModal';
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
  const { showNotification } = useNotificationContext();

  const handleCellSave = async (updatedCellDescription: string) => {
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
      const updatedCell = (await response.json()) as RubricCell;
      onUpdated(updatedCell);
    } else {
      showNotification({ type: 'error', message: 'An error occurred while updating cell' });
    }
  };

  return (
    <>
      <td className="py-2 px-4 border-r border-b cursor-pointer" onClick={() => setIsCellModalOpen(true)}>
        <div className="flex items-center overflow-y-auto max-h-26">
          <span className="flex-grow">{cell.description}</span>
        </div>
      </td>

      <EditCellModal isOpen={isCellModalOpen} onClose={() => setIsCellModalOpen(false)} description={cell.description} onSave={handleCellSave} />
    </>
  );
};

export default EditRubricCell;
