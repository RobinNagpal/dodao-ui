'use client';
import { RubricWithEntities } from '@/types/rubricsTypes/types';
import { RubricLevel } from '@prisma/client';
import React, { useState, useEffect } from 'react';
import LevelEditModal from '@/components/LevelEditModal/LevelEditModal';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
export interface EditRubricLevelProps {
  level: RubricLevel;
  levelIndex: number;
  onLevelChanged: (level: RubricLevel) => void;
  rubric: RubricWithEntities;
}
const EditRubricLevel: React.FC<EditRubricLevelProps> = ({ levelIndex, level, onLevelChanged, rubric }) => {
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);

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

  const handleLevelUpdate = async (updatedLevel: RubricLevel) => {
    const response = await fetch(`${getBaseUrl()}/api/rubrics/${rubric.id}/level/${updatedLevel.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        columnName: updatedLevel.columnName,
        score: updatedLevel.score,
        description: updatedLevel.description,
      }),
    });

    const updatedLevelResponse = await response.json();

    onLevelChanged(updatedLevelResponse);
  };

  return (
    <>
      <th className={`py-2 px-4 border-b cursor-pointer text-white ${getHeaderColorClass(levelIndex)}`} onClick={() => setIsLevelModalOpen(true)}>
        <div className="overflow-auto max-h-24">
          {level.columnName}
          <br />
        </div>
      </th>

      <LevelEditModal isOpen={isLevelModalOpen} onClose={() => setIsLevelModalOpen(false)} onSave={handleLevelUpdate} level={level} />
    </>
  );
};

export default EditRubricLevel;
