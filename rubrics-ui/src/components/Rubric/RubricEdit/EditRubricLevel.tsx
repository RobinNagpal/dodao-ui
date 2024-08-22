import React, { useState } from 'react';
import { RubricWithEntities } from '@/types/rubricsTypes/types';
import { RubricLevel } from '@prisma/client';
import EditLevelModal from '@/components/Rubric/RubricEdit/modals/EditLevelModal';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

export interface EditRubricLevelProps {
  level: RubricLevel;
  levelIndex: number;
  onLevelChanged: (level: RubricLevel) => void;
  rubric: RubricWithEntities;
}

const EditRubricLevel: React.FC<EditRubricLevelProps> = ({ levelIndex, level, onLevelChanged, rubric }) => {
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  const { showNotification } = useNotificationContext();

  const getHeaderColorClass = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-green-500';
      case 1:
        return 'bg-yellow-400';
      case 2:
        return 'bg-yellow-600';
      case 3:
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const handleLevelSave = async (updatedProps: { columnName: string; score: number; description: string }) => {
    const response = await fetch(`${getBaseUrl()}/api/rubrics/${rubric.id}/level/${level.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedProps),
    });

    if (response.ok) {
      showNotification({ type: 'success', message: 'Level updated successfully' });
      onLevelChanged({ ...level, ...updatedProps });
    } else {
      showNotification({ type: 'error', message: 'An error occurred while updating level' });
    }
  };

  return (
    <>
      <th className={`py-2 px-4 border-b cursor-pointer text-white ${getHeaderColorClass(levelIndex)}`} onClick={() => setIsLevelModalOpen(true)}>
        <div className="overflow-auto max-h-24">
          {level.columnName}
          <br />
        </div>
      </th>

      <EditLevelModal
        isOpen={isLevelModalOpen}
        onClose={() => setIsLevelModalOpen(false)}
        columnName={level.columnName}
        score={level.score}
        description={level.description || ''}
        onSave={handleLevelSave}
      />
    </>
  );
};

export default EditRubricLevel;
